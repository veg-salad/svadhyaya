import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';
import type { Request } from 'express';

interface AuthenticatedRequest extends Request {
  user?: JWTPayload & { email?: string; name?: string };
}

/**
 * Guards routes with a Cognito access-token check. Fetches JWKS lazily and
 * caches it. Verifies signature, issuer, token_use, and (for access tokens)
 * client_id or (for id tokens) audience.
 */
@Injectable()
export class CognitoAuthGuard implements CanActivate {
  private readonly logger = new Logger(CognitoAuthGuard.name);
  private readonly issuer: string;
  private readonly clientId: string;
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  /**
   * Reads Cognito pool + client config and builds a remote JWKS resolver.
   * @param config Nest ConfigService.
   */
  constructor(private readonly config: ConfigService) {
    const region =
      this.config.get<string>('COGNITO_REGION') ||
      this.config.get<string>('AWS_REGION') ||
      'ap-south-1';
    const poolId = this.config.get<string>('COGNITO_USER_POOL_ID');
    const clientId = this.config.get<string>('COGNITO_CLIENT_ID');
    if (!poolId || !clientId) {
      throw new Error(
        'COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID must be set in .env',
      );
    }
    this.clientId = clientId;
    this.issuer = `https://cognito-idp.${region}.amazonaws.com/${poolId}`;
    this.jwks = createRemoteJWKSet(new URL(`${this.issuer}/.well-known/jwks.json`));
  }

  /**
   * Extracts the bearer token, verifies it, and attaches claims to req.user.
   * @param ctx Nest execution context.
   */
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = req.headers['authorization'];
    if (!header || Array.isArray(header) || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token.');
    }
    const token = header.slice('Bearer '.length).trim();
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
      });
      const tokenUse = payload['token_use'];
      if (tokenUse === 'id') {
        if (payload.aud !== this.clientId) {
          throw new Error('Wrong audience.');
        }
      } else if (tokenUse === 'access') {
        if (payload['client_id'] !== this.clientId) {
          throw new Error('Wrong client_id.');
        }
      } else {
        throw new Error('Unexpected token_use.');
      }
      req.user = payload as AuthenticatedRequest['user'];
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'invalid token';
      this.logger.warn(`Rejected token: ${msg}`);
      throw new UnauthorizedException('Invalid or expired token.');
    }
  }
}

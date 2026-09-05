import { readdirSync, statSync, createWriteStream } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const backendRoot = join(here, '..');
const dist = join(backendRoot, 'dist-lambda');
const zipPath = join(backendRoot, 'lambda.zip');

// Use PowerShell's Compress-Archive on Windows because there's no `zip` on Windows PATH by default.
if (process.platform === 'win32') {
  const args = [
    '-NoProfile',
    '-Command',
    `if (Test-Path '${zipPath}') { Remove-Item '${zipPath}' -Force }; Compress-Archive -Path '${dist}\\*' -DestinationPath '${zipPath}' -Force`,
  ];
  const r = spawnSync('powershell', args, { stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
} else {
  const r = spawnSync('zip', ['-r', zipPath, '.'], { cwd: dist, stdio: 'inherit' });
  if (r.status !== 0) process.exit(r.status ?? 1);
}

const size = statSync(zipPath).size;
console.log(`Packaged ${relative(backendRoot, zipPath)} (${(size / 1024).toFixed(1)} KB)`);

#requires -Version 5.1
<#
Deploys Svadhyaya API to AWS Lambda + HTTP API Gateway using CloudFormation
(SAM transform). Uploads the built Lambda bundle to an S3 artifact bucket and
updates the CloudFormation stack in place.

Prerequisites:
- AWS credentials configured (profile 'dev' by default, region ap-south-1).
- Backend built: `npm run build:lambda && npm run package:lambda`.
- OpenAI API key available (either in backend/.env as OPENAI_API_KEY, or
  passed with -OpenAIApiKey).

Usage from backend/:
  ..\scripts\deploy-lambda.ps1
  ..\scripts\deploy-lambda.ps1 -Region us-east-1 -Profile prod
#>
param(
  [string]$Region  = 'ap-south-1',
  [string]$Profile = 'dev',
  [string]$Stack   = 'svadhyaya-api',
  [string]$OpenAIApiKey,
  [string]$AllowedOrigins = 'http://localhost:5173,http://127.0.0.1:5173'
)

$ErrorActionPreference = 'Stop'

$aws = 'C:\Users\UAA78H\Documents\Product\.tools\aws-cli\aws.exe'
if (-not (Test-Path $aws)) { $aws = 'aws' } # fall back to PATH

$env:AWS_SHARED_CREDENTIALS_FILE = 'C:\Users\UAA78H\Documents\Product\.aws\credentials'
$env:AWS_CONFIG_FILE             = 'C:\Users\UAA78H\Documents\Product\.aws\config'
$env:AWS_PROFILE                 = $Profile
$env:AWS_REGION                  = $Region

$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root 'backend'
Push-Location $backend
try {
  Write-Host "== Building lambda bundle =="
  & 'C:\Users\UAA78H\Documents\Product\.tools\node\npm.cmd' run build:lambda
  if ($LASTEXITCODE -ne 0) { throw "esbuild failed" }
  & 'C:\Users\UAA78H\Documents\Product\.tools\node\npm.cmd' run package:lambda
  if ($LASTEXITCODE -ne 0) { throw "package failed" }

  if (-not $OpenAIApiKey) {
    $envLine = Get-Content .\.env | Where-Object { $_ -match '^OPENAI_API_KEY=' } | Select-Object -First 1
    if ($envLine) { $OpenAIApiKey = ($envLine -split '=', 2)[1].Trim() }
  }
  if (-not $OpenAIApiKey) { throw "OPENAI_API_KEY not found. Pass -OpenAIApiKey or set it in backend/.env." }

  $identity = (& $aws sts get-caller-identity --output json | ConvertFrom-Json)
  $accountId = $identity.Account
  $bucket = "svadhyaya-lambda-artifacts-$accountId-$Region"

  Write-Host "== Ensuring artifact bucket $bucket =="
  $exists = $true
  try {
    & $aws s3api head-bucket --bucket $bucket 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) { $exists = $false }
  } catch { $exists = $false }
  if (-not $exists) {
    if ($Region -eq 'us-east-1') {
      & $aws s3api create-bucket --bucket $bucket --region $Region | Out-Null
    } else {
      & $aws s3api create-bucket --bucket $bucket --region $Region --create-bucket-configuration "LocationConstraint=$Region" | Out-Null
    }
    & $aws s3api put-public-access-block --bucket $bucket --public-access-block-configuration 'BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true' | Out-Null
  }

  Write-Host "== Packaging CloudFormation template =="
  & $aws cloudformation package `
      --template-file template.yaml `
      --s3-bucket $bucket `
      --s3-prefix $Stack `
      --output-template-file .packaged.yaml
  if ($LASTEXITCODE -ne 0) { throw "cloudformation package failed" }

  Write-Host "== Deploying stack $Stack =="
  & $aws cloudformation deploy `
      --template-file .packaged.yaml `
      --stack-name $Stack `
      --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND `
      --parameter-overrides "OpenAIApiKey=$OpenAIApiKey" "AllowedOrigins=$AllowedOrigins"
  if ($LASTEXITCODE -ne 0) { throw "cloudformation deploy failed" }

  Write-Host "== Fetching outputs =="
  $stack = & $aws cloudformation describe-stacks --stack-name $Stack --output json | ConvertFrom-Json
  $stack.Stacks[0].Outputs | ForEach-Object { Write-Host "  $($_.OutputKey) = $($_.OutputValue)" }
} finally {
  Pop-Location
}

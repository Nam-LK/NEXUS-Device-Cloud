<# Chạy toàn bộ kiểm thử: backend (JUnit), frontend (Vitest + typecheck + build) và kiểm tra cú pháp Docker Compose. #>
. "$PSScriptRoot\common.ps1"
Set-Location $RepoRoot
Import-DotEnv

Write-Step 'Kiểm tra docker-compose.yml'
docker compose config --quiet
if ($LASTEXITCODE -ne 0) { throw 'docker-compose.yml không hợp lệ.' }
Write-Ok 'docker-compose.yml hợp lệ'

Write-Step 'Backend: mvn test'
$mvn = Get-MavenCommand
& $mvn -f (Join-Path $RepoRoot 'backend\pom.xml') test
if ($LASTEXITCODE -ne 0) { throw 'Backend test thất bại.' }

Push-Location (Join-Path $RepoRoot 'frontend')
try {
    if (-not (Test-Path -LiteralPath 'node_modules')) { npm install; if ($LASTEXITCODE -ne 0) { throw 'npm install thất bại.' } }
    Write-Step 'Frontend: vitest'
    npm run test
    if ($LASTEXITCODE -ne 0) { throw 'Frontend test thất bại.' }
    Write-Step 'Frontend: typecheck + build'
    npm run build
    if ($LASTEXITCODE -ne 0) { throw 'Frontend build thất bại.' }
} finally { Pop-Location }

Write-Ok 'Tất cả kiểm thử đã chạy xong và đều đạt.'

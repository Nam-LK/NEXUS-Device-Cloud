<# Chạy backend Spring Boot ở http://localhost:8080 (giữ cửa sổ này mở). Dừng bằng Ctrl+C. #>
. "$PSScriptRoot\common.ps1"
Set-Location $RepoRoot

Import-DotEnv
$mvn = Get-MavenCommand

Write-Step 'Chạy backend (lần đầu Maven sẽ tải thư viện, có thể mất vài phút)'
& $mvn -f (Join-Path $RepoRoot 'backend\pom.xml') spring-boot:run

<#
  Kiểm tra công cụ cần thiết và tạo file .env (kèm mật khẩu ngẫu nhiên) nếu chưa có.
  Chạy từ thư mục gốc dự án:  .\scripts\setup.ps1
#>
. "$PSScriptRoot\common.ps1"

Write-Step 'Kiểm tra công cụ'
$problems = 0

$javaOut = Get-ToolOutput 'java' @('-version')
if (-not $javaOut) { Write-Fail 'Chưa cài Java. Cài Eclipse Temurin JDK 21.'; $problems++ }
elseif ($javaOut -match 'version "(\d+)') {
    if ([int]$Matches[1] -ge 21) { Write-Ok "Java $($Matches[1])" }
    else { Write-Fail "Java $($Matches[1]) quá cũ, cần 21 trở lên."; $problems++ }
} else { Write-Fail 'Không đọc được phiên bản Java.'; $problems++ }

$nodeOut = Get-ToolOutput 'node' @('--version')
if (-not $nodeOut) { Write-Fail 'Chưa cài Node.js. Cài bản LTS từ nodejs.org.'; $problems++ }
elseif ($nodeOut -match 'v(\d+)') {
    if ([int]$Matches[1] -ge 20) { Write-Ok "Node.js $($nodeOut.Trim())" }
    else { Write-Fail "Node.js $($nodeOut.Trim()) quá cũ, cần v20 trở lên."; $problems++ }
}

if (Get-ToolOutput 'npm' @('--version')) { Write-Ok 'npm' } else { Write-Fail 'Chưa có npm (đi kèm Node.js).'; $problems++ }

$dockerOut = Get-ToolOutput 'docker' @('compose', 'version')
if ($dockerOut -match 'Docker Compose') { Write-Ok $dockerOut.Trim() }
else { Write-Fail 'Chưa có Docker Desktop / docker compose.'; $problems++ }

if ($problems -gt 0) { throw "Còn $problems vấn đề về môi trường. Hãy khắc phục rồi chạy lại script này." }

Write-Step 'Tạo file .env'
$envPath = Join-Path $RepoRoot '.env'
if (Test-Path -LiteralPath $envPath) {
    Write-Ok '.env đã tồn tại, giữ nguyên.'
} else {
    $postgresPassword = New-RandomPassword 24
    $adminPassword = New-RandomPassword 16
    $lines = foreach ($line in Get-Content -LiteralPath (Join-Path $RepoRoot '.env.example') -Encoding UTF8) {
        if ($line -match '^POSTGRES_PASSWORD=') { "POSTGRES_PASSWORD=$postgresPassword" }
        elseif ($line -match '^NEXUS_SEED_ADMIN_PASSWORD=') { "NEXUS_SEED_ADMIN_PASSWORD=$adminPassword" }
        else { $line }
    }
    [System.IO.File]::WriteAllLines($envPath, [string[]]$lines)   # UTF-8 không BOM
    Write-Ok '.env đã được tạo với mật khẩu ngẫu nhiên.'
    Write-Host ''
    Write-Host '  Tài khoản đăng nhập giao diện (dữ liệu DEMO):' -ForegroundColor Yellow
    Write-Host '    Email   : admin@demo.local'
    Write-Host "    Mật khẩu: $adminPassword"
    Write-Host '  Mật khẩu cũng nằm trong file .env (file này bị Git bỏ qua). Không chia sẻ nó.' -ForegroundColor Yellow
}
Write-Host ''
Write-Ok 'Hoàn tất. Bước tiếp theo: .\scripts\start-db.ps1'

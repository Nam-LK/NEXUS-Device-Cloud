<# Chạy frontend Vite ở http://localhost:5173 (giữ cửa sổ này mở). Dừng bằng Ctrl+C. #>
. "$PSScriptRoot\common.ps1"
Set-Location (Join-Path $RepoRoot 'frontend')

if (-not (Test-Path -LiteralPath 'node_modules')) {
    Write-Step 'Cài thư viện frontend (npm install, lần đầu hơi lâu)'
    npm install
    if ($LASTEXITCODE -ne 0) { throw 'npm install thất bại.' }
}
Write-Step 'Chạy frontend'
npm run dev

$ErrorActionPreference = "SilentlyContinue"
Start-Process "http://localhost:5500"

if (Get-Command python) {
  python -m http.server 5500
} elseif (Get-Command py) {
  py -m http.server 5500
} else {
  Write-Host "Python not found. Use VS Code Live Server extension or install Python." -ForegroundColor Red
  Read-Host "Press Enter to close"
}
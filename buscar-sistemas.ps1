Write-Host "🔍 Buscando sistemas de mantenimiento (keep-alive, cron, ping, etc.)..." -ForegroundColor Cyan

$patrones = @("*keep*", "*alive*", "*cron*", "*ping*", "*wake*", "*heartbeat*", "*health*", "*mantenimiento*", "*supabase*")

Write-Host "`n--- 1. BUSCANDO POR NOMBRE DE ARCHIVO ---" -ForegroundColor Yellow
$archivosEncontrados = Get-ChildItem -Path . -Recurse -File -Include *.ts, *.tsx, *.js, *.jsx, *.yml, *.yaml, *.json -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notmatch 'node_modules|\.next|\.git' }

foreach ($archivo in $archivosEncontrados) {
    foreach ($patron in $patrones) {
        if ($archivo.Name -like $patron) {
            Write-Host "📄 Archivo encontrado: $($archivo.FullName)" -ForegroundColor Green
            break
        }
    }
}

Write-Host "`n--- 2. BUSCANDO POR CONTENIDO DENTRO DE LOS ARCHIVOS ---" -ForegroundColor Yellow
$contenidosEncontrados = Get-ChildItem -Path . -Recurse -File -Include *.ts, *.tsx, *.js, *.jsx, *.yml, *.yaml, *.json -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notmatch 'node_modules|\.next|\.git|package-lock.json' } |
    Select-String -Pattern "keep.?alive|cron|ping|wake.?up|heartbeat|healthcheck|mantenimiento" -CaseSensitive:$false

if ($contenidosEncontrados) {
    foreach ($res in $contenidosEncontrados) {
        Write-Host "`n📍 Encontrado en: $($res.Path)" -ForegroundColor Green
        Write-Host "   Línea $($res.LineNumber): $($res.Line.Trim())"
    }
} else {
    Write-Host "No se encontraron coincidencias en el contenido de los archivos." -ForegroundColor Red
}

Write-Host "`n--- 3. REVISANDO CARPETA DE GITHUB ACTIONS ---" -ForegroundColor Yellow
if (Test-Path ".\.github\workflows") {
    Get-ChildItem -Path ".\.github\workflows" -File | ForEach-Object {
        Write-Host "⚙️ Workflow de GitHub: $($_.Name)" -ForegroundColor Green
    }
} else {
    Write-Host "No existe la carpeta .github/workflows" -ForegroundColor Red
}

Write-Host "`n✅ Búsqueda finalizada." -ForegroundColor Cyan

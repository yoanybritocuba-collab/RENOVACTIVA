param([int]$Depth = 2)
$excluir = 'node_modules|\.git|dist|build|\.next|\.vercel|coverage|vendor|\.turbo'
$raiz = (Get-Location).Path + '\'
Get-ChildItem -Recurse -Depth $Depth -Directory |
    Where-Object { $_.FullName -notmatch $excluir } |
    ForEach-Object { $_.FullName.Replace($raiz, '') } |
    Sort-Object

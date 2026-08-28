#Requires -Version 5.1
# VELMIRYS - Deploiement via GHCR (build local -> push -> droplet pull)
#
# Workflow : docker build (local, toutes les NEXT_PUBLIC_* passees en
# --build-arg) -> docker push ghcr.io -> ssh droplet (compose pull + up).
#
# Seules les variables NEXT_PUBLIC_* (publiques par design Next.js)
# sont passees en build args. Les cles privees (.env : SANITY_WRITE_TOKEN,
# SUPABASE_SECRET_KEY, RESEND_API_KEY...) ne sont JAMAIS poussees en ARG :
# elles seraient visibles dans 'docker history' -> fuite de secrets.
#
# Usage :
#   ./deploy.ps1                 # build + push + deploiement distant
#   ./deploy.ps1 -SkipRemote     # build + push seulement
#   ./deploy.ps1 -DropletHost user@autre-ip
param(
    [string]$DropletHost = "root@157.230.85.193",
    [string]$RemotePath  = "~/velmirys",
    [switch]$SkipRemote
)

$ErrorActionPreference = "Stop"

$Registry  = "ghcr.io"
$ImageName = "ibrahim1ia/velmirys-web"

# -- 1. Tag : latest + sha-<git short> --
$GitSha = (git rev-parse --short HEAD)
if ($LASTEXITCODE -ne 0) { throw "git rev-parse a echoue" }
$Tags = @("latest", "sha-$GitSha")

Write-Host "== Build local Docker (tags: $($Tags -join ', ')) ==" -ForegroundColor Cyan

# -- 2. .env -> --build-arg NEXT_PUBLIC_* uniquement --
$buildArgs = @()
Get-Content ".env" | ForEach-Object {
    if ($_ -match '^\s*(NEXT_PUBLIC_[A-Z0-9_]+)\s*=\s*(?<val>.*)$') {
        $key = $Matches[1]
        $val = $Matches['val'].Trim()
        if ($val.StartsWith('"')) {
            $val = ($val -replace '^"([^"]*)".*$', '$1')
        } else {
            $val = ($val -split '#')[0].Trim()
        }
        $buildArgs += "--build-arg"
        $buildArgs += "$key=$val"
        Write-Host "  build-arg : $key" -ForegroundColor DarkGray
    }
}

if ($buildArgs.Count -eq 0) {
    throw "Aucune NEXT_PUBLIC_* trouvee dans .env - copier .env.example et remplir."
}

# -- 3. docker build (multi-tag) --
$tagArgs = foreach ($t in $Tags) { "-t"; "$Registry/$ImageName`:$t" }
& docker build @tagArgs @buildArgs --file web/Dockerfile web
if ($LASTEXITCODE -ne 0) { throw "docker build a echoue" }

# -- 4. docker push (chaque tag) --
foreach ($t in $Tags) {
    Write-Host "== Push $Registry/$ImageName`:$t ==" -ForegroundColor Cyan
    & docker push "$Registry/$ImageName`:$t"
    if ($LASTEXITCODE -ne 0) { throw "docker push ${t} a echoue - faire 'docker login ghcr.io' d'abord" }
}

# -- 5. SSH droplet : pull + up --
if (-not $SkipRemote) {
    Write-Host "== Deploiement distant sur $DropletHost ==" -ForegroundColor Cyan
    $remoteCmd = "cd $RemotePath; docker compose pull; docker compose up -d"
    & ssh $DropletHost $remoteCmd
    if ($LASTEXITCODE -ne 0) { throw "deploiement distant a echoue" }
}

Write-Host "[OK] Deploiement termine : $Registry/$ImageName`:$($Tags[$Tags.Count-1])" -ForegroundColor Green

# VidyutSahayak PowerShell Native Web Server & REST API Fallback
$Port = 3000
$Prefix = "http://localhost:$Port/"
$RootPath = $PSScriptRoot
$DbPath = Join-Path $RootPath "data\db.json"

$Listener = New-Object System.Net.HttpListener
$Listener.Prefixes.Add($Prefix)

try {
    $Listener.Start()
} catch {
    Write-Host "Port $Port may be in use or permission denied. Trying port 3001..." -ForegroundColor Yellow
    $Port = 3001
    $Prefix = "http://localhost:$Port/"
    $Listener = New-Object System.Net.HttpListener
    $Listener.Prefixes.Add($Prefix)
    $Listener.Start()
}

Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host "⚡ VidyutSahayak PowerShell Server running at $Prefix" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Cyan

function Send-JsonResponse($response, $statusCode, $obj) {
    $json = $obj | ConvertTo-Json -Depth 10
    $buffer = [System.Text.Encoding]::UTF8.GetBytes($json)
    $response.StatusCode = $statusCode
    $response.ContentType = "application/json; charset=utf-8"
    $response.Headers.Add("Access-Control-Allow-Origin", "*")
    $response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
    $response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
    $response.ContentLength64 = $buffer.Length
    $response.OutputStream.Write($buffer, 0, $buffer.Length)
    $response.OutputStream.Close()
}

while ($Listener.IsListening) {
    $Context = $Listener.GetContext()
    $Request = $Context.Request
    $Response = $Context.Response

    $UrlPath = $Request.Url.AbsolutePath
    $Method = $Request.HttpMethod

    # Handle CORS OPTIONS
    if ($Method -eq "OPTIONS") {
        $Response.StatusCode = 204
        $Response.Headers.Add("Access-Control-Allow-Origin", "*")
        $Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PATCH, PUT, DELETE, OPTIONS")
        $Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
        $Response.OutputStream.Close()
        continue
    }

    # REST API endpoints
    if ($UrlPath.StartsWith("/api/")) {
        $db = @{ tickets = @(); technicians = @(); schools = @() }
        if (Test-Path $DbPath) {
            $rawDb = Get-Content -Raw -Path $DbPath -Encoding UTF8
            $db = $rawDb | ConvertFrom-Json
        }

        if ($UrlPath -eq "/api/health") {
            Send-JsonResponse $Response 200 @{ status = "online"; runtime = "PowerShell HttpListener" }
            continue
        }

        if ($UrlPath -eq "/api/stats") {
            $activeCount = ($db.tickets | Where-Object { $_.status -ne "resolved" }).Count
            $criticalCount = ($db.tickets | Where-Object { $_.urgency -eq "critical" -and $_.status -ne "resolved" }).Count
            Send-JsonResponse $Response 200 @{
                monitoredSchools = 142
                activeOutages = $activeCount
                criticalHazards = $criticalCount
                restoredThisMonth = 89
                activeTechs = 28
                volunteerResponseRate = "94.2%"
            }
            continue
        }

        if ($UrlPath -eq "/api/tickets") {
            if ($Method -eq "GET") {
                Send-JsonResponse $Response 200 @{ total = $db.tickets.Count; tickets = $db.tickets }
                continue
            }
        }

        if ($UrlPath -eq "/api/technicians") {
            Send-JsonResponse $Response 200 @{ total = $db.technicians.Count; technicians = $db.technicians }
            continue
        }

        if ($UrlPath -eq "/api/schools") {
            Send-JsonResponse $Response 200 $db.schools
            continue
        }
    }

    # Static file serving
    $FilePath = $null
    $TestPaths = @(
        (Join-Path $RootPath $UrlPath.TrimStart('/')),
        (Join-Path $RootPath "index.html"),
        (Join-Path $RootPath "stitch_vidyutsahayak_school_power_platform\$($UrlPath.TrimStart('/'))")
    )

    if ($UrlPath -eq "/" -or $UrlPath -eq "") {
        $FilePath = Join-Path $RootPath "index.html"
    } else {
        foreach ($tp in $TestPaths) {
            if (Test-Path $tp -PathType Leaf) {
                $FilePath = $tp
                break
            }
        }
    }

    if ($FilePath -and (Test-Path $FilePath -PathType Leaf)) {
        $ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
        $mime = "text/plain"
        switch ($ext) {
            ".html" { $mime = "text/html; charset=utf-8" }
            ".css"  { $mime = "text/css; charset=utf-8" }
            ".js"   { $mime = "application/javascript; charset=utf-8" }
            ".json" { $mime = "application/json; charset=utf-8" }
            ".png"  { $mime = "image/png" }
            ".jpg"  { $mime = "image/jpeg" }
            ".svg"  { $mime = "image/svg+xml" }
        }

        $bytes = [System.IO.File]::ReadAllBytes($FilePath)
        $Response.StatusCode = 200
        $Response.ContentType = $mime
        $Response.Headers.Add("Access-Control-Allow-Origin", "*")
        $Response.ContentLength64 = $bytes.Length
        $Response.OutputStream.Write($bytes, 0, $bytes.Length)
        $Response.OutputStream.Close()
    } else {
        $Response.StatusCode = 404
        $msg = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
        $Response.OutputStream.Write($msg, 0, $msg.Length)
        $Response.OutputStream.Close()
    }
}

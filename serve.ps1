$port = 8080
$root = "E:\OneDrive\Desktop\Open Code Projects\UltimateHighwayRacer"

$mimeTypes = @{
  ".html" = "text/html"
  ".css"  = "text/css"
  ".js"   = "application/javascript"
  ".json" = "application/json"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".gif"  = "image/gif"
  ".svg"  = "image/svg+xml"
  ".ico"  = "image/x-icon"
  ".wav"  = "audio/wav"
  ".mp3"  = "audio/mpeg"
  ".ogg"  = "audio/ogg"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Server running at http://localhost:$port/"
Write-Host "Serving: $root"
Write-Host "Press Ctrl+C to stop"

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $url = $context.Request.Url.LocalPath
    if ($url -eq "/") { $url = "/index.html" }

    $filePath = Join-Path $root ($url.TrimStart("/").Replace("/", "\"))
    $ext = [System.IO.Path]::GetExtension($filePath)

    if (Test-Path $filePath -LiteralPath) {
      $content = [System.IO.File]::ReadAllBytes($filePath)
      $context.Response.ContentType = if ($mimeTypes[$ext]) { $mimeTypes[$ext] } else { "application/octet-stream" }
      $context.Response.ContentLength64 = $content.Length
      $context.Response.OutputStream.Write($content, 0, $content.Length)
    } else {
      $context.Response.StatusCode = 404
      $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found")
      $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    }
    $context.Response.Close()
  }
} finally {
  $listener.Stop()
}

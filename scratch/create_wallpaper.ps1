Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Shrey\.gemini\antigravity\brain\d46ef41d-5845-4f1f-9a1c-5d3bb41a6adf\.user_uploaded\media_1795452736959_4e6cfe52.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

$w = [int]$bmp.Width
$h = [int]$bmp.Height
$wallBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($wallBmp)

# Take the top clean block (Y=0..120) and tile it across the canvas
for ($y = 0; $y -lt $h; $y += 90) {
    $srcH = [Math]::Min(90, $h - $y)
    $destRect = New-Object System.Drawing.Rectangle(0, $y, $w, $srcH)
    $srcRect = New-Object System.Drawing.Rectangle(0, 10, $w, $srcH)
    $g.DrawImage($bmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
}

$destPath = "C:\Users\Shrey\OneDrive\Desktop\Wedding Invite\wedding_invite\public\images\ganesh-wallpaper.jpg"
$wallBmp.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
Write-Host "Created clean wallpaper: $destPath"

$g.Dispose()
$wallBmp.Dispose()
$bmp.Dispose()

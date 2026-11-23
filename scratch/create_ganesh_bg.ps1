Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Shrey\.gemini\antigravity\brain\d46ef41d-5845-4f1f-9a1c-5d3bb41a6adf\.user_uploaded\media_1795452736959_4e6cfe52.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

$w = $bmp.Width
$h = $bmp.Height
$bgBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$g = [System.Drawing.Graphics]::FromImage($bgBmp)
$g.DrawImage($bmp, 0, 0, $w, $h)

# Clean top text area (Y=120..200) by cloning clean texture from Y=20..100
$g.DrawImage($bmp, (New-Object System.Drawing.Rectangle(0, 120, $w, 85)), (New-Object System.Drawing.Rectangle(0, 20, $w, 85)), [System.Drawing.GraphicsUnit]::Pixel)

# Clean bottom text area (Y=500..590) by cloning clean texture from Y=610..700
$g.DrawImage($bmp, (New-Object System.Drawing.Rectangle(0, 500, $w, 90)), (New-Object System.Drawing.Rectangle(0, 610, $w, 90)), [System.Drawing.GraphicsUnit]::Pixel)

# Save clean background
$outPath = "C:\Users\Shrey\OneDrive\Desktop\Wedding Invite\wedding_invite\public\images\ganesh-bg.jpg"
$bgBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
Write-Host "Saved clean wallpaper to $outPath"

$g.Dispose()
$bgBmp.Dispose()
$bmp.Dispose()

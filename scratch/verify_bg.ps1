Add-Type -AssemblyName System.Drawing

$p = "C:\Users\Shrey\OneDrive\Desktop\Wedding Invite\wedding_invite\public\images\ganesh-bg.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($p)

# Check Y=150 (cleared top text)
$c1 = $bmp.GetPixel(200, 150)
Write-Host "Y=150 color: R=$($c1.R), G=$($c1.G), B=$($c1.B)"

# Check Y=340 (Ganesha center)
$c2 = $bmp.GetPixel(200, 340)
Write-Host "Ganesh center color: R=$($c2.R), G=$($c2.G), B=$($c2.B)"

# Check Y=540 (cleared bottom text)
$c3 = $bmp.GetPixel(200, 540)
Write-Host "Y=540 color: R=$($c3.R), G=$($c3.G), B=$($c3.B)"

$bmp.Dispose()

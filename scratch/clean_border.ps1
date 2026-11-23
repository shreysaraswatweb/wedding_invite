Add-Type -AssemblyName System.Drawing

$p = "C:\Users\Shrey\OneDrive\Desktop\Wedding Invite\wedding_invite\public\images\ganeshji.png"
$bmp = [System.Drawing.Bitmap]::FromFile($p)

$out = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($y = 0; $y -lt $bmp.Height; $y++) {
    for ($x = 0; $x -lt $bmp.Width; $x++) {
        if ($x -lt 6 -or $x -ge ($bmp.Width - 6) -or $y -lt 6 -or $y -ge ($bmp.Height - 6)) {
            $out.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        } else {
            $out.SetPixel($x, $y, $bmp.GetPixel($x, $y))
        }
    }
}

$bmp.Dispose()
$out.Save($p, [System.Drawing.Imaging.ImageFormat]::Png)
$out.Dispose()
Write-Host "Cleaned border pixels of $p"

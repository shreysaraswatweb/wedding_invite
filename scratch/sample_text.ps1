Add-Type -AssemblyName System.Drawing

$topPath = "C:\Users\Shrey\OneDrive\Desktop\Wedding Invite\wedding_invite\scratch\top_text_ref.png"
$bmp = [System.Drawing.Bitmap]::FromFile($topPath)

Write-Host "Top text size: $($bmp.Width) x $($bmp.Height)"

# Sample text colors
for ($y = 10; $y -lt $bmp.Height; $y += 8) {
    for ($x = 20; $x -lt $bmp.Width; $x += 20) {
        $c = $bmp.GetPixel($x, $y)
        # If text pixel
        if ($c.R -gt 180 -and ($c.R - $c.B) -gt 90) {
            Write-Host "Sample at ($x, $y): R=$($c.R), G=$($c.G), B=$($c.B)"
            break
        }
    }
}

$bmp.Dispose()

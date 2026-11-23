Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\Shrey\.gemini\antigravity\brain\d46ef41d-5845-4f1f-9a1c-5d3bb41a6adf\.user_uploaded\media_1795452736959_4e6cfe52.jpg"
$bmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# Bounding box of Ganesha in media_1795452736959_4e6cfe52.jpg:
# Top of crown: Y ~ 205
# Bottom of base: Y ~ 485
# Left of hand: X ~ 68
# Right of ear: X ~ 335
$w = 280
$h = 285
$startX = 60
$startY = 205

$outBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

# We want to identify the Ganesha artwork pixels versus background wallpaper pixels.
# In the original image:
# Artwork pixels:
# 1. Maroon outlines and details: R in 60..155, G in 15..65, B in 25..65. Notice G is very low (< 75).
# 2. Orange fills (trunk, mukut, base): R in 210..255, G in 90..165, B in 15..75. Notice (R - B) > 130!
# 3. Green fills (leaves, crown): R in 80..155, G in 135..185, B in 80..130. Notice (G - R) > 15!
# 4. Gold / yellow fills: R in 200..245, G in 160..210, B in 50..115. Notice (R - B) > 90 and (G - B) > 50!
# 5. Red Tilak: R > 190, G < 60, B < 60.
#
# Background wallpaper pixels:
# R is in 190..230, G is in 195..232, B is in 150..188.
# Crucially: For background pixels, |R - G| is always < 20, and |R - B| is < 60, and luminance is > 180!

for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $origX = $startX + $x
        $origY = $startY + $y
        $c = $bmp.GetPixel($origX, $origY)
        $r = [int]$c.R
        $g = [int]$c.G
        $b = [int]$c.B

        # Classify if this is an artwork pixel
        $isMaroon = ($g -lt 75) -and ($b -lt 75) -and ($r -lt 165)
        $isOrange = ($r -gt 195) -and ($r - $b -gt 115) -and ($g -lt 170)
        $isRed    = ($r -gt 160) -and ($g -lt 70) -and ($b -lt 70)
        $isGreen  = ($g -gt 120) -and ($g - $r -gt 12) -and ($g - $b -gt 25)
        $isGold   = ($r -gt 190) -and ($r - $b -gt 85) -and ($g - $b -gt 45) -and ($r - $g -gt 15)

        $isArtwork = $isMaroon -or $isOrange -or $isRed -or $isGreen -or $isGold

        if ($isArtwork) {
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, $r, $g, $b))
        } else {
            # Background pixel: check if it's near an edge for anti-aliasing
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

# 1-pixel soft feathering on edges of artwork to eliminate hard pixelation
$feathered = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
for ($y = 0; $y -lt $h; $y++) {
    for ($x = 0; $x -lt $w; $x++) {
        $p = $outBmp.GetPixel($x, $y)
        if ($p.A -gt 0) {
            $feathered.SetPixel($x, $y, $p)
        } else {
            # Count neighbor artwork pixels
            $neighbors = 0
            $nr = 0; $ng = 0; $nb = 0
            for ($dy = -1; $dy -le 1; $dy++) {
                for ($dx = -1; $dx -le 1; $dx++) {
                    $nx = $x + $dx
                    $ny = $y + $dy
                    if ($nx -ge 0 -and $nx -lt $w -and $ny -ge 0 -and $ny -lt $h) {
                        $np = $outBmp.GetPixel($nx, $ny)
                        if ($np.A -gt 0) {
                            $neighbors++
                            $nr += $np.R
                            $ng += $np.G
                            $nb += $np.B
                        }
                    }
                }
            }
            if ($neighbors -ge 2) {
                # Antialias fringe pixel
                $alpha = [int]($neighbors * 24)
                $avgR = [int]($nr / $neighbors)
                $avgG = [int]($ng / $neighbors)
                $avgB = [int]($nb / $neighbors)
                $feathered.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $avgR, $avgG, $avgB))
            } else {
                $feathered.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
            }
        }
    }
}

$destPath = "C:\Users\Shrey\OneDrive\Desktop\Wedding Invite\wedding_invite\public\images\ganeshji.png"
$feathered.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Pristine transparent Ganesh saved to $destPath"

$feathered.Dispose()
$outBmp.Dispose()
$bmp.Dispose()

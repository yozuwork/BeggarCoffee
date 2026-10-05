"""產生 PWA 圖示（public/icons/）：深咖啡底、奶油色圓章、粉圓字「咖啡」"""
import math
from PIL import Image, ImageDraw, ImageFont

FONT = "src/assets/fonts/jf-openhuninn-2.1.ttf"
BG, CREAM, CREMA = (46, 31, 22), (245, 230, 207), (201, 143, 74)

def icon(size, safe=1.0):
    S = size * 4  # 先畫大再縮小，邊緣比較平滑
    im = Image.new("RGB", (S, S), BG)
    d = ImageDraw.Draw(im)
    c = S / 2
    r = S * 0.40 * safe
    d.ellipse([c - r, c - r, c + r, c + r], fill=CREMA)
    # 虛線圓圈
    rr, n = r * 0.86, 28
    for i in range(n):
        a0, a1 = 2 * math.pi * i / n, 2 * math.pi * (i + 0.55) / n
        d.arc([c - rr, c - rr, c + rr, c + rr], math.degrees(a0), math.degrees(a1), fill=BG, width=int(S * 0.012))
    f = ImageFont.truetype(FONT, int(r * 0.62))
    d.text((c, c - r * 0.10), "咖啡", font=f, fill=BG, anchor="mm")
    f2 = ImageFont.truetype(FONT, int(r * 0.22))
    d.text((c, c + r * 0.42), "TAIPEI", font=f2, fill=BG, anchor="mm")
    return im.resize((size, size), Image.LANCZOS)

icon(192).save("public/icons/icon-192.png")
icon(512).save("public/icons/icon-512.png")
icon(512, safe=0.78).save("public/icons/icon-maskable-512.png")
icon(180).save("public/icons/apple-touch-icon.png")
print("ok")

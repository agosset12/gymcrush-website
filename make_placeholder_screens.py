#!/usr/bin/env python3
"""Generate branded placeholder App Store screenshots for the GymCrush website.

Real screenshots don't exist yet. These on-theme placeholders keep the landing
carousel looking intentional. Replace screenshots/01.png … 05.png with real
1290×2796 captures when ready, or just re-run this script.

Usage: python3 make_placeholder_screens.py
"""

from PIL import Image, ImageDraw, ImageFont
from pathlib import Path

# GymCrush theme palette (from ios/.../AppColors.swift)
BG          = (255, 248, 239)   # --bg cream
SURFACE     = (255, 252, 247)   # --surface
BORDER      = (239, 220, 203)   # --border
TEXT        = (20, 33, 58)      # --text navy
TEXT_MUTED  = (143, 129, 120)   # --text-muted
PRIMARY     = (246, 111, 125)   # --primary coral
ROSE        = (236, 117, 145)   # accent rose
MINT        = (123, 203, 184)
GOLD        = (247, 201, 93)
LILAC       = (185, 154, 247)

ACCENTS = [PRIMARY, MINT, LILAC, GOLD, ROSE]
LABELS  = ["Daily quests", "Shared streak", "Collect mascots", "Open chests", "Level up together"]

W, H = 1290, 2796
OUT = Path(__file__).parent / "screenshots"


def load_font(size, bold=True):
    candidates = [
        "/Users/antoinegosset/Desktop/GymCrush/rork-fit-companion-app/ios/SoftQuestArcade/Resources/Fonts/"
        + ("Rubik-Bold.ttf" if bold else "Rubik-Regular.ttf"),
        "/System/Library/Fonts/SFNS.ttf",
        "/Library/Fonts/Arial.ttf",
    ]
    for c in candidates:
        try:
            return ImageFont.truetype(c, size)
        except OSError:
            continue
    return ImageFont.load_default()


def rounded(draw, box, radius, fill=None, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def center_text(draw, cx, y, text, font, fill):
    l, t, r, b = draw.textbbox((0, 0), text, font=font)
    draw.text((cx - (r - l) / 2, y), text, font=font, fill=fill)


def make_screen(index, accent, label):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    margin = 70
    # Status-bar hint dot row
    d.ellipse([W - 150, 70, W - 110, 110], fill=accent)

    # Header bar
    header_h = 230
    rounded(d, [margin, 150, W - margin, 150 + header_h], 48, fill=accent)
    center_text(d, W / 2, 150 + header_h / 2 - 48, "GymCrush", load_font(82, bold=True), (255, 255, 255))

    # Big hero card
    card_top = 470
    card_bot = 1640
    rounded(d, [margin, card_top, W - margin, card_bot], 64, fill=SURFACE, outline=BORDER, width=4)

    # Mascot placeholder blob
    blob_r = 230
    cx, cy = W / 2, card_top + 470
    d.ellipse([cx - blob_r, cy - blob_r, cx + blob_r, cy + blob_r],
              fill=tuple(int(a * 0.18 + 255 * 0.82) for a in accent))
    d.ellipse([cx - blob_r + 60, cy - blob_r + 60, cx + blob_r - 60, cy + blob_r - 60], fill=accent)
    center_text(d, cx, cy - 70, "?", load_font(220, bold=True), (255, 255, 255))

    center_text(d, W / 2, cy + blob_r + 70, label, load_font(76, bold=True), TEXT)
    center_text(d, W / 2, cy + blob_r + 180, "Preview screen", load_font(50, bold=False), TEXT_MUTED)

    # Faux task rows
    row_y = 1740
    for i in range(3):
        rounded(d, [margin, row_y, W - margin, row_y + 150], 36, fill=SURFACE, outline=BORDER, width=4)
        d.ellipse([margin + 45, row_y + 40, margin + 115, row_y + 110],
                  fill=accent if i == 0 else BORDER)
        rounded(d, [margin + 160, row_y + 55, margin + 700, row_y + 95], 20, fill=BORDER)
        row_y += 190

    # Bottom CTA pill
    rounded(d, [margin + 180, 2380, W - margin - 180, 2380 + 150], 40, fill=accent)
    center_text(d, W / 2, 2380 + 40, "Continue", load_font(64, bold=True), (255, 255, 255))

    # Page dots
    dot_y = 2640
    total = 5
    dot_w = 26
    gap = 22
    start_x = W / 2 - ((total * dot_w + (total - 1) * gap) / 2)
    for i in range(total):
        x = start_x + i * (dot_w + gap)
        fill = accent if i == index else BORDER
        d.ellipse([x, dot_y, x + dot_w, dot_y + dot_w], fill=fill)

    OUT.mkdir(exist_ok=True)
    path = OUT / f"{index + 1:02d}.png"
    img.save(path)
    print("wrote", path)


def main():
    for i, (accent, label) in enumerate(zip(ACCENTS, LABELS)):
        make_screen(i, accent, label)


if __name__ == "__main__":
    main()

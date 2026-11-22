#!/usr/bin/env python3
"""Generate um/door/og-preview.png from um/door/index.html.

Reads the page colours, font stacks, og:title and og:description, and draws
a 1200×630 card: dark field, hairline rules, the Open Graph title, a one-line
subtitle taken from the description, and a small Universal Metaphor wordmark.
Nothing secret is drawn — no addresses, tokens, or message text.
"""

from __future__ import annotations

import html
import re
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

WIDTH = 1200
HEIGHT = 630
DOOR = Path(__file__).resolve().parents[1]
HTML_PATH = DOOR / "index.html"
OUT_PATH = DOOR / "og-preview.png"

GENERICS = {
    "serif",
    "sans-serif",
    "monospace",
    "cursive",
    "fantasy",
    "system-ui",
    "ui-sans-serif",
    "ui-serif",
    "ui-monospace",
    "emoji",
    "math",
    "fangsong",
}


def css_blocks(css: str):
    for match in re.finditer(r"([^{}]+)\{([^{}]+)\}", css):
        selectors = [part.strip() for part in match.group(1).split(",")]
        yield selectors, match.group(2)


def css_decl(css: str, selector: str, prop: str) -> str | None:
    for selectors, body in css_blocks(css):
        if selector not in selectors:
            continue
        found = re.search(rf"(?:^|[;{{])\s*{re.escape(prop)}\s*:\s*([^;]+);", body)
        if found:
            return found.group(1).strip()
    return None


def css_vars(css: str) -> dict[str, str]:
    root = re.search(r":root\s*\{([^}]+)\}", css)
    if not root:
        raise SystemExit("index.html has no :root colour tokens")
    return {
        name: value.strip()
        for name, value in re.findall(r"--([\w-]+)\s*:\s*([^;]+);", root.group(1))
    }


def resolve_color(value: str, variables: dict[str, str]) -> tuple[int, int, int]:
    value = value.strip()
    var = re.fullmatch(r"var\(\s*--([\w-]+)\s*\)", value)
    if var:
        value = variables[var.group(1)].strip()
    hex_color = re.fullmatch(r"#([0-9a-fA-F]{6})", value)
    if not hex_color:
        raise SystemExit(f"unsupported colour: {value}")
    digits = hex_color.group(1)
    return tuple(int(digits[i : i + 2], 16) for i in (0, 2, 4))


def meta_content(page: str, prop: str) -> str:
    tag = re.search(rf"<meta\s+[^>]*property=\"{re.escape(prop)}\"[^>]*>", page)
    if not tag:
        raise SystemExit(f"missing meta property {prop}")
    content = re.search(r"content=\"([^\"]*)\"", tag.group(0))
    if not content:
        raise SystemExit(f"missing content for {prop}")
    return html.unescape(content.group(1))


def font_families(stack: str) -> list[str]:
    families = []
    for part in stack.split(","):
        name = part.strip().strip("\"'")
        if name:
            families.append(name)
    return families


def fc_match(family: str) -> tuple[str, str]:
    out = subprocess.check_output(
        ["fc-match", "-f", "%{file}\n%{family}", family],
        text=True,
    )
    path, matched = out.split("\n", 1)
    return path.strip(), matched.strip()


def resolve_stack(stack: str) -> tuple[str, str]:
    """Walk a CSS font-family list in order.

    Named families that only hit fontconfig's default face are skipped, so a
    missing Iowan Old Style does not hide Palatino. Generic families are kept:
    on this machine ui-sans-serif is the eyebrow's real first match.
    """
    default_path, _default_family = fc_match("NotARealFontZZZ")
    for family in font_families(stack):
        path, matched = fc_match(family)
        if family.lower() in GENERICS or path != default_path:
            return path, matched
    raise SystemExit(f"no font installed for: {stack}")


def em(value: str, size: float) -> float:
    value = value.strip()
    if value in {"0", "normal"}:
        return 0.0
    as_em = re.fullmatch(r"(-?(?:\d+\.?\d*|\.\d+))em", value)
    if as_em:
        return float(as_em.group(1)) * size
    as_px = re.fullmatch(r"(-?(?:\d+\.?\d*|\.\d+))px", value)
    if as_px:
        return float(as_px.group(1))
    raise SystemExit(f"unsupported length: {value}")


def advance(text: str, index: int, font: ImageFont.FreeTypeFont) -> float:
    if index + 1 < len(text):
        return font.getlength(text[index : index + 2]) - font.getlength(text[index + 1])
    return font.getlength(text[index])


def text_width(text: str, font: ImageFont.FreeTypeFont, tracking: float) -> float:
    if not text:
        return 0.0
    return sum(advance(text, i, font) + (tracking if i + 1 < len(text) else 0.0) for i in range(len(text)))


def draw_tracked(draw: ImageDraw.ImageDraw, origin, text, font, fill, tracking) -> float:
    x, y = origin
    for index, char in enumerate(text):
        draw.text((x, y), char, font=font, fill=fill, anchor="ls")
        x += advance(text, index, font)
        if index + 1 < len(text):
            x += tracking
    return x


def sentences(text: str) -> list[str]:
    parts = [part.strip() for part in re.findall(r"[^.]+(?:\.|$)", text) if part.strip()]
    return parts or [text.strip()]


def fit_size(text: str, font_path: str, max_width: float, high: int, low: int, tracking_em: float = 0.0):
    for size in range(high, low - 1, -1):
        font = ImageFont.truetype(font_path, size)
        if text_width(text, font, tracking_em * size) <= max_width:
            return size, font
    return None, None


def choose_subtitle(description: str, font_path: str, max_width: float):
    """One sentence from og:description that fits on a single line.

    The opening sentence is the subtitle when it stays readable. Otherwise the
    earliest later sentence that fits at a comfortable size is used.
    """
    options = sentences(description)
    first_size, first_font = fit_size(options[0], font_path, max_width, high=26, low=20)
    if first_font is not None:
        return options[0], first_size, first_font
    best = None
    for sentence in options[1:]:
        size, font = fit_size(sentence, font_path, max_width, high=28, low=22)
        if font is None:
            continue
        if best is None or size > best[1]:
            best = (sentence, size, font)
    if best:
        return best
    size, font = fit_size(options[0], font_path, max_width, high=19, low=15)
    if font is None:
        raise SystemExit("og:description does not fit on one line")
    return options[0], size, font


def main() -> None:
    page = HTML_PATH.read_text(encoding="utf-8")
    variables = css_vars(page)
    bg = resolve_color(css_decl(page, "body", "background") or "var(--bg)", variables)
    ink = resolve_color(css_decl(page, "body", "color") or "var(--ink)", variables)
    line = resolve_color("var(--line)", variables)
    gold = resolve_color(css_decl(page, ".eyebrow", "color") or "var(--gold)", variables)
    lede = resolve_color(css_decl(page, ".lede", "color") or "#d8d0c4", variables)

    title = meta_content(page, "og:title")
    description = meta_content(page, "og:description")
    eyebrow = re.search(r'<p class="eyebrow">([^<]+)</p>', page)
    if not eyebrow:
        raise SystemExit("missing eyebrow")
    wordmark = eyebrow.group(1).split("·")[0].strip()
    if css_decl(page, ".eyebrow", "text-transform") == "uppercase":
        wordmark = wordmark.upper()
    if wordmark != "UNIVERSAL METAPHOR":
        raise SystemExit(f"unexpected wordmark: {wordmark}")

    body_stack = css_decl(page, "body", "font-family")
    eyebrow_stack = css_decl(page, ".eyebrow", "font-family")
    if not body_stack or not eyebrow_stack:
        raise SystemExit("missing font-family")
    serif_path, serif_name = resolve_stack(body_stack)
    sans_path, sans_name = resolve_stack(eyebrow_stack)
    title_track_em = em(css_decl(page, "h1", "letter-spacing") or "0", 1)
    word_track_em = em(css_decl(page, ".eyebrow", "letter-spacing") or "0", 1)

    margin = 76
    max_width = WIDTH - margin * 2
    title_size, title_font = fit_size(
        title, serif_path, max_width=900, high=68, low=48, tracking_em=title_track_em
    )
    if title_font is None:
        raise SystemExit("og:title does not fit")
    subtitle, sub_size, sub_font = choose_subtitle(description, serif_path, max_width - 8)
    if "\n" in subtitle or subtitle not in description:
        raise SystemExit("subtitle is not a single line from og:description")

    word_size = 14
    word_font = ImageFont.truetype(sans_path, word_size)
    word_tracking = word_track_em * word_size

    image = Image.new("RGB", (WIDTH, HEIGHT), bg)
    draw = ImageDraw.Draw(image)
    draw.rectangle([32, 32, WIDTH - 33, HEIGHT - 33], outline=line)

    word_baseline = 116
    draw_tracked(draw, (margin, word_baseline), wordmark, word_font, gold, word_tracking)
    draw.line([(margin, word_baseline + 16), (margin + 44, word_baseline + 16)], fill=gold)

    word_ascent, word_descent = word_font.getmetrics()
    radius = 17
    center_y = word_baseline + (word_descent - word_ascent) / 2
    draw.ellipse(
        [
            WIDTH - margin - radius * 2,
            center_y - radius,
            WIDTH - margin,
            center_y + radius,
        ],
        outline=gold,
    )

    title_ascent, title_descent = title_font.getmetrics()
    sub_ascent, sub_descent = sub_font.getmetrics()
    gap = 20
    block = title_ascent + title_descent + gap + sub_ascent + sub_descent
    block_top = int(HEIGHT * 0.50 - block / 2)
    title_baseline = block_top + title_ascent
    sub_baseline = title_baseline + title_descent + gap + sub_ascent
    draw_tracked(
        draw,
        (margin, title_baseline),
        title,
        title_font,
        ink,
        title_track_em * title_size,
    )
    draw.text((margin, sub_baseline), subtitle, font=sub_font, fill=lede, anchor="ls")
    rule_y = int(sub_baseline + sub_descent + 32)
    draw.line([(margin, rule_y), (WIDTH - margin, rule_y)], fill=line)

    drawn = " ".join([wordmark, title, subtitle])
    if any(token in drawn for token in ("@", "token", "http://", "https://")):
        raise SystemExit("refusing to draw a secret, address, or link")
    if text_width(title, title_font, title_track_em * title_size) > max_width:
        raise SystemExit("title overflows")
    if sub_font.getlength(subtitle) > max_width:
        raise SystemExit("subtitle overflows")

    image.save(OUT_PATH, "PNG", optimize=True)
    print(f"wrote {OUT_PATH}")
    print(f"serif: {serif_name} ({serif_path})")
    print(f"sans:  {sans_name} ({sans_path})")
    print(f"title {title_size}px: {title}")
    print(f"subtitle {sub_size}px: {subtitle}")


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as exc:
        sys.exit(f"fontconfig failed: {exc}")

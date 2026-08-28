from collections import deque
from pathlib import Path

from PIL import Image

SRC = Path(
    r"C:\Users\Admin\.cursor\projects\c-Users-Admin-OneDrive-Documents-Projects-budgetWise\assets\c__Users_Admin_AppData_Roaming_Cursor_User_workspaceStorage_3954408454be651225590fa053cbd9f1_images_budgetwise-eb53907a-9782-444b-aad8-0b0605816b18.jpg"
)
OUT = Path(__file__).resolve().parents[1] / "my-react-app" / "public" / "logo.png"
FAV = Path(__file__).resolve().parents[1] / "my-react-app" / "public" / "favicon.png"


def bg_like(r, g, b):
    return r >= 198 and g >= 198 and b >= 198


def has_transparent_neighbor(px, x, y, w, h):
    for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nx, ny = x + dx, y + dy
        if 0 <= nx < w and 0 <= ny < h and px[nx, ny][3] == 0:
            return True
    return False


def main():
    img = Image.open(SRC).convert("RGBA")
    px = img.load()
    w, h = img.size

    visited = [[False] * w for _ in range(h)]
    q = deque()
    for x in range(w):
        q.append((x, 0))
        q.append((x, h - 1))
    for y in range(h):
        q.append((0, y))
        q.append((w - 1, y))

    while q:
        x, y = q.popleft()
        if x < 0 or y < 0 or x >= w or y >= h or visited[y][x]:
            continue
        visited[y][x] = True
        r, g, b, _a = px[x, y]
        if bg_like(r, g, b):
            px[x, y] = (r, g, b, 0)
            q.extend([(x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)])

    for _ in range(2):
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if a == 0:
                    continue
                if r >= 190 and g >= 190 and b >= 190 and has_transparent_neighbor(px, x, y, w, h):
                    px[x, y] = (r, g, b, 0)

    bbox = img.getbbox()
    if not bbox:
        raise SystemExit("No content after background removal")
    img = img.crop(bbox)

    content_w, content_h = img.size
    side = max(content_w, content_h)
    pad = max(2, side // 32)
    canvas = Image.new("RGBA", (side + pad * 2, side + pad * 2), (0, 0, 0, 0))
    ox = (canvas.width - content_w) // 2
    oy = (canvas.height - content_h) // 2
    canvas.paste(img, (ox, oy), img)
    canvas.save(OUT, optimize=True)

    fav = canvas.copy()
    fav.thumbnail((32, 32), Image.Resampling.LANCZOS)
    fav.save(FAV, optimize=True)
    print(f"Saved {OUT} ({canvas.size}) and {FAV} ({fav.size})")


if __name__ == "__main__":
    main()

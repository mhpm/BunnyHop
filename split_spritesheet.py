"""
Spritesheet Splitter
====================
Separa cada elemento/frame de un spritesheet en imágenes individuales.
Detecta automáticamente los sprites usando bounding boxes de contenido no-transparente.

Uso:
    python split_spritesheet.py <imagen> [--output <carpeta>] [--padding <px>] [--min-size <px>]

Ejemplos:
    python split_spritesheet.py public/assets/sprites/bunny/bunny_walking.png
    python split_spritesheet.py mi_spritesheet.png --output frames/ --padding 2
"""

import argparse
import os
import sys
from pathlib import Path

try:
    from PIL import Image
except ImportError:
    print("Error: Pillow no está instalado. Ejecuta: pip install Pillow")
    sys.exit(1)


def find_sprite_bounding_boxes(image: Image.Image, min_size: int = 10) -> list[tuple[int, int, int, int]]:
    """
    Encuentra los bounding boxes de todos los sprites en la imagen.
    Detecta regiones conectadas de píxeles no-transparentes.
    
    Returns:
        Lista de tuplas (left, top, right, bottom) para cada sprite encontrado.
    """
    if image.mode != "RGBA":
        image = image.convert("RGBA")

    width, height = image.size
    pixels = image.load()

    # Crear máscara de píxeles no-transparentes (alpha > 10)
    visited = [[False] * width for _ in range(height)]
    alpha_threshold = 10

    bounding_boxes = []

    def flood_fill(start_x: int, start_y: int) -> tuple[int, int, int, int]:
        """Flood fill para encontrar la región conectada y su bounding box."""
        stack = [(start_x, start_y)]
        min_x, min_y = start_x, start_y
        max_x, max_y = start_x, start_y

        while stack:
            x, y = stack.pop()
            if x < 0 or x >= width or y < 0 or y >= height:
                continue
            if visited[y][x]:
                continue
            
            _, _, _, a = pixels[x, y]
            if a <= alpha_threshold:
                visited[y][x] = True
                continue

            visited[y][x] = True
            min_x = min(min_x, x)
            min_y = min(min_y, y)
            max_x = max(max_x, x)
            max_y = max(max_y, y)

            # Expandir en las 4 direcciones
            stack.append((x + 1, y))
            stack.append((x - 1, y))
            stack.append((x, y + 1))
            stack.append((x, y - 1))

        return (min_x, min_y, max_x + 1, max_y + 1)

    # Escanear la imagen buscando regiones no-transparentes
    for y in range(height):
        for x in range(width):
            if visited[y][x]:
                continue
            _, _, _, a = pixels[x, y]
            if a > alpha_threshold:
                bbox = flood_fill(x, y)
                box_w = bbox[2] - bbox[0]
                box_h = bbox[3] - bbox[1]
                # Filtrar regiones demasiado pequeñas (ruido)
                if box_w >= min_size and box_h >= min_size:
                    bounding_boxes.append(bbox)

    # Ordenar de izquierda a derecha, luego de arriba a abajo
    bounding_boxes.sort(key=lambda b: (b[1] // (height // 2 + 1), b[0]))

    return bounding_boxes


def merge_overlapping_boxes(boxes: list[tuple[int, int, int, int]], gap: int = 2) -> list[tuple[int, int, int, int]]:
    """
    Fusiona bounding boxes que se superponen o están muy cerca entre sí.
    """
    if not boxes:
        return []

    merged = list(boxes)
    changed = True

    while changed:
        changed = False
        new_merged = []
        used = [False] * len(merged)

        for i in range(len(merged)):
            if used[i]:
                continue
            current = merged[i]
            for j in range(i + 1, len(merged)):
                if used[j]:
                    continue
                other = merged[j]
                # Verificar si se superponen o están muy cerca
                if (current[0] - gap <= other[2] and current[2] + gap >= other[0] and
                    current[1] - gap <= other[3] and current[3] + gap >= other[1]):
                    # Fusionar
                    current = (
                        min(current[0], other[0]),
                        min(current[1], other[1]),
                        max(current[2], other[2]),
                        max(current[3], other[3]),
                    )
                    used[j] = True
                    changed = True
            new_merged.append(current)
            used[i] = True

        merged = new_merged

    if not merged:
        return []

    # Re-ordenar
    max_bottom = max(b[3] for b in merged)
    merged.sort(key=lambda b: (b[1] // max(1, max_bottom // 2), b[0]))
    return merged


def split_spritesheet(
    image_path: str,
    output_dir: str | None = None,
    padding: int = 2,
    min_size: int = 10,
) -> list[str]:
    """
    Divide un spritesheet en imágenes individuales.

    Args:
        image_path: Ruta a la imagen del spritesheet.
        output_dir: Carpeta de salida. Si es None, crea una subcarpeta con el nombre del archivo.
        padding: Píxeles de padding alrededor de cada sprite extraído.
        min_size: Tamaño mínimo (ancho y alto) para considerar una región como sprite.

    Returns:
        Lista de rutas a las imágenes generadas.
    """
    image_path = Path(image_path)
    if not image_path.exists():
        print(f"Error: No se encontró el archivo '{image_path}'")
        sys.exit(1)

    # Abrir imagen
    img = Image.open(image_path).convert("RGBA")
    print(f"Imagen cargada: {img.size[0]}x{img.size[1]} px")

    # Detectar sprites
    print("Detectando sprites...")
    sys.setrecursionlimit(img.size[0] * img.size[1] + 100)
    boxes = find_sprite_bounding_boxes(img, min_size=min_size)
    boxes = merge_overlapping_boxes(boxes, gap=padding)
    print(f"Se encontraron {len(boxes)} sprites")

    if not boxes:
        print("No se encontraron sprites en la imagen.")
        return []

    # Crear carpeta de salida
    if output_dir is None:
        output_dir = image_path.parent / f"{image_path.stem}_frames"
    else:
        output_dir = Path(output_dir)

    output_dir.mkdir(parents=True, exist_ok=True)

    # Extraer y guardar cada sprite
    saved_files = []
    name_base = image_path.stem

    for i, (left, top, right, bottom) in enumerate(boxes):
        # Añadir padding
        pad_left = max(0, left - padding)
        pad_top = max(0, top - padding)
        pad_right = min(img.size[0], right + padding)
        pad_bottom = min(img.size[1], bottom + padding)

        sprite = img.crop((pad_left, pad_top, pad_right, pad_bottom))

        output_path = output_dir / f"{name_base}_{i:03d}.png"
        sprite.save(output_path, "PNG")
        saved_files.append(str(output_path))

        w, h = sprite.size
        print(f"  [{i+1}/{len(boxes)}] {output_path.name} ({w}x{h} px)")

    print(f"\nListo! {len(saved_files)} sprites guardados en: {output_dir}")
    return saved_files


def main():
    parser = argparse.ArgumentParser(
        description="Separa los sprites de un spritesheet en imágenes individuales."
    )
    parser.add_argument("image", help="Ruta al archivo de imagen del spritesheet")
    parser.add_argument(
        "--output", "-o",
        help="Carpeta de salida (por defecto: <nombre>_frames/)",
        default=None,
    )
    parser.add_argument(
        "--padding", "-p",
        help="Píxeles de padding alrededor de cada sprite (default: 2)",
        type=int,
        default=2,
    )
    parser.add_argument(
        "--min-size", "-m",
        help="Tamaño mínimo en px para considerar un sprite (default: 10)",
        type=int,
        default=10,
    )

    args = parser.parse_args()
    split_spritesheet(args.image, args.output, args.padding, args.min_size)


if __name__ == "__main__":
    main()

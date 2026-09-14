/** Keep the same visible world area when a phone is rotated. */
export function getLandscapeSize(viewWidth: number, viewHeight: number) {
  const width = Math.max(viewWidth, viewHeight);
  const height = Math.min(viewWidth, viewHeight);
  const zoom = Math.min(width / 1280, height / 720);
  return { width: width / zoom, height: height / zoom, zoom };
}

/** Inverse of the wrapper's clockwise CSS rotation; x/y are local screen pixels. */
export function unrotatePoint(x: number, y: number, screenWidth: number) {
  return { x: y, y: screenWidth - x };
}

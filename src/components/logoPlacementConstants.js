export const LOGO_BASE_SIZE = 100;

export const DEFAULT_LOGO_TRANSFORM = { x: 50, y: 50, scale: 1, rotation: 0 };

export function clampTransform(t) {
  return {
    x: Math.min(100, Math.max(0, t.x)),
    y: Math.min(100, Math.max(0, t.y)),
    scale: Math.min(4, Math.max(0.25, t.scale)),
    rotation: Math.round(t.rotation),
  };
}

export function placedLogoStaticHTML(logoUrl, transform) {
  if (!logoUrl) return '';
  const t = { ...DEFAULT_LOGO_TRANSFORM, ...transform };
  return `<img src="${logoUrl}" alt="" style="position:absolute;left:${t.x}%;top:${t.y}%;width:${LOGO_BASE_SIZE}px;height:${LOGO_BASE_SIZE}px;object-fit:contain;transform:translate(-50%,-50%) rotate(${t.rotation}deg) scale(${t.scale});pointer-events:none">`;
}

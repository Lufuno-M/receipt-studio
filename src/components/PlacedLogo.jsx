import { useCallback, useRef } from 'react';
import { LOGO_BASE_SIZE, clampTransform } from './logoPlacementConstants';

export default function PlacedLogo({ logoUrl, transform, onChange, containerRef }) {
  const dragState = useRef(null);

  const handlePointerMove = useCallback((e) => {
    const s = dragState.current;
    if (!s) return;
    const { mode, rect, centerX, centerY, startClientX, startClientY, startDist, startAngle, start } = s;

    if (mode === 'move') {
      const dxPct = ((e.clientX - startClientX) / rect.width) * 100;
      const dyPct = ((e.clientY - startClientY) / rect.height) * 100;
      onChange(clampTransform({ ...start, x: start.x + dxPct, y: start.y + dyPct }));
    } else if (mode === 'scale') {
      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      onChange(clampTransform({ ...start, scale: start.scale * (dist / startDist) }));
    } else if (mode === 'rotate') {
      const angle = (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI;
      onChange(clampTransform({ ...start, rotation: start.rotation + (angle - startAngle) }));
    }
  }, [onChange]);

  const handlePointerUp = useCallback(() => {
    dragState.current = null;
    window.removeEventListener('pointermove', handlePointerMove);
    window.removeEventListener('pointerup', handlePointerUp);
  }, [handlePointerMove]);

  const beginDrag = useCallback((mode, e) => {
    e.stopPropagation();
    e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const centerX = rect.left + (rect.width * transform.x) / 100;
    const centerY = rect.top + (rect.height * transform.y) / 100;
    dragState.current = {
      mode,
      rect,
      centerX,
      centerY,
      startClientX: e.clientX,
      startClientY: e.clientY,
      startDist: Math.hypot(e.clientX - centerX, e.clientY - centerY) || 1,
      startAngle: (Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180) / Math.PI,
      start: transform,
    };
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  }, [containerRef, transform, handlePointerMove, handlePointerUp]);

  if (!logoUrl) return null;

  return (
    <div
      className="placed-logo"
      style={{
        position: 'absolute',
        left: `${transform.x}%`,
        top: `${transform.y}%`,
        width: LOGO_BASE_SIZE,
        height: LOGO_BASE_SIZE,
        transform: `translate(-50%, -50%) rotate(${transform.rotation}deg) scale(${transform.scale})`,
      }}
      onPointerDown={(e) => beginDrag('move', e)}
      title="Drag to reposition"
    >
      <img src={logoUrl} alt="" draggable={false} className="placed-logo-img" />
      <div className="placed-logo-frame">
        <div
          className="placed-logo-handle placed-logo-handle-rotate"
          onPointerDown={(e) => beginDrag('rotate', e)}
          title="Drag to rotate"
        />
        <div
          className="placed-logo-handle placed-logo-handle-scale"
          onPointerDown={(e) => beginDrag('scale', e)}
          title="Drag to resize"
        />
      </div>
    </div>
  );
}

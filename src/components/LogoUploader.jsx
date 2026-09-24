import { useRef } from 'react';

function resizeToDataURL(file, maxDim = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function LogoUploader({ templateId, logoUrl, onChange }) {
  const inputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, SVG, etc).');
      return;
    }
    try {
      const dataUrl = await resizeToDataURL(file);
      onChange(templateId, dataUrl);
    } catch {
      alert('Could not read that image — try a different file.');
    }
    e.target.value = '';
  }

  return (
    <div className="logo-uploader">
      <div className="logo-uploader-preview">
        {logoUrl
          ? <img src={logoUrl} alt="Logo" />
          : <span className="logo-uploader-empty">No logo</span>}
      </div>
      <div className="logo-uploader-actions">
        <button type="button" className="btn-s" onClick={() => inputRef.current?.click()}>
          {logoUrl ? 'Replace logo' : 'Upload logo'}
        </button>
        {logoUrl && (
          <button type="button" className="btn-s" onClick={() => onChange(templateId, '')}>
            Remove
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        style={{ display: 'none' }}
      />
    </div>
  );
}

import { useState, useMemo, useRef, useEffect } from 'react';
import { TEMPLATES } from './data/templates';
import { renderReceipt, calcTotal } from './render/renderReceipt';
import { useLocalStorage } from './hooks/useLocalStorage';
import Sidebar from './components/Sidebar';
import EditorPanel from './components/EditorPanel';
import TemplateIcon from './components/TemplateIcon';

function defaultValues(template) {
  const v = {};
  template.fields.forEach(f => {
    if (f.id) v[f.id] = f.default || '';
  });
  return v;
}

export default function App() {
  const [currentId, setCurrentId] = useState(null);
  const [valuesByTemplate, setValuesByTemplate] = useState({});
  const [logos, setLogos] = useLocalStorage('rs-logos', {});
  const [favorites, setFavorites] = useLocalStorage('rs-favs', []);
  const [recents, setRecents] = useLocalStorage('rs-recents', []);
  const [currency, setCurrency] = useLocalStorage('rs-currency', '$');
  const previewRef = useRef(null);
  const desktopRef = useRef(null);
  const dividerRef = useRef(null);

  const current = TEMPLATES.find(t => t.id === currentId) || null;
  const values = currentId ? (valuesByTemplate[currentId] || defaultValues(current)) : {};

  const total = useMemo(() => current ? calcTotal(current, values) : 0, [current, values]);
  const html = useMemo(() => current ? renderReceipt(current, values, currency, logos[current.id]) : '', [current, values, currency, logos]);

  function openTemplate(id) {
    setCurrentId(id);
    setValuesByTemplate(prev => prev[id] ? prev : { ...prev, [id]: defaultValues(TEMPLATES.find(t => t.id === id)) });
    setRecents(prev => [id, ...prev.filter(r => r !== id)].slice(0, 5));
  }

  function handleFieldChange(fieldId, val) {
    setValuesByTemplate(prev => ({ ...prev, [currentId]: { ...prev[currentId], [fieldId]: val } }));
  }

  function handleLogoChange(templateId, dataUrl) {
    setLogos(prev => ({ ...prev, [templateId]: dataUrl }));
  }

  function toggleFav(id) {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  }

  useEffect(() => {
    const handle = dividerRef.current;
    const desktop = desktopRef.current;
    if (!handle || !desktop) return;
    let dragging = false, startX = 0, startW = 0;

    function onDown(e) {
      dragging = true;
      startX = e.clientX;
      startW = previewRef.current?.closest('.preview-panel')?.getBoundingClientRect().width || 400;
      handle.classList.add('dragging');
      document.body.style.userSelect = 'none';
    }
    function onMove(e) {
      if (!dragging) return;
      const delta = startX - e.clientX;
      const newW = Math.max(280, Math.min(900, startW + delta));
      desktop.style.gridTemplateColumns = `240px 300px 4px ${newW}px`;
    }
    function onUp() {
      dragging = false;
      handle.classList.remove('dragging');
      document.body.style.userSelect = '';
    }

    handle.addEventListener('mousedown', onDown);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      handle.removeEventListener('mousedown', onDown);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
  }, []);

  function buildStandaloneHTML() {
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${current?.name || 'Receipt'}</title>
    <style>body{margin:0;padding:24px;background:#e0e0e0;font-family:Arial,sans-serif}@media print{body{background:#fff;padding:0}}</style>
    </head><body>${previewRef.current?.innerHTML || ''}</body></html>`;
  }

  function handlePrint() {
    if (!current) return;
    const win = window.open('', '_blank');
    if (!win) {
      alert("Your browser blocked the print popup. Check the popup-blocker icon in the address bar, or use 'Copy Full HTML' instead.");
      return;
    }
    win.document.write(buildStandaloneHTML());
    win.document.close();
    setTimeout(() => win.print(), 400);
  }

  function handleDownload() {
    if (!current || !previewRef.current) return;
    const blob = new Blob([buildStandaloneHTML()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${current.id}-receipt.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function handleCopy() {
    if (!current || !previewRef.current) return;
    navigator.clipboard.writeText(previewRef.current.innerHTML);
  }

  return (
    <div className="desktop" id="desktop-layout" ref={desktopRef}>
      <Sidebar
        templates={TEMPLATES}
        logos={logos}
        current={currentId}
        favorites={favorites}
        recents={recents}
        onOpen={openTemplate}
        onToggleFav={toggleFav}
      />

      <div className="editor-panel">
        <div className="editor-nav">
          {!current ? (
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Select a template to begin</div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
              <TemplateIcon template={current} logoUrl={logos[current.id]} size={32} />
              <div>
                <div className="editor-template-name">{current.name}</div>
                <div className="editor-template-sub">{current.sub}</div>
              </div>
            </div>
          )}
        </div>

        <EditorPanel
          template={current}
          values={values}
          onFieldChange={handleFieldChange}
          logoUrl={current ? logos[current.id] : ''}
          onLogoChange={handleLogoChange}
          total={total}
          currency={currency}
        />

        {current && (
          <div className="editor-actions">
            <button className="btn-p" onClick={handleDownload}>↓ Download HTML</button>
            <button className="btn-s" onClick={handlePrint}>Print</button>
            <button className="btn-s" onClick={handleCopy}>Copy Full HTML</button>
          </div>
        )}
      </div>

      <div className="divider-handle" ref={dividerRef}></div>

      <div className="preview-panel">
        <div className="preview-nav">
          <div className="preview-nav-label">Live Preview</div>
          <div className="preview-nav-actions">
            <button className="preview-action-btn" onClick={handlePrint}>Print</button>
            <button className="preview-action-btn" onClick={handleCopy}>Copy HTML</button>
          </div>
        </div>
        <div className="preview-scroll">
          {current ? (
            <div id="receipt-wrap" ref={previewRef} dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <div id="receipt-wrap">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', gap: 12, color: 'var(--text-tertiary)' }}>
                <div style={{ fontSize: 40, opacity: .2 }}>🧾</div>
                <div style={{ fontSize: 12 }}>Select a template to preview</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import LogoUploader from './LogoUploader';

function groupFields(fields) {
  const groups = [];
  let pendingHalf = null;
  fields.forEach(f => {
    if (f.type === 'total' || f.section) {
      if (pendingHalf) { groups.push({ type: 'row', fields: [pendingHalf] }); pendingHalf = null; }
      groups.push({ type: f.type === 'total' ? 'total' : 'section', field: f });
      return;
    }
    if (f.width === 'half') {
      if (pendingHalf) {
        groups.push({ type: 'row', fields: [pendingHalf, f] });
        pendingHalf = null;
      } else {
        pendingHalf = f;
      }
      return;
    }
    if (pendingHalf) { groups.push({ type: 'row', fields: [pendingHalf] }); pendingHalf = null; }
    groups.push({ type: 'row', fields: [f] });
  });
  if (pendingHalf) groups.push({ type: 'row', fields: [pendingHalf] });
  return groups;
}

function Field({ f, value, onChange }) {
  if (f.type === 'textarea') {
    return (
      <div className="field">
        <label>{f.label}</label>
        <textarea
          rows={f.rows || 3}
          value={value ?? ''}
          placeholder={f.placeholder || ''}
          onChange={e => onChange(f.id, e.target.value)}
        />
      </div>
    );
  }
  if (f.type === 'select') {
    return (
      <div className={`field${f.width === 'half' ? ' half' : ''}`}>
        <label>{f.label}</label>
        <select value={value ?? ''} onChange={e => onChange(f.id, e.target.value)}>
          {(f.options || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
    );
  }
  return (
    <div className={`field${f.width === 'half' ? ' half' : ''}`}>
      <label>{f.label}</label>
      <input
        type={f.type || 'text'}
        value={value ?? ''}
        placeholder={f.placeholder || ''}
        onChange={e => onChange(f.id, e.target.value)}
      />
    </div>
  );
}

export default function EditorPanel({ template, values, onFieldChange, logoUrl, onLogoChange, logoTransform, onLogoTransformChange, onLogoTransformReset, total, currency }) {
  if (!template) {
    return (
      <div id="editor-empty" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 }}>
        <div style={{ fontSize: 32, opacity: .2 }}>←</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center' }}>Pick a template from the sidebar</div>
      </div>
    );
  }

  const groups = groupFields(template.fields);

  return (
    <div className="editor-fields">
      <div className="field">
        <label>Brand Logo</label>
        <LogoUploader templateId={template.id} logoUrl={logoUrl} onChange={onLogoChange} />
      </div>

      {logoUrl && (
        <div className="logo-placement-controls">
          <label>Logo Placement — drag it on the preview, or fine-tune here</label>
          <div className="logo-placement-grid">
            <div className="lp-control">
              <span>X position</span>
              <input type="range" min="0" max="100" value={logoTransform.x}
                onChange={e => onLogoTransformChange({ ...logoTransform, x: Number(e.target.value) })} />
            </div>
            <div className="lp-control">
              <span>Y position</span>
              <input type="range" min="0" max="100" value={logoTransform.y}
                onChange={e => onLogoTransformChange({ ...logoTransform, y: Number(e.target.value) })} />
            </div>
            <div className="lp-control">
              <span>Scale</span>
              <input type="range" min="0.25" max="4" step="0.05" value={logoTransform.scale}
                onChange={e => onLogoTransformChange({ ...logoTransform, scale: Number(e.target.value) })} />
            </div>
            <div className="lp-control">
              <span>Rotation</span>
              <input type="range" min="-180" max="180" value={logoTransform.rotation}
                onChange={e => onLogoTransformChange({ ...logoTransform, rotation: Number(e.target.value) })} />
            </div>
          </div>
          <button type="button" className="btn-s" onClick={onLogoTransformReset}>Reset to default position</button>
        </div>
      )}

      {groups.map((g, i) => {
        if (g.type === 'section') return <div className="sec" key={i}>{g.field.section}</div>;
        if (g.type === 'total') {
          return (
            <div className="total-box" key={i}>
              <div className="total-label">{g.field.label || 'Order Total'}</div>
              <div className="total-val">{currency}{total.toFixed(2)}</div>
            </div>
          );
        }
        if (g.fields.length === 2) {
          return (
            <div className="r2" key={i}>
              {g.fields.map(f => <Field key={f.id} f={f} value={values[f.id]} onChange={onFieldChange} />)}
            </div>
          );
        }
        return g.fields.map(f => <Field key={f.id} f={f} value={values[f.id]} onChange={onFieldChange} />);
      })}
    </div>
  );
}

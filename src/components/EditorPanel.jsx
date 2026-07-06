import LogoUploader from './LogoUploader';

// Groups consecutive "half" width fields into row-pairs (mirrors the
// regex-based pairing the old renderer.js did on the HTML string, just
// done on data instead of markup).
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

export default function EditorPanel({ template, values, onFieldChange, logoUrl, onLogoChange, total, currency }) {
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

      {groups.map((g, i) => {
        if (g.type === 'section') return <div className="sec" key={i}>{g.field.section}</div>;
        if (g.type === 'total') {
          return (
            <div className="total-box" key={i}>
              <div className="total-label">Order Total</div>
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

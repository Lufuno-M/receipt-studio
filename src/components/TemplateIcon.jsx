export default function TemplateIcon({ template, logoUrl, size = 28 }) {
  const radius = size < 32 ? 6 : 8;
  const fontSize = size < 32 ? 10 : 13;
  const style = {
    width: size, height: size, borderRadius: radius,
    background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  };
  if (logoUrl) {
    return (
      <div style={{ ...style, overflow: 'hidden' }}>
        <img src={logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 3 }} />
      </div>
    );
  }
  return (
    <div style={{ ...style, fontFamily: "'Space Grotesk',sans-serif", fontSize, fontWeight: 700, color: 'var(--text-secondary)' }}>
      {template.initial}
    </div>
  );
}

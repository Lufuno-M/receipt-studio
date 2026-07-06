import { useState } from 'react';
import { CATS, CAT_ORDER } from '../data/templates';
import TemplateIcon from './TemplateIcon';

export default function Sidebar({ templates, logos, current, favorites, recents, onOpen, onToggleFav }) {
  const [query, setQuery] = useState('');
  const lower = query.toLowerCase();
  const filtered = templates.filter(t =>
    !lower || t.name.toLowerCase().includes(lower) || t.sub.toLowerCase().includes(lower)
  );

  function Item({ t }) {
    const isActive = current === t.id;
    const isFav = favorites.includes(t.id);
    return (
      <div className={`sidebar-item${isActive ? ' active' : ''}`} onClick={() => onOpen(t.id)}>
        <TemplateIcon template={t} logoUrl={logos[t.id]} size={28} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="item-name">{t.name}</div>
          <div className="item-tag">{t.sub}</div>
        </div>
        <span
          className={`item-star${isFav ? ' on' : ''}`}
          onClick={(e) => { e.stopPropagation(); onToggleFav(t.id); }}
        >★</span>
      </div>
    );
  }

  const favItems = filtered.filter(t => favorites.includes(t.id));
  const recentItems = recents.map(id => templates.find(t => t.id === id)).filter(Boolean)
    .filter(t => !lower || t.name.toLowerCase().includes(lower));

  return (
    <div className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <span className="sidebar-brand-dot"></span>Receipt Studio
        </div>
        <div className="search-wrap">
          <svg className="search-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="6.5" cy="6.5" r="4.5" /><path d="M10.5 10.5L14 14" />
          </svg>
          <input className="search-input" placeholder="Search templates..." value={query} onChange={e => setQuery(e.target.value)} />
        </div>
      </div>
      <div className="sidebar-scroll">
        {!filtered.length && <div className="sidebar-empty">No templates found</div>}

        {!query && favItems.length > 0 && (
          <div className="sidebar-section">
            <div className="sidebar-section-label">⭐ Favorites</div>
            {favItems.map(t => <Item key={t.id} t={t} />)}
          </div>
        )}

        {!query && recentItems.length > 0 && (
          <div className="sidebar-section">
            <div className="sidebar-section-label">Recent</div>
            {recentItems.slice(0, 3).map(t => <Item key={t.id} t={t} />)}
          </div>
        )}

        {CAT_ORDER.map(cat => {
          const items = filtered.filter(t => t.category === cat);
          if (!items.length) return null;
          return (
            <div className="sidebar-section" key={cat}>
              <div className="sidebar-section-label">{CATS[cat]}</div>
              {items.map(t => <Item key={t.id} t={t} />)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

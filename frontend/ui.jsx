import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';

const Icon = ({ name, size = 16, stroke = 1.6 }) => {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/></>,
    users:     <><circle cx="9" cy="8" r="3.5"/><path d="M3 20c0-3 2.7-5.5 6-5.5s6 2.5 6 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M15 14.5c2.8 0 5 1.8 5 4"/></>,
    book:      <><path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19v15.5H5.5A1.5 1.5 0 0 0 4 20"/><path d="M4 4.5V20a1.5 1.5 0 0 0 1.5 1.5H19"/><path d="M8 7h7M8 10.5h7"/></>,
    link:      <><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1.5 1.5"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1.5-1.5"/></>,
    user:      <><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.5-7 8-7s8 3 8 7"/></>,
    bell:      <><path d="M6 9a6 6 0 0 1 12 0v4l1.5 3h-15L6 13Z"/><path d="M10 19a2 2 0 0 0 4 0"/></>,
    search:    <><circle cx="11" cy="11" r="6.5"/><path d="m20 20-3.5-3.5"/></>,
    plus:      <><path d="M12 5v14M5 12h14"/></>,
    edit:      <><path d="M4 20h4l10-10-4-4L4 16Z"/><path d="m13.5 6.5 4 4"/></>,
    trash:     <><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6 7v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7"/><path d="M10 11v6M14 11v6"/></>,
    check:     <><path d="m5 12 5 5L20 6"/></>,
    x:         <><path d="M6 6l12 12M6 18 18 6"/></>,
    chevron:   <><path d="m9 6 6 6-6 6"/></>,
    chevronD:  <><path d="m6 9 6 6 6-6"/></>,
    sun:       <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    moon:      <><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></>,
    logout:    <><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4"/><path d="M10 17l-5-5 5-5M5 12h11"/></>,
    eye:       <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
    arrow:     <><path d="M5 12h14M13 5l7 7-7 7"/></>,
    grad:      <><path d="M2 9l10-5 10 5-10 5L2 9Z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/></>,
    clock:     <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    calendar:  <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></>,
    spark:     <><path d="m12 3 2 6 6 2-6 2-2 6-2-6-6-2 6-2Z"/></>,
    filter:    <><path d="M3 5h18l-7 9v6l-4-2v-4Z"/></>,
    download:  <><path d="M12 4v12M6 12l6 6 6-6M4 20h16"/></>,
    copy:      <><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/></>,
    menu:      <><path d="M4 7h16M4 12h16M4 17h16"/></>,
    home:      <><path d="m3 11 9-7 9 7v9a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1Z"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={stroke}
         strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || null}
    </svg>
  );
};

const Avatar = ({ name, color = 'blue', size = 'md' }) => {
  const initials = name
    .split(/\s+/).filter(Boolean).slice(0, 2)
    .map(w => w[0].toUpperCase()).join('');
  const cls = `avatar avatar-${color}` +
    (size === 'lg' ? ' avatar-lg' : size === 'xl' ? ' avatar-xl' : '');
  return <span className={cls}>{initials}</span>;
};

const StatusBadge = ({ status }) => {
  const meta = window.STATUS_META[status] || { label: status, badge: 'badge-neutral' };
  return <span className={`badge badge-dot ${meta.badge}`}>{meta.label}</span>;
};

const Modal = ({ open, onClose, title, subtitle, children, footer, width }) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose && onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={width ? { width } : undefined}>
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h3>
              {subtitle && (
                <p style={{ marginTop: 4, fontSize: 13, color: 'var(--ink-500)' }}>{subtitle}</p>
              )}
            </div>
            <button className="btn-icon" onClick={onClose} aria-label="Fechar"><Icon name="x" /></button>
          </div>
        </div>
        <div style={{ padding: '20px 24px', overflow: 'auto', flex: '1 1 auto' }}>{children}</div>
        {footer && (
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--line)', background: 'var(--bg-soft)',
                        display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const ToastContext = createContext({ push: () => {} });
const useToast = () => useContext(ToastContext);

const ToastProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const push = useCallback((msg, opts = {}) => {
    const id = Math.random().toString(36).slice(2);
    setItems(prev => [...prev, { id, msg, ...opts }]);
    setTimeout(() => setItems(prev => prev.filter(t => t.id !== id)), opts.duration || 2600);
  }, []);
  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="toast-stack">
        {items.map(t => (
          <div key={t.id} className="toast">
            <span style={{
              width: 8, height: 8, borderRadius: '50%',
              background: t.tone === 'danger' ? 'var(--danger)' :
                          t.tone === 'warn'   ? 'var(--warn)' :
                                                 'var(--success)',
            }} />
            {t.msg}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ConfirmDialog = ({ open, title, message, confirmLabel = 'Confirmar', tone = 'danger', onConfirm, onClose }) => (
  <Modal open={open} onClose={onClose} title={title} width={420}
    footer={<>
      <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
      <button className={`btn ${tone === 'danger' ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>{confirmLabel}</button>
    </>}>
    <p style={{ fontSize: 13.5, color: 'var(--ink-700)', lineHeight: 1.6 }}>{message}</p>
  </Modal>
);

const SparkBars = ({ data, color = 'var(--primary)', height = 56 }) => {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height, width: '100%' }}>
      {data.map((v, i) => (
        <div key={i} style={{
          flex: 1,
          height: `${(v / max) * 100}%`,
          background: color,
          borderRadius: '3px 3px 0 0',
          opacity: 0.35 + 0.65 * (v / max),
          minHeight: 2,
        }} />
      ))}
    </div>
  );
};

const Donut = ({ slices, size = 120, thickness = 14 }) => {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--bg-soft)" strokeWidth={thickness} />
      {slices.map((s, i) => {
        const dash = (s.value / total) * c;
        const offset = c * 0.25 - acc;
        acc += dash;
        return (
          <circle key={i}
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke={s.color} strokeWidth={thickness}
            strokeDasharray={`${dash} ${c - dash}`}
            strokeDashoffset={offset}
            strokeLinecap="butt"
            transform={`rotate(0 ${size/2} ${size/2})`}
          />
        );
      })}
    </svg>
  );
};

const EmptyState = ({ icon = 'search', title, hint, action }) => (
  <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--ink-500)' }}>
    <div style={{
      width: 56, height: 56, margin: '0 auto 16px',
      background: 'var(--bg-soft)', borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--ink-400)',
    }}>
      <Icon name={icon} size={22} />
    </div>
    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-900)' }}>{title}</div>
    {hint && <div style={{ marginTop: 6, fontSize: 13 }}>{hint}</div>}
    {action && <div style={{ marginTop: 16 }}>{action}</div>}
  </div>
);

const PageWrap = ({ children }) => (
  <div style={{ padding: '28px 32px 48px', maxWidth: 1280, margin: '0 auto' }}>{children}</div>
);

Object.assign(window, {
  Icon, Avatar, StatusBadge, Modal, ConfirmDialog,
  ToastProvider, useToast, SparkBars, Donut, EmptyState, PageWrap,
});

export {
  Icon,
  Avatar,
  StatusBadge,
  Modal,
  ConfirmDialog,
  ToastProvider,
  useToast,
  SparkBars,
  Donut,
  EmptyState,
  PageWrap,
};

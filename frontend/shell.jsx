/* Shell — sidebar + topbar para Admin e Aluno */

const Sidebar = ({ session, current, onNav, onLogout }) => {
  const adminNav = [
    { key: 'dashboard',   label: 'Dashboard',   icon: 'dashboard' },
    { key: 'alunos',      label: 'Alunos',      icon: 'users'     },
    { key: 'cursos',      label: 'Cursos',      icon: 'book'      },
    { key: 'matriculas',  label: 'Matrículas',  icon: 'link'      },
  ];
  const alunoNav = [
    { key: 'home',        label: 'Início',          icon: 'home'  },
    { key: 'meus-dados',  label: 'Meus dados',      icon: 'user'  },
    { key: 'meus-cursos', label: 'Meus cursos',     icon: 'grad'  },
  ];
  const nav = session.tipo === 'admin' ? adminNav : alunoNav;

  return (
    <aside style={{
      width: 'var(--sidebar-w)', flexShrink: 0,
      background: 'var(--bg-card)',
      borderRight: '1px solid var(--line)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
    }}>
      {/* brand */}
      <div style={{ padding: '20px 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 9,
          background: 'var(--ink-900)', color: 'var(--bg-page)',
          display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
        }}>P/M</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.2 }}>Portal</div>
          <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>de Matrículas</div>
        </div>
      </div>

      {/* role tag */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 10px', borderRadius: 999,
          background: session.tipo === 'admin' ? 'var(--pastel-lilac-soft)' : 'var(--pastel-blue-soft)',
          color: session.tipo === 'admin' ? '#635B82' : '#4A6F87',
          fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 500,
          letterSpacing: '0.05em',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
          {session.tipo === 'admin' ? 'ADMINISTRADOR' : 'ALUNO'}
        </div>
      </div>

      {/* nav */}
      <nav style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        <div className="eyebrow" style={{ padding: '8px 8px 6px', fontSize: 10 }}>Navegação</div>
        {nav.map(item => {
          const active = current === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNav(item.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 8, border: 'none',
                background: active ? 'var(--bg-soft)' : 'transparent',
                color: active ? 'var(--ink-900)' : 'var(--ink-700)',
                fontSize: 13, fontWeight: active ? 600 : 500,
                textAlign: 'left', cursor: 'pointer',
                transition: 'all 0.12s',
                position: 'relative',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg-soft)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              {active && (
                <span style={{
                  position: 'absolute', left: -12, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: 18, borderRadius: 2, background: 'var(--ink-900)',
                }} />
              )}
              <Icon name={item.icon} size={17} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* user footer */}
      <div style={{ padding: 12, borderTop: '1px solid var(--line)' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: 8,
          borderRadius: 10,
        }}>
          <Avatar name={session.user.nome} color={session.user.cor || 'lilac'} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {session.user.nome}
            </div>
            <div className="mono" style={{ fontSize: 10.5, color: 'var(--ink-500)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {session.user.email}
            </div>
          </div>
          <button className="btn-icon" onClick={onLogout} title="Sair"><Icon name="logout" size={15} /></button>
        </div>
      </div>
    </aside>
  );
};

const Topbar = ({ title, subtitle, actions, theme, onToggleTheme }) => (
  <header style={{
    height: 'var(--topbar-h)', flexShrink: 0,
    padding: '0 32px',
    background: 'var(--bg-page)',
    borderBottom: '1px solid var(--line)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
    position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(8px)',
  }}>
    <div style={{ minWidth: 0 }}>
      <h1 style={{ fontSize: 18, letterSpacing: '-0.015em' }}>{title}</h1>
      {subtitle && <div style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 2 }}>{subtitle}</div>}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {actions}
      <div style={{ width: 1, height: 24, background: 'var(--line)', margin: '0 4px' }} />
      <button className="btn-icon" onClick={onToggleTheme} title="Alternar tema">
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={16} />
      </button>
      <button className="btn-icon" title="Notificações" style={{ position: 'relative' }}>
        <Icon name="bell" size={16} />
        <span style={{
          position: 'absolute', top: 6, right: 6,
          width: 7, height: 7, borderRadius: '50%',
          background: 'var(--pastel-peach)', border: '2px solid var(--bg-page)',
        }} />
      </button>
    </div>
  </header>
);

window.Sidebar = Sidebar;
window.Topbar = Topbar;

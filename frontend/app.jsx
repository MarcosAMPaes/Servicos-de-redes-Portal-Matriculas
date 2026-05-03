/* Root App — orchestrates session, theme, navigation */

const { useState: useStateApp, useEffect: useEffectApp } = React;

const App = () => {
  const [session, setSession] = useStateApp(null);
  const [route, setRoute] = useStateApp('dashboard');
  const [theme, setTheme] = useStateApp(() => localStorage.getItem('pm-theme') || 'light');

  // Dados vindos da API. Começam vazios e são carregados após o login.
  const [alunos, setAlunos]         = useStateApp([]);
  const [cursos, setCursos]         = useStateApp([]);
  const [matriculas, setMatriculas] = useStateApp([]);

  useEffectApp(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('pm-theme', theme);
  }, [theme]);

  const normalizeMatriculas = (items) => items.map(m => ({
    ...m,
    aluno_id: m.aluno_id ?? m.aluno?.id,
    curso_id: m.curso_id ?? m.curso?.id,
  }));

  const loadAdminData = async () => {
    const [apiAlunos, apiCursos, apiMatriculas] = await Promise.all([
      API.getAlunos(),
      API.getCursos(),
      API.getMatriculas(),
    ]);
    setAlunos(apiAlunos);
    setCursos(apiCursos);
    setMatriculas(normalizeMatriculas(apiMatriculas));
  };

  const loadAlunoData = async () => {
    const minhas = normalizeMatriculas(await API.minhasMatriculas())
      .filter(m => m.status !== 'cancelada');
    const cursosUnicos = Array.from(
      new Map(minhas.map(m => [m.curso.id, m.curso])).values()
    );
    setAlunos([]);
    setCursos(cursosUnicos);
    setMatriculas(minhas);
  };

  const onLogin = async (s) => {
    if (s.tipo === 'admin') await loadAdminData();
    else await loadAlunoData();
    setSession(s);
    setRoute(s.tipo === 'admin' ? 'dashboard' : 'home');
  };
  const onLogout = () => {
    API.setToken(null);
    setSession(null);
    setAlunos([]);
    setCursos([]);
    setMatriculas([]);
  };

  // Tweaks panel — light/dark
  useEffectApp(() => {
    const onMsg = (e) => {
      if (e.data?.type === '__activate_edit_mode')   window.__pmShowTweaks?.(true);
      if (e.data?.type === '__deactivate_edit_mode') window.__pmShowTweaks?.(false);
    };
    window.addEventListener('message', onMsg);
    window.parent.postMessage({ type: '__edit_mode_available' }, '*');
    return () => window.removeEventListener('message', onMsg);
  }, []);

  if (!session) return <Login onLogin={onLogin} />;

  const isAdmin = session.tipo === 'admin';
  const titleMap = isAdmin ? {
    dashboard:  ['Dashboard',  'Visão geral do sistema'],
    alunos:     ['Alunos',     'Gestão de alunos cadastrados'],
    cursos:     ['Cursos',     'Catálogo de cursos da instituição'],
    matriculas: ['Matrículas', 'Vínculos entre alunos e cursos'],
  } : {
    home:        ['Início',     'Resumo das suas matrículas'],
    'meus-dados': ['Meus dados', 'Informações pessoais'],
    'meus-cursos':['Meus cursos','Cursos em que estou matriculado'],
  };
  const [title, subtitle] = titleMap[route] || ['', ''];

  let pageNode = null;
  if (isAdmin) {
    if (route === 'dashboard')  pageNode = <AdminDashboard  alunos={alunos} cursos={cursos} matriculas={matriculas} onNav={setRoute} />;
    if (route === 'alunos')     pageNode = <AdminAlunos     alunos={alunos} cursos={cursos} matriculas={matriculas} setAlunos={setAlunos} />;
    if (route === 'cursos')     pageNode = <AdminCursos     cursos={cursos} matriculas={matriculas} alunos={alunos}  setCursos={setCursos} />;
    if (route === 'matriculas') pageNode = <AdminMatriculas alunos={alunos} cursos={cursos} matriculas={matriculas} setMatriculas={setMatriculas} />;
  } else {
    if (route === 'home')         pageNode = <AlunoHome       session={session} cursos={cursos} matriculas={matriculas} onNav={setRoute} />;
    if (route === 'meus-dados')   pageNode = <AlunoMeusDados  session={session} />;
    if (route === 'meus-cursos')  pageNode = <AlunoMeusCursos session={session} cursos={cursos} matriculas={matriculas} />;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar session={session} current={route} onNav={setRoute} onLogout={onLogout} />
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Topbar title={title} subtitle={subtitle}
                theme={theme}
                onToggleTheme={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
                actions={null} />
        <div style={{ flex: 1, overflow: 'auto' }}>
          {pageNode}
        </div>
      </main>
      <PMTweaks theme={theme} setTheme={setTheme} />
    </div>
  );
};

const PMTweaks = ({ theme, setTheme }) => {
  const [open, setOpen] = useStateApp(false);
  useEffectApp(() => { window.__pmShowTweaks = setOpen; }, []);
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, width: 280,
      background: 'var(--bg-card)', border: '1px solid var(--line)',
      borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
      padding: 16, zIndex: 50,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div>
          <div className="eyebrow">Tweaks</div>
          <h4 style={{ fontSize: 14, marginTop: 4 }}>Aparência</h4>
        </div>
        <button className="btn-icon" onClick={() => {
          setOpen(false);
          window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*');
        }}><Icon name="x" size={14} /></button>
      </div>
      <div className="eyebrow" style={{ marginBottom: 8 }}>Tema</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {[['light', 'sun', 'Claro'], ['dark', 'moon', 'Escuro']].map(([k, ic, lab]) => (
          <button key={k} onClick={() => setTheme(k)} style={{
            padding: '12px 8px', borderRadius: 10,
            border: '1px solid ' + (theme === k ? 'var(--ink-900)' : 'var(--line)'),
            background: theme === k ? 'var(--bg-soft)' : 'var(--bg-card)',
            color: 'var(--ink-900)', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500,
          }}>
            <Icon name={ic} size={16} />{lab}
          </button>
        ))}
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <ToastProvider><App /></ToastProvider>
);

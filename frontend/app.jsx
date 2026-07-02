
import { useEffect, useState } from 'react';
import API from './api.jsx';
import { AdminAlunos } from './admin-alunos.jsx';
import { AdminCursos } from './admin-cursos.jsx';
import { AdminDashboard } from './admin-dashboard.jsx';
import { AdminMatriculas } from './admin-matriculas.jsx';
import { AlunoHome, AlunoMeusCursos, AlunoMeusDados } from './aluno.jsx';
import { Login } from './login.jsx';
import { Sidebar, Topbar } from './shell.jsx';

const App = () => {
  const [session, setSession] = useState(null);
  const [route, setRoute] = useState('dashboard');
  const [theme, setTheme] = useState(() => localStorage.getItem('pm-theme') || 'light');

  const [alunos, setAlunos]         = useState([]);
  const [cursos, setCursos]         = useState([]);
  const [matriculas, setMatriculas] = useState([]);

  useEffect(() => {
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
    </div>
  );
};

export { App };

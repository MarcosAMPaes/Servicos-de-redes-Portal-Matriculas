
import { useState } from 'react';
import API from './api.jsx';
import { Icon } from './ui.jsx';

const Login = ({ onLogin }) => {
  const [mode, setMode] = useState('admin');
  const [email, setEmail] = useState('admin@portal.local');
  const [senha, setSenha] = useState('admin123');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const switchMode = (m) => {
    setMode(m);
    setErro('');
    if (m === 'admin') { setEmail('admin@portal.local'); setSenha('admin123'); }
    else               { setEmail('arthur.sandrini@portal.local'); setSenha('aluno123'); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setErro(''); setLoading(true);
    try {
      const result = await API.login(email, senha);
      API.setToken(result.access_token);

      const user = result.tipo === 'admin'
        ? await API.me()
        : await API.meusDados();

      await onLogin({ tipo: result.tipo, user });
    } catch (err) {
      API.setToken(null);
      setErro(err.detail || 'Erro ao conectar ao servidor.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1.1fr 1fr', background: 'var(--bg-page)' }}>
      <div style={{
        position: 'relative',
        background: 'linear-gradient(155deg, var(--pastel-blue-soft) 0%, var(--pastel-green-soft) 60%, var(--pastel-peach-soft) 100%)',
        padding: '48px 56px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        overflow: 'hidden',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 2 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--ink-900)', color: 'var(--bg-page)',
            display: 'grid', placeItems: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700,
          }}>P/M</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink-900)' }}>Portal de Matrículas</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--ink-500)' }}>v1.0 · Docker Swarm</div>
          </div>
        </div>

        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.65 }} aria-hidden>
          <circle cx="78%" cy="22%" r="160" fill="var(--pastel-lilac)" opacity="0.35" />
          <circle cx="18%" cy="78%" r="200" fill="var(--pastel-peach)" opacity="0.32" />
          <circle cx="60%" cy="60%" r="120" fill="var(--pastel-green)" opacity="0.28" />
        </svg>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 460 }}>
          <div className="eyebrow" style={{ marginBottom: 18 }}>Período letivo · 2026.1</div>
          <h1 style={{
            fontSize: 44, lineHeight: 1.05, letterSpacing: '-0.02em',
            color: 'var(--ink-900)', fontWeight: 600,
          }}>
            Gestão de alunos,<br/>cursos e matrículas<br/>
            <span style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif', color: 'var(--ink-700)' }}>em um só portal.</span>
          </h1>
          <p style={{ marginTop: 20, fontSize: 14.5, color: 'var(--ink-700)', lineHeight: 1.6, maxWidth: 420 }}>
            Plataforma acadêmica do <span className="mono" style={{ background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4 }}>Grupo&nbsp;4</span> — Serviços de Redes para Internet.
            Backend FastAPI, banco PostgreSQL, NGINX como proxy reverso.
          </p>
        </div>

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { tag: 'nginx',    sub: ':80 (HTTP)' },
            { tag: 'fastapi',  sub: ':8080 internal' },
            { tag: 'postgres', sub: 'volume persisted' },
          ].map(s => (
            <div key={s.tag} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-900)', fontWeight: 600 }}>{s.tag}</span>
              <span className="mono" style={{ fontSize: 11, color: 'var(--ink-500)' }}>{s.sub}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <div style={{
            display: 'inline-flex', padding: 4, borderRadius: 999,
            background: 'var(--bg-soft)', border: '1px solid var(--line)',
            marginBottom: 28, gap: 2,
          }}>
            {[['admin', 'Administrador'], ['aluno', 'Aluno']].map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => switchMode(k)}
                style={{
                  height: 30, padding: '0 16px', borderRadius: 999, border: 'none',
                  background: mode === k ? 'var(--bg-card)' : 'transparent',
                  color: mode === k ? 'var(--ink-900)' : 'var(--ink-500)',
                  fontSize: 12.5, fontWeight: 500,
                  boxShadow: mode === k ? 'var(--shadow-xs)' : 'none',
                  transition: 'all 0.15s',
                }}
              >{label}</button>
            ))}
          </div>

          <h2 style={{ fontSize: 26, letterSpacing: '-0.02em' }}>
            {mode === 'admin' ? 'Acesso administrativo' : 'Bem-vindo, aluno'}
          </h2>
          <p style={{ marginTop: 6, fontSize: 13.5, color: 'var(--ink-500)' }}>
            {mode === 'admin'
              ? 'Gestão completa de alunos, cursos e matrículas.'
              : 'Acompanhe seus dados e os cursos em que está matriculado.'}
          </p>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 26 }}>
            <div className="field">
              <label className="label">{mode === 'aluno' ? 'E-mail ou matrícula' : 'E-mail'}</label>
              <input className="input" value={email} onChange={e => setEmail(e.target.value)}
                     placeholder={mode === 'admin' ? 'admin@portal.local' : 'seu.nome@portal.local'} />
            </div>
            <div className="field">
              <label className="label">Senha</label>
              <input type="password" className="input" value={senha} onChange={e => setSenha(e.target.value)} />
            </div>

            {erro && (
              <div style={{
                padding: '10px 12px', borderRadius: 8, fontSize: 12.5,
                background: 'var(--danger-soft)', color: '#8B4A52',
                border: '1px solid var(--pastel-rose)',
              }}>{erro}</div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}
                    style={{ height: 42, marginTop: 6 }}>
              {loading ? 'Entrando…' : <><span>Entrar</span> <Icon name="arrow" size={14} /></>}
            </button>
          </form>

          <div style={{
            marginTop: 24, padding: '12px 14px', borderRadius: 10,
            background: 'var(--bg-soft)', border: '1px dashed var(--line-strong)',
            fontSize: 12, color: 'var(--ink-500)', lineHeight: 1.5,
          }}>
            <div style={{ fontWeight: 600, color: 'var(--ink-700)', marginBottom: 4 }}>Credenciais demo</div>
            {mode === 'admin' ? (
              <div className="mono">admin@portal.local / admin123</div>
            ) : (
              <div className="mono">arthur.sandrini@portal.local / aluno123</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

window.Login = Login;

export { Login };

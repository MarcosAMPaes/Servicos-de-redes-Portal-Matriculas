
const AlunoHome = ({ session, cursos, matriculas, onNav }) => {
  const aluno = session.user;
  const minhasMat = matriculas.filter(m => m.aluno_id === aluno.id);
  const ativas = minhasMat.filter(m => m.status === 'ativa');
  const concluidas = minhasMat.filter(m => m.status === 'concluida');
  const cargaTotal = ativas.reduce((s, m) => {
    const c = cursos.find(x => x.id === m.curso_id);
    return s + (c?.carga_horaria || 0);
  }, 0);

  return (
    <PageWrap>
      <div style={{
        position: 'relative',
        background: 'linear-gradient(135deg, var(--pastel-blue-soft), var(--pastel-green-soft) 60%, var(--pastel-peach-soft))',
        borderRadius: 'var(--radius-xl)',
        padding: '32px 36px',
        marginBottom: 18,
        overflow: 'hidden',
        border: '1px solid var(--line)',
      }}>
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.5 }} aria-hidden>
          <circle cx="92%" cy="20%" r="120" fill="var(--pastel-lilac)" opacity="0.4" />
          <circle cx="78%" cy="100%" r="90" fill="var(--pastel-peach)" opacity="0.35" />
        </svg>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 22 }}>
          <Avatar name={aluno.nome} color={aluno.cor} size="xl" />
          <div style={{ flex: 1 }}>
            <div className="eyebrow">Bem-vindo de volta</div>
            <h2 style={{ fontSize: 30, marginTop: 6, letterSpacing: '-0.02em' }}>
              Olá, {aluno.nome.split(' ')[0]}.
              <span style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif', color: 'var(--ink-700)', fontWeight: 400 }}> Aqui está seu painel.</span>
            </h2>
            <div style={{ marginTop: 8, display: 'flex', gap: 18, flexWrap: 'wrap' }}>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-700)' }}>matrícula · {aluno.matricula}</span>
              <span className="mono" style={{ fontSize: 12, color: 'var(--ink-700)' }}>período · 2026.1</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 14 }}>
        {[
          { eyebrow: 'Cursos ativos', value: ativas.length, sub: ativas.length === 1 ? 'curso em andamento' : 'cursos em andamento', color: 'green' },
          { eyebrow: 'Concluídos',    value: concluidas.length, sub: 'até o momento', color: 'blue' },
          { eyebrow: 'Carga horária', value: cargaTotal, sub: 'horas em cursos ativos', color: 'peach', mono: true },
        ].map(s => (
          <div key={s.eyebrow} className="card" style={{ padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `var(--pastel-${s.color}-soft)`,
                color: `var(--pastel-${s.color})`,
                display: 'grid', placeItems: 'center', flexShrink: 0,
              }}>
                <Icon name={s.color === 'green' ? 'grad' : s.color === 'blue' ? 'check' : 'clock'} size={18} />
              </div>
              <div>
                <div className="eyebrow">{s.eyebrow}</div>
                <div className="mono" style={{ fontSize: 26, fontWeight: 600, marginTop: 2, letterSpacing: '-0.02em' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-500)', marginTop: 2 }}>{s.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="eyebrow">Meus cursos</div>
            <h3 style={{ fontSize: 16, marginTop: 6 }}>Matrículas atuais</h3>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={() => onNav('meus-cursos')}>
            Ver detalhes <Icon name="chevron" size={12} />
          </button>
        </div>
        {minhasMat.length === 0 ? (
          <EmptyState icon="grad" title="Nenhuma matrícula"
            hint="Procure a coordenação para realizar sua primeira matrícula." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, padding: '0 22px 22px' }}>
            {minhasMat.map(m => {
              const c = cursos.find(x => x.id === m.curso_id);
              if (!c) return null;
              return (
                <div key={m.id} style={{
                  background: 'var(--bg-soft)', borderRadius: 'var(--radius-md)',
                  padding: 14, display: 'flex', gap: 12, alignItems: 'center',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: `var(--pastel-${c.cor})`,
                    display: 'grid', placeItems: 'center', flexShrink: 0,
                    fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: 'var(--ink-900)',
                  }}>{c.sigla}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>{c.nome}</div>
                    <div style={{ marginTop: 4 }}>
                      <StatusBadge status={m.status} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageWrap>
  );
};

const AlunoMeusDados = ({ session }) => {
  const aluno = session.user;
  return (
    <PageWrap>
      <div style={{ marginBottom: 20 }}>
        <div className="eyebrow">/api/alunos/me</div>
        <h2 style={{ fontSize: 24, marginTop: 6, letterSpacing: '-0.02em' }}>Meus dados</h2>
      </div>

      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, paddingBottom: 22, borderBottom: '1px solid var(--line)' }}>
          <Avatar name={aluno.nome} color={aluno.cor} size="xl" />
          <div>
            <h3 style={{ fontSize: 20 }}>{aluno.nome}</h3>
            <div className="mono" style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 4 }}>{aluno.matricula}</div>
            <div style={{ marginTop: 8 }}>
              <span className="badge badge-dot badge-green">Ativo</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 22, paddingTop: 22 }}>
          {[
            ['E-mail',             aluno.email,           false],
            ['Matrícula',          aluno.matricula,       true],
            ['Data de nascimento', aluno.data_nascimento, true],
            ['Cadastrado em',      aluno.criado_em,       true],
          ].map(([label, value, mono]) => (
            <div key={label}>
              <div className="eyebrow">{label}</div>
              <div className={mono ? 'mono' : ''} style={{ fontSize: 14, marginTop: 6, color: 'var(--ink-900)' }}>{value}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22, padding: 14, borderRadius: 10, background: 'var(--bg-soft)',
                      fontSize: 12.5, color: 'var(--ink-500)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="eye" size={15} />
          Para alterações nestes dados, entre em contato com a coordenação acadêmica.
        </div>
      </div>
    </PageWrap>
  );
};

const AlunoMeusCursos = ({ session, cursos, matriculas }) => {
  const aluno = session.user;
  const minhas = matriculas.filter(m => m.aluno_id === aluno.id);

  return (
    <PageWrap>
      <div style={{ marginBottom: 20 }}>
        <div className="eyebrow">/api/alunos/me/cursos</div>
        <h2 style={{ fontSize: 24, marginTop: 6, letterSpacing: '-0.02em' }}>
          Meus cursos <span className="mono" style={{ fontSize: 14, color: 'var(--ink-500)', fontWeight: 400, marginLeft: 6 }}>{minhas.length}</span>
        </h2>
        <p style={{ fontSize: 13, color: 'var(--ink-500)', marginTop: 6 }}>
          Apenas os cursos em que você está matriculado, conforme regra de acesso do aluno.
        </p>
      </div>

      {minhas.length === 0 ? (
        <div className="card">
          <EmptyState icon="grad" title="Você não tem matrículas"
            hint="Procure a coordenação acadêmica para realizar sua primeira matrícula." />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 14 }}>
          {minhas.map(m => {
            const c = cursos.find(x => x.id === m.curso_id);
            if (!c) return null;
            return (
              <div key={m.id} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{
                  height: 90, background: `var(--pastel-${c.cor})`,
                  position: 'relative', overflow: 'hidden',
                  display: 'flex', alignItems: 'center', padding: '0 22px',
                }}>
                  <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4 }}>
                    <circle cx="90%" cy="40%" r="60" fill="var(--bg-card)" opacity="0.4" />
                    <circle cx="70%" cy="120%" r="80" fill="var(--bg-card)" opacity="0.3" />
                  </svg>
                  <div style={{
                    position: 'relative', zIndex: 1,
                    fontFamily: 'var(--font-mono)', fontSize: 36, fontWeight: 700,
                    color: 'var(--ink-900)', letterSpacing: '-0.02em',
                  }}>{c.sigla}</div>
                  <div style={{ position: 'absolute', top: 14, right: 14 }}>
                    <StatusBadge status={m.status} />
                  </div>
                </div>
                <div style={{ padding: '18px 22px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: 15.5, lineHeight: 1.3 }}>{c.nome}</h3>
                  <p style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 6, lineHeight: 1.5, flex: 1 }}>
                    {c.descricao}
                  </p>
                  <div style={{ display: 'flex', gap: 18, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                    <div>
                      <div className="eyebrow" style={{ fontSize: 9.5 }}>Carga total</div>
                      <div className="mono" style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{c.carga_horaria}h</div>
                    </div>
                    <div>
                      <div className="eyebrow" style={{ fontSize: 9.5 }}>Matriculado em</div>
                      <div className="mono" style={{ fontSize: 13, fontWeight: 600, marginTop: 2 }}>{m.data_matricula}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrap>
  );
};

window.AlunoHome = AlunoHome;
window.AlunoMeusDados = AlunoMeusDados;
window.AlunoMeusCursos = AlunoMeusCursos;

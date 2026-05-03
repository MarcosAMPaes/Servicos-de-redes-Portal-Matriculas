
const PageWrap = ({ children }) => (
  <div style={{ padding: '28px 32px 48px', maxWidth: 1280, margin: '0 auto' }}>{children}</div>
);

const AdminDashboard = ({ alunos, cursos, matriculas, onNav }) => {
  const totAlunos = alunos.filter(a => a.ativo).length;
  const totCursos = cursos.filter(c => c.ativo).length;
  const totMatAtivas = matriculas.filter(m => m.status === 'ativa').length;
  const totConcluidas = matriculas.filter(m => m.status === 'concluida').length;

  const statusSlices = [
    { label: 'Ativas',     value: matriculas.filter(m => m.status === 'ativa').length,     color: 'var(--pastel-green)' },
    { label: 'Trancadas',  value: matriculas.filter(m => m.status === 'trancada').length,  color: 'var(--pastel-peach)' },
    { label: 'Concluídas', value: matriculas.filter(m => m.status === 'concluida').length, color: 'var(--pastel-blue)'  },
    { label: 'Canceladas', value: matriculas.filter(m => m.status === 'cancelada').length, color: 'var(--pastel-rose)'  },
  ];

  const porCurso = cursos.filter(c => c.ativo).map(c => ({
    curso: c, count: matriculas.filter(m => m.curso_id === c.id && m.status === 'ativa').length,
  })).sort((a, b) => b.count - a.count);
  const maxCurso = Math.max(...porCurso.map(x => x.count), 1);

  const recentMat = [...matriculas]
    .sort((a, b) => b.data_matricula.localeCompare(a.data_matricula))
    .slice(0, 5);

  const stats = [
    { label: 'Alunos ativos',       value: totAlunos,    delta: '+2 este mês',  spark: [3,4,4,5,6,5,7,8], color: 'var(--pastel-blue)' },
    { label: 'Cursos ativos',       value: totCursos,    delta: '4 ativos',     spark: [2,3,3,3,4,4,4,4], color: 'var(--pastel-green)' },
    { label: 'Matrículas ativas',   value: totMatAtivas, delta: 'em 4 cursos',  spark: [4,5,6,6,7,8,9,9], color: 'var(--pastel-peach)' },
    { label: 'Concluídas',          value: totConcluidas, delta: 'período 2024.2', spark: [0,0,1,1,1,1,1,1], color: 'var(--pastel-lilac)' },
  ];

  return (
    <PageWrap>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 24 }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Visão geral · 2026.1</div>
          <h2 style={{ fontSize: 28, letterSpacing: '-0.02em' }}>
            Boa tarde, Administrador
            <span style={{ fontStyle: 'italic', fontFamily: 'Georgia, serif', color: 'var(--ink-500)', fontWeight: 400 }}> — aqui está o resumo.</span>
          </h2>
        </div>
        <div className="mono" style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>
          última sincronização<br/>há 2 minutos · /api/health
          <span style={{ marginLeft: 8, color: 'var(--success)' }}>● ok</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 14 }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="eyebrow">{s.label}</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
              <div className="mono" style={{ fontSize: 32, fontWeight: 600, color: 'var(--ink-900)', letterSpacing: '-0.02em' }}>
                {String(s.value).padStart(2, '0')}
              </div>
              <div style={{ width: 72, height: 36 }}>
                <SparkBars data={s.spark} color={s.color} height={36} />
              </div>
            </div>
            <div style={{ fontSize: 12, color: 'var(--ink-500)' }}>{s.delta}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14, marginBottom: 14 }}>
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
            <div>
              <div className="eyebrow">Matrículas ativas por curso</div>
              <h3 style={{ fontSize: 16, marginTop: 6 }}>Distribuição entre cursos ativos</h3>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav('cursos')}>
              Ver cursos <Icon name="chevron" size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {porCurso.map(({ curso, count }) => (
              <div key={curso.id} style={{ display: 'grid', gridTemplateColumns: '180px 1fr 40px', gap: 14, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <span style={{
                    width: 30, height: 30, borderRadius: 7,
                    background: `var(--pastel-${curso.cor})`,
                    color: 'var(--ink-900)',
                    display: 'grid', placeItems: 'center',
                    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                  }}>{curso.sigla}</span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{curso.nome}</div>
                  </div>
                </div>
                <div style={{ position: 'relative', height: 8, background: 'var(--bg-soft)', borderRadius: 999 }}>
                  <div style={{
                    position: 'absolute', inset: 0, width: `${(count / maxCurso) * 100}%`,
                    background: `var(--pastel-${curso.cor})`, borderRadius: 999, transition: 'width 0.3s',
                  }} />
                </div>
                <span className="mono" style={{ fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: 22 }}>
          <div className="eyebrow">Status das matrículas</div>
          <h3 style={{ fontSize: 16, marginTop: 6, marginBottom: 18 }}>Composição</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ position: 'relative' }}>
              <Donut slices={statusSlices} size={130} thickness={16} />
              <div style={{
                position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                pointerEvents: 'none',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div className="mono" style={{ fontSize: 22, fontWeight: 600 }}>{matriculas.length}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-500)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>total</div>
                </div>
              </div>
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {statusSlices.map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                  <span style={{ flex: 1, color: 'var(--ink-700)' }}>{s.label}</span>
                  <span className="mono" style={{ color: 'var(--ink-900)', fontWeight: 600 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '18px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="eyebrow">Atividade recente</div>
              <h3 style={{ fontSize: 16, marginTop: 6 }}>Últimas matrículas</h3>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => onNav('matriculas')}>
              Ver todas <Icon name="chevron" size={12} />
            </button>
          </div>
          <table className="table">
            <thead><tr><th>Aluno</th><th>Curso</th><th>Status</th><th style={{ textAlign: 'right' }}>Data</th></tr></thead>
            <tbody>
              {recentMat.map(m => {
                const a = alunos.find(x => x.id === m.aluno_id);
                const c = cursos.find(x => x.id === m.curso_id);
                if (!a || !c) return null;
                return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Avatar name={a.nome} color={a.cor} />
                        <div>
                          <div style={{ fontWeight: 500 }}>{a.nome}</div>
                          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-500)' }}>{a.matricula}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{
                          width: 22, height: 22, borderRadius: 5,
                          background: `var(--pastel-${c.cor})`,
                          display: 'grid', placeItems: 'center',
                          fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 700,
                          color: 'var(--ink-900)',
                        }}>{c.sigla}</span>
                        <span style={{ fontSize: 13 }}>{c.nome}</span>
                      </div>
                    </td>
                    <td><StatusBadge status={m.status} /></td>
                    <td className="mono" style={{ textAlign: 'right', color: 'var(--ink-500)', fontSize: 12 }}>{m.data_matricula}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card" style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div className="eyebrow">Infraestrutura</div>
            <h3 style={{ fontSize: 16, marginTop: 6 }}>Topologia · netatividade01</h3>
          </div>
          {[
            { name: 'nginx',    detail: 'proxy reverso · :80 (HTTP)', up: true,  vol: 'static' },
            { name: 'fastapi',  detail: 'uvicorn · :8080 (interno)',  up: true,  vol: 'app code' },
            { name: 'postgres', detail: 'imagem oficial · pg_isready',up: true,  vol: 'postgres_data' },
          ].map(s => (
            <div key={s.name} style={{
              padding: '12px 14px', borderRadius: 10,
              background: 'var(--bg-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: s.up ? 'var(--success)' : 'var(--danger)',
                  boxShadow: s.up ? '0 0 0 4px var(--success-soft)' : '0 0 0 4px var(--danger-soft)',
                }} />
                <div style={{ minWidth: 0 }}>
                  <div className="mono" style={{ fontSize: 12.5, fontWeight: 600 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-500)' }}>{s.detail}</div>
                </div>
              </div>
              <span className="mono" style={{ fontSize: 10.5, color: 'var(--ink-500)' }}>vol: {s.vol}</span>
            </div>
          ))}
        </div>
      </div>
    </PageWrap>
  );
};

window.AdminDashboard = AdminDashboard;

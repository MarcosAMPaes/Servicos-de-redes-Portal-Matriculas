
const MatriculaForm = ({ value, onChange, alunos, cursos }) => {
  const v = value || {};
  const editing = !!v.id;
  const set = (k) => (e) => onChange({ ...v, [k]: e.target.value });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <div className="field" style={{ gridColumn: '1 / -1' }}>
        <label className="label">Aluno</label>
        <select className="select input" value={v.aluno_id || ''} onChange={set('aluno_id')} disabled={editing}>
          <option value="">Selecione um aluno...</option>
          {alunos.filter(a => a.ativo).map(a => (
            <option key={a.id} value={a.id}>{a.nome} - {a.matricula}</option>
          ))}
        </select>
      </div>

      <div className="field" style={{ gridColumn: '1 / -1' }}>
        <label className="label">Curso</label>
        <select className="select input" value={v.curso_id || ''} onChange={set('curso_id')} disabled={editing}>
          <option value="">Selecione um curso...</option>
          {cursos.filter(c => c.ativo).map(c => (
            <option key={c.id} value={c.id}>{c.sigla} - {c.nome}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label className="label">Status</label>
        <select className="select input" value={v.status || 'ativa'} onChange={set('status')}>
          <option value="ativa">Ativa</option>
          <option value="trancada">Trancada</option>
          <option value="concluida">Concluida</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      <div className="field">
        <label className="label">Data da matricula</label>
        <input type="date" className="input" value={v.data_matricula || ''} onChange={set('data_matricula')} />
      </div>
    </div>
  );
};

const AdminMatriculas = ({ alunos, cursos, matriculas, setMatriculas }) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const toast = useToast();

  const fullMatricula = (m) => ({
    ...m,
    aluno_id: m.aluno_id ?? m.aluno?.id,
    curso_id: m.curso_id ?? m.curso?.id,
    aluno: m.aluno || alunos.find(a => a.id === m.aluno_id),
    curso: m.curso || cursos.find(c => c.id === m.curso_id),
  });

  const enriched = matriculas.map(fullMatricula).filter(m => m.aluno && m.curso);

  const filtered = enriched.filter(m => {
    if (statusFilter !== 'todas' && m.status !== statusFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return m.aluno.nome.toLowerCase().includes(q) ||
           m.curso.nome.toLowerCase().includes(q) ||
           m.aluno.matricula.includes(q);
  });

  const openNew = () => {
    setEditing({ aluno_id: '', curso_id: '', status: 'ativa', data_matricula: '2026-05-01' });
    setModalOpen(true);
  };

  const openEdit = (m) => {
    setEditing({ ...m, aluno_id: String(m.aluno_id), curso_id: String(m.curso_id) });
    setModalOpen(true);
  };

  const save = async () => {
    if (!editing.aluno_id || !editing.curso_id) {
      toast.push('Selecione aluno e curso.', { tone: 'warn' });
      return;
    }

    const aId = Number(editing.aluno_id);
    const cId = Number(editing.curso_id);
    const dup = matriculas.find(m => m.aluno_id === aId && m.curso_id === cId && m.id !== editing.id);
    if (dup) {
      toast.push('Aluno e curso ja possuem matricula.', { tone: 'danger' });
      return;
    }

    try {
      if (editing.id) {
        const saved = await API.updateMatricula(editing.id, {
          status: editing.status,
          data_matricula: editing.data_matricula,
        });
        setMatriculas(prev => prev.map(m => m.id === saved.id ? fullMatricula({ ...m, ...saved }) : m));
        toast.push('Matricula atualizada.');
      } else {
        const saved = await API.createMatricula({ ...editing, aluno_id: aId, curso_id: cId });
        setMatriculas(prev => [...prev, fullMatricula(saved)]);
        toast.push('Matricula criada.');
      }
      setModalOpen(false);
      setEditing(null);
    } catch (err) {
      toast.push(err.detail || 'Nao foi possivel salvar a matricula.', { tone: 'danger' });
    }
  };

  const remove = async (m) => {
    try {
      await API.deleteMatricula(m.id);
      setMatriculas(prev => prev.map(x => x.id === m.id ? { ...x, status: 'cancelada' } : x));
      toast.push(`Matricula #${String(m.id).padStart(3, '0')} cancelada.`, { tone: 'warn' });
      setConfirm(null);
    } catch (err) {
      toast.push(err.detail || 'Nao foi possivel cancelar a matricula.', { tone: 'danger' });
    }
  };

  const counts = {
    todas:     matriculas.length,
    ativa:     matriculas.filter(m => m.status === 'ativa').length,
    trancada:  matriculas.filter(m => m.status === 'trancada').length,
    concluida: matriculas.filter(m => m.status === 'concluida').length,
    cancelada: matriculas.filter(m => m.status === 'cancelada').length,
  };

  return (
    <PageWrap>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, gap: 16 }}>
        <div>
          <div className="eyebrow">CRUD - /api/matriculas</div>
          <h2 style={{ fontSize: 24, marginTop: 6, letterSpacing: '-0.02em' }}>
            Matriculas <span className="mono" style={{ fontSize: 14, color: 'var(--ink-500)', fontWeight: 400, marginLeft: 6 }}>{matriculas.length}</span>
          </h2>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Icon name="plus" size={14} /> Nova matricula</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          ['todas',     'Todas',      'badge-neutral'],
          ['ativa',     'Ativas',     'badge-green'],
          ['trancada',  'Trancadas',  'badge-peach'],
          ['concluida', 'Concluidas', 'badge-blue'],
          ['cancelada', 'Canceladas', 'badge-rose'],
        ].map(([k, label, badgeCls]) => (
          <button key={k} onClick={() => setStatusFilter(k)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: 999,
            border: '1px solid ' + (statusFilter === k ? 'var(--ink-900)' : 'var(--line)'),
            background: statusFilter === k ? 'var(--bg-card)' : 'transparent',
            color: 'var(--ink-900)', fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
            transition: 'all 0.12s',
          }}>
            <span className={`badge ${badgeCls}`} style={{ height: 18, padding: '0 6px', fontSize: 10 }}>{counts[k]}</span>
            {label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative', maxWidth: 280 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)' }}>
            <Icon name="search" size={14} />
          </span>
          <input className="input" placeholder="Buscar aluno, curso, matricula"
                 value={search} onChange={e => setSearch(e.target.value)}
                 style={{ paddingLeft: 34, height: 36 }} />
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <EmptyState icon="link" title="Nenhuma matricula"
            hint="Nao ha matriculas correspondentes ao filtro atual."
            action={<button className="btn btn-primary btn-sm" onClick={openNew}><Icon name="plus" size={12} /> Nova matricula</button>} />
        ) : (
          <table className="table">
            <thead><tr>
              <th style={{ width: 60 }}>ID</th>
              <th>Aluno</th>
              <th>Curso</th>
              <th>Status</th>
              <th>Data</th>
              <th style={{ width: 90, textAlign: 'right' }}>Acoes</th>
            </tr></thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--ink-500)' }}>#{String(m.id).padStart(3, '0')}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={m.aluno.nome} color={m.aluno.cor} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{m.aluno.nome}</div>
                        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-500)' }}>{m.aluno.matricula}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        width: 26, height: 26, borderRadius: 6,
                        background: `var(--pastel-${m.curso.cor})`,
                        display: 'grid', placeItems: 'center',
                        fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, color: 'var(--ink-900)',
                      }}>{m.curso.sigla}</span>
                      <span style={{ fontSize: 13 }}>{m.curso.nome}</span>
                    </div>
                  </td>
                  <td><StatusBadge status={m.status} /></td>
                  <td className="mono" style={{ fontSize: 12, color: 'var(--ink-500)' }}>{m.data_matricula}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <button className="btn-icon" onClick={() => openEdit(m)} title="Editar"><Icon name="edit" size={14} /></button>
                      <button className="btn-icon" onClick={() => setConfirm(m)} title="Cancelar matricula"
                              style={{ color: 'var(--danger)' }}><Icon name="trash" size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing?.id ? 'Editar matricula' : 'Nova matricula'}
        subtitle={editing?.id ? `PUT /api/matriculas/${editing.id}` : 'POST /api/matriculas'}
        width={520}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}><Icon name="check" size={14} /> Salvar</button>
        </>}>
        <MatriculaForm value={editing} onChange={setEditing} alunos={alunos} cursos={cursos} />
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        title="Cancelar matricula?"
        message={confirm ? `A matricula #${String(confirm.id).padStart(3, '0')} de ${confirm.aluno.nome} em ${confirm.curso.nome} sera marcada como cancelada. O historico e preservado.` : ''}
        confirmLabel="Cancelar matricula"
        onConfirm={() => remove(confirm)} />
    </PageWrap>
  );
};

window.AdminMatriculas = AdminMatriculas;

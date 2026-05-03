/* Admin: CRUD Alunos */

const AlunoForm = ({ value, onChange }) => {
  const v = value || {};
  const set = (k) => (e) => onChange({ ...v, [k]: e.target.value });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <div className="field" style={{ gridColumn: '1 / -1' }}>
        <label className="label">Nome completo</label>
        <input className="input" value={v.nome || ''} onChange={set('nome')} placeholder="Nome do aluno" />
      </div>
      <div className="field">
        <label className="label">E-mail institucional</label>
        <input className="input" value={v.email || ''} onChange={set('email')} placeholder="aluno@portal.local" />
      </div>
      <div className="field">
        <label className="label">Matrícula</label>
        <input className="input mono" value={v.matricula || ''} onChange={set('matricula')} placeholder="20241si000" />
      </div>
      <div className="field">
        <label className="label">Data de nascimento</label>
        <input type="date" className="input" value={v.data_nascimento || ''} onChange={set('data_nascimento')} />
      </div>
      <div className="field">
        <label className="label">Senha inicial</label>
        <input className="input" value={v.senha || ''} onChange={set('senha')} placeholder="aluno123" />
      </div>
      <div className="field" style={{ gridColumn: '1 / -1' }}>
        <label className="label">Status</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {[['true', 'Ativo'], ['false', 'Inativo']].map(([k, label]) => (
            <button key={k} type="button"
              onClick={() => onChange({ ...v, ativo: k === 'true' })}
              style={{
                flex: 1, height: 36, borderRadius: 10,
                border: '1px solid ' + ((v.ativo === (k === 'true')) ? 'var(--ink-900)' : 'var(--line-strong)'),
                background: (v.ativo === (k === 'true')) ? 'var(--bg-soft)' : 'var(--bg-card)',
                fontSize: 13, fontWeight: 500, color: 'var(--ink-900)', cursor: 'pointer',
              }}>{label}</button>
          ))}
        </div>
      </div>
    </div>
  );
};

const AdminAlunos = ({ alunos, cursos, matriculas, setAlunos }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todos'); // todos|ativos|inativos
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const toast = useToast();

  const filtered = alunos.filter(a => {
    if (filter === 'ativos' && !a.ativo) return false;
    if (filter === 'inativos' && a.ativo) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return a.nome.toLowerCase().includes(q) || a.email.toLowerCase().includes(q) || a.matricula.includes(q);
  });

  const openNew = () => {
    setEditing({ nome: '', email: '', matricula: '', data_nascimento: '', senha: 'aluno123', ativo: true, cor: 'blue' });
    setModalOpen(true);
  };
  const openEdit = (a) => { setEditing({ ...a }); setModalOpen(true); };
  const save = async () => {
    if (!editing.nome || !editing.email || !editing.matricula) {
      toast.push('Preencha nome, e-mail e matrícula.', { tone: 'warn' }); return;
    }
    try {
      if (editing.id) {
        const saved = await API.updateAluno(editing.id, editing);
        setAlunos(prev => prev.map(a => a.id === saved.id ? saved : a));
        toast.push('Aluno atualizado.');
      } else {
        const saved = await API.createAluno(editing);
        setAlunos(prev => [...prev, saved]);
        toast.push('Aluno cadastrado.');
      }
      setModalOpen(false); setEditing(null);
    } catch (err) {
      toast.push(err.detail || 'NÃ£o foi possÃ­vel salvar o aluno.', { tone: 'danger' });
    }
  };
  const remove = async (a) => {
    try {
      await API.deleteAluno(a.id);
      setAlunos(prev => prev.map(x => x.id === a.id ? { ...x, ativo: false } : x));
      toast.push(`${a.nome} desativado(a).`, { tone: 'warn' });
      setConfirm(null);
    } catch (err) {
      toast.push(err.detail || 'Não foi possÃ­vel desativar o aluno.', { tone: 'danger' });
    }
  };

  const cursosDoAluno = (id) => matriculas.filter(m => m.aluno_id === id && m.status !== 'cancelada').length;

  return (
    <PageWrap>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, gap: 16 }}>
        <div>
          <div className="eyebrow">CRUD · /api/alunos</div>
          <h2 style={{ fontSize: 24, marginTop: 6, letterSpacing: '-0.02em' }}>
            Alunos <span className="mono" style={{ fontSize: 14, color: 'var(--ink-500)', fontWeight: 400, marginLeft: 6 }}>{alunos.length}</span>
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary"><Icon name="download" size={14} /> Exportar</button>
          <button className="btn btn-primary" onClick={openNew}><Icon name="plus" size={14} /> Novo aluno</button>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {/* toolbar */}
        <div style={{
          padding: 14, display: 'flex', alignItems: 'center', gap: 12,
          borderBottom: '1px solid var(--line)',
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-400)' }}>
              <Icon name="search" size={14} />
            </span>
            <input className="input" placeholder="Buscar por nome, e-mail ou matrícula"
                   value={search} onChange={e => setSearch(e.target.value)}
                   style={{ paddingLeft: 34, height: 36 }} />
          </div>
          <div style={{ display: 'inline-flex', padding: 3, borderRadius: 999, background: 'var(--bg-soft)', gap: 2 }}>
            {[['todos','Todos'],['ativos','Ativos'],['inativos','Inativos']].map(([k, label]) => (
              <button key={k} onClick={() => setFilter(k)} style={{
                height: 28, padding: '0 12px', borderRadius: 999, border: 'none',
                background: filter === k ? 'var(--bg-card)' : 'transparent',
                color: filter === k ? 'var(--ink-900)' : 'var(--ink-500)',
                fontSize: 12, fontWeight: 500,
                boxShadow: filter === k ? 'var(--shadow-xs)' : 'none',
              }}>{label}</button>
            ))}
          </div>
          <div style={{ flex: 1 }} />
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-500)' }}>
            {filtered.length} de {alunos.length}
          </span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState title="Nenhum aluno encontrado" hint="Ajuste os filtros ou cadastre um novo aluno."
            action={<button className="btn btn-primary btn-sm" onClick={openNew}><Icon name="plus" size={12} /> Novo aluno</button>} />
        ) : (
          <table className="table">
            <thead><tr>
              <th style={{ width: '32%' }}>Aluno</th>
              <th>Matrícula</th>
              <th>Cursos</th>
              <th>Status</th>
              <th>Cadastrado</th>
              <th style={{ width: 90, textAlign: 'right' }}>Ações</th>
            </tr></thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={a.nome} color={a.cor} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{a.nome}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>{a.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="mono" style={{ fontSize: 12 }}>{a.matricula}</td>
                  <td><span className="mono" style={{ fontSize: 12.5 }}>{cursosDoAluno(a.id)}</span></td>
                  <td>
                    <span className={`badge badge-dot ${a.ativo ? 'badge-green' : 'badge-neutral'}`}>
                      {a.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="mono" style={{ fontSize: 11.5, color: 'var(--ink-500)' }}>{a.criado_em}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                      <button className="btn-icon" onClick={() => openEdit(a)} title="Editar"><Icon name="edit" size={14} /></button>
                      <button className="btn-icon" onClick={() => setConfirm(a)} title="Desativar"
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
        title={editing?.id ? 'Editar aluno' : 'Novo aluno'}
        subtitle={editing?.id ? `PUT /api/alunos/${editing.id}` : 'POST /api/alunos'}
        width={560}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}><Icon name="check" size={14} /> Salvar</button>
        </>}>
        <AlunoForm value={editing} onChange={setEditing} />
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        title="Desativar aluno?"
        message={confirm ? `${confirm.nome} será marcado como inativo (remoção lógica). As matrículas existentes serão preservadas para histórico.` : ''}
        confirmLabel="Desativar"
        onConfirm={() => remove(confirm)} />
    </PageWrap>
  );
};

window.AdminAlunos = AdminAlunos;

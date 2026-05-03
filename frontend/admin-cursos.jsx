/* Admin: CRUD Cursos */

const CURSO_CORES = ['blue', 'green', 'peach', 'lilac', 'rose'];

const CursoForm = ({ value, onChange }) => {
  const v = value || {};
  const set = (k) => (e) => onChange({ ...v, [k]: e.target.value });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px', gap: 14 }}>
      <div className="field">
        <label className="label">Nome do curso</label>
        <input className="input" value={v.nome || ''} onChange={set('nome')} placeholder="Sistemas de Informação" />
      </div>
      <div className="field">
        <label className="label">Sigla</label>
        <input className="input mono" value={v.sigla || ''} onChange={set('sigla')} placeholder="SI" maxLength={3} />
      </div>
      <div className="field" style={{ gridColumn: '1 / -1' }}>
        <label className="label">Descrição</label>
        <textarea className="textarea" value={v.descricao || ''} onChange={set('descricao')}
          placeholder="Resumo do curso, ênfase e objetivos." />
      </div>
      <div className="field">
        <label className="label">Carga horária total</label>
        <input className="input mono" type="number" value={v.carga_horaria || ''} onChange={set('carga_horaria')} placeholder="3200" />
      </div>
      <div className="field">
        <label className="label">Cor</label>
        <div style={{ display: 'flex', gap: 6, height: 38, alignItems: 'center' }}>
          {CURSO_CORES.map(c => (
            <button key={c} type="button" onClick={() => onChange({ ...v, cor: c })}
              style={{
                width: 24, height: 24, borderRadius: 6, cursor: 'pointer',
                background: `var(--pastel-${c})`,
                border: '2px solid ' + (v.cor === c ? 'var(--ink-900)' : 'transparent'),
              }} />
          ))}
        </div>
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

const AdminCursos = ({ cursos, matriculas, alunos, setCursos }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const toast = useToast();

  const matCount = (id) => matriculas.filter(m => m.curso_id === id && m.status === 'ativa').length;
  const totMat   = (id) => matriculas.filter(m => m.curso_id === id).length;

  const openNew = () => {
    setEditing({ nome: '', sigla: '', descricao: '', carga_horaria: 3000, ativo: true, cor: 'blue' });
    setModalOpen(true);
  };
  const openEdit = (c) => { setEditing({ ...c }); setModalOpen(true); };
  const save = async () => {
    if (!editing.nome || !editing.sigla) { toast.push('Preencha nome e sigla.', { tone: 'warn' }); return; }
    try {
      if (editing.id) {
        const saved = await API.updateCurso(editing.id, editing);
        setCursos(prev => prev.map(c => c.id === saved.id ? saved : c));
        toast.push('Curso atualizado.');
      } else {
        const saved = await API.createCurso(editing);
        setCursos(prev => [...prev, saved]);
        toast.push('Curso criado.');
      }
      setModalOpen(false); setEditing(null);
    } catch (err) {
      toast.push(err.detail || 'NÃ£o foi possÃ­vel salvar o curso.', { tone: 'danger' });
    }
  };
  const remove = async (c) => {
    try {
      await API.deleteCurso(c.id);
      setCursos(prev => prev.map(x => x.id === c.id ? { ...x, ativo: false } : x));
      toast.push(`Curso ${c.nome} desativado.`, { tone: 'warn' });
      setConfirm(null);
    } catch (err) {
      toast.push(err.detail || 'NÃ£o foi possÃ­vel desativar o curso.', { tone: 'danger' });
    }
  };

  return (
    <PageWrap>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20, gap: 16 }}>
        <div>
          <div className="eyebrow">CRUD · /api/cursos</div>
          <h2 style={{ fontSize: 24, marginTop: 6, letterSpacing: '-0.02em' }}>
            Cursos <span className="mono" style={{ fontSize: 14, color: 'var(--ink-500)', fontWeight: 400, marginLeft: 6 }}>{cursos.length}</span>
          </h2>
        </div>
        <button className="btn btn-primary" onClick={openNew}><Icon name="plus" size={14} /> Novo curso</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
        {cursos.map(c => (
          <div key={c.id} className="card" style={{
            padding: 0, overflow: 'hidden',
            opacity: c.ativo ? 1 : 0.65, position: 'relative',
            display: 'flex', flexDirection: 'column',
          }}>
            {/* color band */}
            <div style={{
              height: 80, background: `var(--pastel-${c.cor})`,
              position: 'relative', overflow: 'hidden',
            }}>
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4 }}>
                <circle cx="85%" cy="120%" r="80" fill="var(--bg-card)" opacity="0.4" />
                <circle cx="20%" cy="-30%" r="60" fill="var(--bg-card)" opacity="0.35" />
              </svg>
              <div style={{
                position: 'absolute', left: 18, bottom: -16,
                width: 56, height: 56, borderRadius: 12,
                background: 'var(--bg-card)', border: '1px solid var(--line)',
                display: 'grid', placeItems: 'center',
                fontFamily: 'var(--font-mono)', fontSize: 18, fontWeight: 700, color: 'var(--ink-900)',
                boxShadow: 'var(--shadow-sm)',
              }}>{c.sigla}</div>
              <div style={{ position: 'absolute', top: 12, right: 12 }}>
                <span className={`badge badge-dot ${c.ativo ? 'badge-green' : 'badge-neutral'}`}>
                  {c.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>

            <div style={{ padding: '24px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: 15, lineHeight: 1.3 }}>{c.nome}</h3>
              <p style={{ fontSize: 12.5, color: 'var(--ink-500)', marginTop: 6, lineHeight: 1.5, flex: 1 }}>
                {c.descricao}
              </p>

              <div style={{ display: 'flex', gap: 16, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                <div>
                  <div className="eyebrow" style={{ fontSize: 9.5 }}>Carga</div>
                  <div className="mono" style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>
                    {c.carga_horaria}<span style={{ fontSize: 10, color: 'var(--ink-500)', marginLeft: 2 }}>h</span>
                  </div>
                </div>
                <div>
                  <div className="eyebrow" style={{ fontSize: 9.5 }}>Ativos</div>
                  <div className="mono" style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>{matCount(c.id)}</div>
                </div>
                <div>
                  <div className="eyebrow" style={{ fontSize: 9.5 }}>Total mat.</div>
                  <div className="mono" style={{ fontSize: 13.5, fontWeight: 600, marginTop: 2 }}>{totMat(c.id)}</div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 2 }}>
                  <button className="btn-icon" onClick={() => openEdit(c)} title="Editar"><Icon name="edit" size={14} /></button>
                  <button className="btn-icon" onClick={() => setConfirm(c)} title="Desativar"
                          style={{ color: 'var(--danger)' }}><Icon name="trash" size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}
        title={editing?.id ? 'Editar curso' : 'Novo curso'}
        subtitle={editing?.id ? `PUT /api/cursos/${editing.id}` : 'POST /api/cursos'}
        width={560}
        footer={<>
          <button className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}><Icon name="check" size={14} /> Salvar</button>
        </>}>
        <CursoForm value={editing} onChange={setEditing} />
      </Modal>

      <ConfirmDialog open={!!confirm} onClose={() => setConfirm(null)}
        title="Desativar curso?"
        message={confirm ? `${confirm.nome} será marcado como inativo. Histórico de matrículas é preservado.` : ''}
        confirmLabel="Desativar"
        onConfirm={() => remove(confirm)} />
    </PageWrap>
  );
};

window.AdminCursos = AdminCursos;

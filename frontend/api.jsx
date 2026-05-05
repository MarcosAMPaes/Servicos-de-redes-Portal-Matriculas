const API = (() => {
  const TOKEN_KEY = 'pm-token';

  const getToken = () => sessionStorage.getItem(TOKEN_KEY);
  const setToken = (t) => t
    ? sessionStorage.setItem(TOKEN_KEY, t)
    : sessionStorage.removeItem(TOKEN_KEY);

  async function request(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(path, { ...options, headers });

    if (res.status === 204) return null;

    const data = await res.json().catch(() => ({ detail: 'Resposta inválida do servidor.' }));
    if (!res.ok) throw { status: res.status, detail: data.detail || 'Erro inesperado.' };
    return data;
  }

  return {
    getToken,
    setToken,

    login:  (email, senha) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, senha }) }),
    me:     ()             => request('/api/auth/me'),

    meusDados:        ()         => request('/api/alunos/me'),
    minhasMatriculas: ()         => request('/api/alunos/me/matriculas'),

    getAlunos:   ()         => request('/api/alunos'),
    createAluno: (data)     => request('/api/alunos',       { method: 'POST',   body: JSON.stringify(data) }),
    updateAluno: (id, data) => request(`/api/alunos/${id}`, { method: 'PUT',    body: JSON.stringify(data) }),
    deleteAluno: (id)       => request(`/api/alunos/${id}`, { method: 'DELETE' }),

    getCursos:   ()         => request('/api/cursos'),
    createCurso: (data)     => request('/api/cursos',       { method: 'POST',   body: JSON.stringify(data) }),
    updateCurso: (id, data) => request(`/api/cursos/${id}`, { method: 'PUT',    body: JSON.stringify(data) }),
    deleteCurso: (id)       => request(`/api/cursos/${id}`, { method: 'DELETE' }),

    getMatriculas:   ()         => request('/api/matriculas'),
    createMatricula: (data)     => request('/api/matriculas',       { method: 'POST',   body: JSON.stringify(data) }),
    updateMatricula: (id, data) => request(`/api/matriculas/${id}`, { method: 'PUT',    body: JSON.stringify(data) }),
    deleteMatricula: (id)       => request(`/api/matriculas/${id}`, { method: 'DELETE' }),
  };
})();

window.API = API;

export default API;

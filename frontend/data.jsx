
const SEED_CURSOS = [
  { id: 1, nome: 'Sistemas de Informação', sigla: 'SI', carga_horaria: 3200,
    descricao: 'Bacharelado focado em desenvolvimento de software e gestão de TI.',
    ativo: true, cor: 'blue' },
  { id: 2, nome: 'Redes de Computadores', sigla: 'RC', carga_horaria: 2400,
    descricao: 'Tecnólogo em infraestrutura de redes, segurança e cloud.',
    ativo: true, cor: 'green' },
  { id: 3, nome: 'Engenharia de Software', sigla: 'ES', carga_horaria: 3000,
    descricao: 'Bacharelado em engenharia, arquitetura e qualidade de software.',
    ativo: true, cor: 'peach' },
  { id: 4, nome: 'Ciência de Dados', sigla: 'CD', carga_horaria: 2800,
    descricao: 'Análise estatística, machine learning e visualização de dados.',
    ativo: true, cor: 'lilac' },
  { id: 5, nome: 'Design Digital', sigla: 'DD', carga_horaria: 2200,
    descricao: 'Curso interrompido — em revisão curricular.',
    ativo: false, cor: 'rose' },
];

const SEED_ALUNOS = [
  { id: 1, nome: 'Arthur Sandrini',  email: 'arthur.sandrini@portal.local',
    matricula: '20241si017', data_nascimento: '2003-04-12', senha: 'aluno123',
    ativo: true, criado_em: '2024-02-14', cor: 'blue' },
  { id: 2, nome: 'Eduardo Pereira',   email: 'eduardo.pereira@portal.local',
    matricula: '20241si022', data_nascimento: '2002-09-08', senha: 'aluno123',
    ativo: true, criado_em: '2024-02-14', cor: 'green' },
  { id: 3, nome: 'Marcos Paes',       email: 'marcos.paes@portal.local',
    matricula: '20241si031', data_nascimento: '2003-01-25', senha: 'aluno123',
    ativo: true, criado_em: '2024-02-14', cor: 'peach' },
  { id: 4, nome: 'Beatriz Oliveira',  email: 'beatriz.oliveira@portal.local',
    matricula: '20241rc004', data_nascimento: '2002-11-03', senha: 'aluno123',
    ativo: true, criado_em: '2024-02-20', cor: 'lilac' },
  { id: 5, nome: 'Camila Souza',      email: 'camila.souza@portal.local',
    matricula: '20241es012', data_nascimento: '2003-06-18', senha: 'aluno123',
    ativo: true, criado_em: '2024-03-02', cor: 'rose' },
  { id: 6, nome: 'Daniel Ribeiro',    email: 'daniel.ribeiro@portal.local',
    matricula: '20242cd008', data_nascimento: '2004-02-09', senha: 'aluno123',
    ativo: true, criado_em: '2024-08-11', cor: 'blue' },
  { id: 7, nome: 'Fernanda Lima',     email: 'fernanda.lima@portal.local',
    matricula: '20242si044', data_nascimento: '2003-12-30', senha: 'aluno123',
    ativo: true, criado_em: '2024-08-11', cor: 'green' },
  { id: 8, nome: 'Gustavo Almeida',   email: 'gustavo.almeida@portal.local',
    matricula: '20231si009', data_nascimento: '2002-05-21', senha: 'aluno123',
    ativo: false, criado_em: '2023-02-10', cor: 'peach' },
];

const SEED_MATRICULAS = [
  { id: 1, aluno_id: 1, curso_id: 1, status: 'ativa',     data_matricula: '2024-02-14' },
  { id: 2, aluno_id: 1, curso_id: 4, status: 'ativa',     data_matricula: '2025-08-04' },
  { id: 3, aluno_id: 2, curso_id: 1, status: 'ativa',     data_matricula: '2024-02-14' },
  { id: 4, aluno_id: 2, curso_id: 2, status: 'trancada',  data_matricula: '2024-08-12' },
  { id: 5, aluno_id: 3, curso_id: 1, status: 'ativa',     data_matricula: '2024-02-14' },
  { id: 6, aluno_id: 3, curso_id: 3, status: 'ativa',     data_matricula: '2025-02-10' },
  { id: 7, aluno_id: 4, curso_id: 2, status: 'ativa',     data_matricula: '2024-02-20' },
  { id: 8, aluno_id: 5, curso_id: 3, status: 'ativa',     data_matricula: '2024-03-02' },
  { id: 9, aluno_id: 5, curso_id: 4, status: 'concluida', data_matricula: '2024-03-02' },
  { id:10, aluno_id: 6, curso_id: 4, status: 'ativa',     data_matricula: '2024-08-11' },
  { id:11, aluno_id: 7, curso_id: 1, status: 'ativa',     data_matricula: '2024-08-11' },
  { id:12, aluno_id: 8, curso_id: 1, status: 'cancelada', data_matricula: '2023-02-10' },
];

const ADMIN = {
  id: 0, nome: 'Administrador', email: 'admin@portal.local', senha: 'admin123',
};

const STATUS_META = {
  ativa:     { label: 'Ativa',     badge: 'badge-green' },
  trancada:  { label: 'Trancada',  badge: 'badge-peach' },
  concluida: { label: 'Concluída', badge: 'badge-blue'  },
  cancelada: { label: 'Cancelada', badge: 'badge-rose'  },
};

window.SEED_CURSOS = SEED_CURSOS;
window.SEED_ALUNOS = SEED_ALUNOS;
window.SEED_MATRICULAS = SEED_MATRICULAS;
window.ADMIN = ADMIN;
window.STATUS_META = STATUS_META;

export { SEED_CURSOS, SEED_ALUNOS, SEED_MATRICULAS, ADMIN, STATUS_META };

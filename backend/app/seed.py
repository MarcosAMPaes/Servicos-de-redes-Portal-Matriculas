from datetime import date
from sqlalchemy.orm import Session
from . import models


def popular_banco(db: Session) -> None:
    if db.query(models.Administrador).count() > 0:
        return

    admin = models.Administrador(
        nome="Administrador",
        email="admin@portal.local",
        senha="admin123",
    )
    db.add(admin)

    cursos = [
        models.Curso(
            nome="Sistemas de Informação", sigla="SI", carga_horaria=3200,
            descricao="Bacharelado focado em desenvolvimento de software e gestão de TI.",
            cor="blue",
        ),
        models.Curso(
            nome="Redes de Computadores", sigla="RC", carga_horaria=2400,
            descricao="Tecnólogo em infraestrutura de redes, segurança e cloud.",
            cor="green",
        ),
        models.Curso(
            nome="Engenharia de Software", sigla="ES", carga_horaria=3000,
            descricao="Bacharelado em engenharia, arquitetura e qualidade de software.",
            cor="peach",
        ),
        models.Curso(
            nome="Ciência de Dados", sigla="CD", carga_horaria=2800,
            descricao="Análise estatística, machine learning e visualização de dados.",
            cor="lilac",
        ),
    ]
    db.add_all(cursos)

    alunos = [
        models.Aluno(nome="Arthur Sandrini", email="arthur.sandrini@portal.local",
                     matricula="20241si017", data_nascimento=date(2003, 4, 12),
                     senha="aluno123", cor="blue"),
        models.Aluno(nome="Eduardo Pereira", email="eduardo.pereira@portal.local",
                     matricula="20241si022", data_nascimento=date(2002, 9, 8),
                     senha="aluno123", cor="green"),
        models.Aluno(nome="Marcos Paes", email="marcos.paes@portal.local",
                     matricula="20241si031", data_nascimento=date(2003, 1, 25),
                     senha="aluno123", cor="peach"),
        models.Aluno(nome="Beatriz Oliveira", email="beatriz.oliveira@portal.local",
                     matricula="20241rc004", data_nascimento=date(2002, 11, 3),
                     senha="aluno123", cor="lilac"),
        models.Aluno(nome="Camila Souza", email="camila.souza@portal.local",
                     matricula="20241es012", data_nascimento=date(2003, 6, 18),
                     senha="aluno123", cor="rose"),
    ]
    db.add_all(alunos)
    db.flush()

    matriculas = [
        models.Matricula(aluno_id=alunos[0].id, curso_id=cursos[0].id,
                         status="ativa", data_matricula=date(2024, 2, 14)),
        models.Matricula(aluno_id=alunos[0].id, curso_id=cursos[3].id,
                         status="ativa", data_matricula=date(2025, 8, 4)),
        models.Matricula(aluno_id=alunos[1].id, curso_id=cursos[0].id,
                         status="ativa", data_matricula=date(2024, 2, 14)),
        models.Matricula(aluno_id=alunos[1].id, curso_id=cursos[1].id,
                         status="trancada", data_matricula=date(2024, 8, 12)),
        models.Matricula(aluno_id=alunos[2].id, curso_id=cursos[0].id,
                         status="ativa", data_matricula=date(2024, 2, 14)),
        models.Matricula(aluno_id=alunos[2].id, curso_id=cursos[2].id,
                         status="ativa", data_matricula=date(2025, 2, 10)),
        models.Matricula(aluno_id=alunos[3].id, curso_id=cursos[1].id,
                         status="ativa", data_matricula=date(2024, 2, 20)),
        models.Matricula(aluno_id=alunos[4].id, curso_id=cursos[2].id,
                         status="ativa", data_matricula=date(2024, 3, 2)),
        models.Matricula(aluno_id=alunos[4].id, curso_id=cursos[3].id,
                         status="concluida", data_matricula=date(2024, 3, 2)),
    ]
    db.add_all(matriculas)
    db.commit()

    print("Banco populado com dados iniciais.")

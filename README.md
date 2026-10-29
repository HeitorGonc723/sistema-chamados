# Sistema de Chamados

API em **NestJS + Prisma + MySQL** para registrar e acompanhar chamados de suporte.

## Como rodar

Segue o padrão dos slides do professor (Prisma 7 + `@prisma/adapter-mariadb`).

```bash
cp .env.example .env          # ajuste usuário/senha do seu MySQL
docker compose up -d          # opcional: sobe o MySQL (ou use o seu)
npm install
npx prisma migrate dev --name init
npx prisma generate
npm run start:dev             # http://localhost:3000
```

Sempre que alterar o `schema.prisma`, rode `migrate dev` e `generate` de novo.

## Rotas

| Método | Rota | O que faz |
|---|---|---|
| POST/GET | `/pessoas` | cadastra / lista |
| GET/PATCH/DELETE | `/pessoas/:id` | consulta / edita (nome, e-mail, ativo) / remove |
| POST/GET | `/tipos-problema` | cadastra / lista |
| GET/PATCH/DELETE | `/tipos-problema/:id` | consulta / edita (nome, ativo) / remove |
| POST | `/chamados` | abre chamado |
| GET | `/chamados?status=&prioridade=&tipoProblemaId=&tecnicoId=` | lista com filtros |
| GET | `/chamados/:id` | chamado com toda a conversa |
| PATCH | `/chamados/:id` | edita título, descrição, prioridade, tipo |
| POST | `/chamados/:id/tecnico` | designa técnico (`{ "tecnicoId": 2 }`) |
| PATCH | `/chamados/:id/status` | muda situação (`{ "status": "RESOLVIDO" }`) |
| POST | `/chamados/:id/comentarios` | comenta (`{ "autorId": 1, "texto": "..." }`) |

Valores: papel `SOLICITANTE | TECNICO`; prioridade `BAIXA | MEDIA | ALTA | CRITICA`;
status `ABERTO | EM_ATENDIMENTO | RESOLVIDO | FECHADO | CANCELADO`.

## Onde cada regra é aplicada

- **E-mail único/válido, nome de tipo único**: `@unique` no Prisma + `@IsEmail` (erro 409 se repetir).
- **Não remover quem tem histórico**: `remove` das pessoas e dos tipos (409; use `ativo=false`).
- **Título 5–100, descrição ≥ 10, prioridade padrão média**: DTOs e schema.
- **Fluxo de situações, encerrados imutáveis, `resolvidoEm`, limite de 5, não atender o próprio chamado**: `chamados.service.ts`.
- **Comentários imutáveis**: não existem rotas de editar/apagar comentário; `onDelete: Restrict` no banco.

Violação de regra de negócio = HTTP 422; não encontrado = 404; duplicidade/remoção bloqueada = 409; sem permissão para comentar = 403.

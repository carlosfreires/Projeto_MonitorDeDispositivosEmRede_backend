# Documentação Completa da API

Base path padrão: **`/api`**  
Cabeçalhos comuns:
- `Content-Type: application/json`
- `Authorization: Bearer <JWT>` (quando `Auth: Sim`)

> Dica: defina variáveis para facilitar os testes:
>
> ```bash
> BASE_URL="http://localhost:3000/api"
> AUTH_TOKEN="<SEU_JWT_AQUI>"
> ```

---

## Sumário

- [Auth](#auth)
- [Sessões](#sessões)
- [Usuários](#usuários)
- [Equipamentos](#equipamentos)
- [Ping](#ping)
- [Telnet](#telnet)
- [Tracert](#tracert)
- [Log de Monitoramento](#log-de-monitoramento)
- [Solicitação de Acesso](#solicitação-de-acesso)
- [Rota base e health](#rota-base-e-health)
- [Observações importantes / convenções](#observações-importantes--convenções)

---

## Auth

### POST `/api/auth/login`
- **Auth**: Não
- **Body**:
```json
{ "email": "user@example.com", "senha": "senha" }
```
- **Response 200** (exemplo):
```json
{ "token": "<jwt>", "expiracao": "2025-08-15T12:34:56.000Z" }
```
- **curl**:
```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","senha":"senha"}'
```

### POST `/api/auth/logout`
- **Auth**: Sim (recomendado) — também aceita `{ "token": "..." }` no body
- **Header**: `Authorization: Bearer <token>` ou **Body** `{ "token": "..." }`
- **Response 200** (exemplo):
```json
{ "message": "Logout realizado com sucesso.", "affectedRows": 1 }
```
- **curl** (via header):
```bash
curl -X POST "$BASE_URL/auth/logout" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Sessões

### POST `/api/sessoes`
- **Auth**: Sim
- **Body**:
```json
{ "usuario_id": 123, "token": "opcional", "expiracao": "2025-08-16T12:00:00.000Z", "ip": "1.2.3.4" }
```
- **Response 201** (exemplo):
```json
{ "message": "Sessão criada com sucesso", "token": "..." }
```
- **curl**:
```bash
curl -X POST "$BASE_URL/sessoes" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"usuario_id":123,"expiracao":"2025-08-16T12:00:00Z","ip":"1.2.3.4"}'
```

### GET `/api/sessoes/:token`
- **Auth**: Sim
- **Params**: `:token` (path)
- **Response**: 200 (sessão) ou 404
- **curl**:
```bash
curl -X GET "$BASE_URL/sessoes/<TOKEN_EXEMPLO>" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### DELETE `/api/sessoes/:token`
- **Auth**: Sim
- **curl**:
```bash
curl -X DELETE "$BASE_URL/sessoes/<TOKEN_EXEMPLO>" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### POST `/api/sessoes/invalidate`
- **Auth**: Sim
- **Body**:
```json
{ "usuarioId": 123 }
```
- **curl**:
```bash
curl -X POST "$BASE_URL/sessoes/invalidate" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"usuarioId":123}'
```

---

## Usuários

### POST `/api/usuarios`
- **Auth**: Não (padrão; pode ser protegido conforme política)
- **Body**:
```json
{ "nome":"Carlos", "sobrenome":"Freires", "email":"carlos@example.com", "senha":"senha123" }
```
- **Response 201** (exemplo):
```json
{ "id": 42, "nome": "Carlos", "sobrenome": "Freires", "email":"carlos@example.com" }
```
- **curl**:
```bash
curl -X POST "$BASE_URL/usuarios" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Carlos","sobrenome":"Freires","email":"carlos@example.com","senha":"senha123"}'
```

### GET `/api/usuarios/:id`
- **Auth**: Sim
- **curl**:
```bash
curl -X GET "$BASE_URL/usuarios/42" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### PUT `/api/usuarios/:id` — atualizar dados cadastrais
- **Auth**: Sim
- **Body**: quaisquer campos (ex.: `{ "nome":"Novo nome", "telefone":"(21)99999-9999" }`)
- **curl**:
```bash
curl -X PUT "$BASE_URL/usuarios/42" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Novo nome","telefone":"(21)99999-9999"}'
```

### PATCH `/api/usuarios/:id/email` — atualizar email
- **Auth**: Sim
- **Body**:
```json
{ "novoEmail": "novo@example.com" }
```
- **curl**:
```bash
curl -X PATCH "$BASE_URL/usuarios/42/email" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"novoEmail":"novo@example.com"}'
```

### PATCH `/api/usuarios/:id/senha` — atualizar senha
- **Auth**: Sim
- **Body**:
```json
{ "novaSenha": "senhaNova123" }
```
- **curl**:
```bash
curl -X PATCH "$BASE_URL/usuarios/42/senha" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"novaSenha":"senhaNova123"}'
```

### PATCH `/api/usuarios/:id/foto` — atualizar foto de perfil
- **Auth**: Sim
- **Body**:
```json
{ "novaFoto": "<URL or base64>" }
```
- **curl**:
```bash
curl -X PATCH "$BASE_URL/usuarios/42/foto" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"novaFoto":"https://meusite.com/fotos/42.jpg"}'
```

### POST `/api/usuarios/:id/ativar` — ativar usuário
- **Auth**: Sim
- **curl**:
```bash
curl -X POST "$BASE_URL/usuarios/42/ativar" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### POST `/api/usuarios/:id/inativar` — inativar usuário
- **Auth**: Sim
- **curl**:
```bash
curl -X POST "$BASE_URL/usuarios/42/inativar" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

---

## Equipamentos

> Todos os endpoints abaixo exigem **Auth: Sim**.

### POST `/api/equipamentos` — cadastrar
- **Body** (exemplo mínimo):
```json
{ "nome":"Switch Sala A", "mac":"AA:BB:CC:DD:EE:FF", "ip":"10.0.0.10", "porta":23 }
```
- **curl**:
```bash
curl -X POST "$BASE_URL/equipamentos" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Switch Sala A","mac":"AA:BB:CC:DD:EE:FF","ip":"10.0.0.10","porta":23}'
```

### PUT `/api/equipamentos/:id` — atualizar
- **Body**: campos a atualizar
- **curl**:
```bash
curl -X PUT "$BASE_URL/equipamentos/10" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Switch Sala B","ip":"10.0.0.11"}'
```

### DELETE `/api/equipamentos/:id` — deletar
- **curl**:
```bash
curl -X DELETE "$BASE_URL/equipamentos/10" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### GET `/api/equipamentos` — listar todos
- **curl**:
```bash
curl -X GET "$BASE_URL/equipamentos" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### GET `/api/equipamentos/ativos` — listar ativos
- **curl**:
```bash
curl -X GET "$BASE_URL/equipamentos/ativos" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### GET `/api/equipamentos/:id` — buscar por ID
- **curl**:
```bash
curl -X GET "$BASE_URL/equipamentos/10" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

---

## Ping

> Todos os endpoints de Ping exigem **Auth: Sim**.

### POST `/api/ping/test` — realizar teste de ping (single)
- **Body**:
```json
{ "alvo": 10 }
// ou
{ "alvo": { "id":10, "ip":"10.0.0.10" } }
```
- **curl**:
```bash
curl -X POST "$BASE_URL/ping/test" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"alvo":10}'
```

### POST `/api/ping/batch` — testes em lote (não persiste)
- **Body**:
```json
{ "equipamentos": [10,11,12] }
```
- **curl**:
```bash
curl -X POST "$BASE_URL/ping/batch" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"equipamentos":[10,11,12]}'
```

### POST `/api/ping/persist` — executar e persistir resultados
- **Body**:
```json
{ "equipamentos": [10,11,12] }
```
- **curl**:
```bash
curl -X POST "$BASE_URL/ping/persist" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"equipamentos":[10,11,12]}'
```

### GET `/api/ping` — listar resultados de ping
- **curl**:
```bash
curl -X GET "$BASE_URL/ping" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### POST `/api/ping/by-ids` — listar por equipamentos
- **Body**:
```json
{ "equipamentos": [10,11] }
```
- **curl**:
```bash
curl -X POST "$BASE_URL/ping/by-ids" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"equipamentos":[10,11]}'
```

---

## Telnet

> Todos os endpoints de Telnet exigem **Auth: Sim**.

### POST `/api/telnet/test` — testar Telnet (single)
- **Body**:
```json
{ "alvo": 10, "timeoutMs": 5000 }
```
- **curl**:
```bash
curl -X POST "$BASE_URL/telnet/test" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"alvo":10,"timeoutMs":5000}'
```

### POST `/api/telnet/persist` — executar e persistir (batch)
- **Body**:
```json
{ "equipamentos": [10,11,12] }
```
- **curl**:
```bash
curl -X POST "$BASE_URL/telnet/persist" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"equipamentos":[10,11]}'
```

### GET `/api/telnet` — listar resultados Telnet
- **curl**:
```bash
curl -X GET "$BASE_URL/telnet" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### POST `/api/telnet/by-ids` — listar por equipamentos
- **Body**:
```json
{ "equipamentos": [10,11] }
```
- **curl**:
```bash
curl -X POST "$BASE_URL/telnet/by-ids" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"equipamentos":[10,11]}'
```

---

## Tracert

> Todos os endpoints de Tracert exigem **Auth: Sim**.

### POST `/api/tracert` — executar traceroute (single)
- **Body**:
```json
{
  "destino": "8.8.8.8",
  "protocolo": "ICMP",
  "porta_tipo": null,
  "porta": null,
  "ttlMax": 30,
  "tentativasPorSalto": 3,
  "timeout": 10000
}
```
- **curl**:
```bash
curl -X POST "$BASE_URL/tracert" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"destino":"8.8.8.8","timeout":10000}'
```

### POST `/api/tracert/persist` — executar e persistir (batch)
- **Body**:
```json
{ "equipamentos": [10,11], "options": { "timeout": 10000 } }
```
- **curl**:
```bash
curl -X POST "$BASE_URL/tracert/persist" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"equipamentos":[10,11],"options":{"timeout":10000}}'
```

### GET `/api/tracert` — listar registros
- **curl**:
```bash
curl -X GET "$BASE_URL/tracert" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### POST `/api/tracert/by-ids` — filtrar por equipamentos
- **Body**:
```json
{ "equipamentos": [10,11] }
```
- **curl**:
```bash
curl -X POST "$BASE_URL/tracert/by-ids" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"equipamentos":[10,11]}'
```

---

## Log de Monitoramento

> Todos os endpoints exigem **Auth: Sim**.

### POST `/api/monitoramento/consolidar` — consolidação (ping + telnet)
- **curl**:
```bash
curl -X POST "$BASE_URL/monitoramento/consolidar" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### GET `/api/monitoramento` — listar (query: `dataInicial`, `dataFinal`)
- **Exemplo**: `GET /api/monitoramento?dataInicial=2025-08-01&dataFinal=2025-08-15`
- **curl**:
```bash
curl -X GET "$BASE_URL/monitoramento?dataInicial=2025-08-01&dataFinal=2025-08-15" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### POST `/api/monitoramento/by-equipment` — por equipamentos
- **Body**:
```json
{ "ids": [10,11], "dataInicial":"2025-08-01", "dataFinal":"2025-08-15" }
```
- **curl**:
```bash
curl -X POST "$BASE_URL/monitoramento/by-equipment" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"ids":[10,11],"dataInicial":"2025-08-01","dataFinal":"2025-08-15"}'
```

### GET `/api/monitoramento/ativos` — somente equipamentos ativos
- **curl**:
```bash
curl -X GET "$BASE_URL/monitoramento/ativos?dataInicial=2025-08-01&dataFinal=2025-08-15" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### DELETE `/api/monitoramento` — apagar logs
- **curl**:
```bash
curl -X DELETE "$BASE_URL/monitoramento" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### POST `/api/monitoramento/truncate` — TRUNCATE
- **curl**:
```bash
curl -X POST "$BASE_URL/monitoramento/truncate" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

---

## Solicitação de Acesso

### POST `/api/solicitacoes` — criar solicitação (público)
- **Auth**: Não
- **Body**:
```json
{ "nome":"Maria", "sobrenome":"Silva", "email":"maria@ex.com", "senha":"123456", "motivo":"Preciso de acesso", "perfil_solicitado":"operador" }
``}
- **Response 201** (exemplo):
```json
{ "message":"Solicitação enviada com sucesso! Aguardando aprovação.","solicitacaoId": 77 }
```
- **curl**:
```bash
curl -X POST "$BASE_URL/solicitacoes" \
  -H "Content-Type: application/json" \
  -d '{"nome":"Maria","sobrenome":"Silva","email":"maria@ex.com","senha":"123456","perfil_solicitado":"operador"}'
```

### GET `/api/solicitacoes/:id` — buscar solicitação pendente
- **Auth**: Sim
- **curl**:
```bash
curl -X GET "$BASE_URL/solicitacoes/77" \
  -H "Authorization: Bearer $AUTH_TOKEN"
```

### POST `/api/solicitacoes/:id/approve` — aprovar
- **Auth**: Sim
- **Body (opcional)**: `{ "usuarioAprovadorId": <id> }`
- **curl**:
```bash
curl -X POST "$BASE_URL/solicitacoes/77/approve" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"usuarioAprovadorId":5}'
```

### POST `/api/solicitacoes/:id/reject` — rejeitar
- **Auth**: Sim
- **Body (opcional)**: `{ "usuarioRejeitadorId": <id> }`
- **curl**:
```bash
curl -X POST "$BASE_URL/solicitacoes/77/reject" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"usuarioRejeitadorId":5}'
```

---

## Rota base e health

### GET `/api/` — rota base
- **curl**:
```bash
curl -X GET "$BASE_URL/"
```

### GET `/health` e GET `/ready` (root do app, fora de `/api`)
- **curl**:
```bash
curl -X GET "http://localhost:3000/health"
curl -X GET "http://localhost:3000/ready"
```

---

## Observações importantes / convenções

1. **Base path**: o router é montado em `/api` (ex.: `app.use('/api', routes)`), por isso os exemplos usam `BASE_URL="$HOST:$PORT/api"`. Endpoints de health (`/health`, `/ready`) estão na raiz do app.
2. **Autenticação**: para endpoints com `Auth: Sim`, envie `Authorization: Bearer <JWT>`. O `authMiddleware` também aceita `?token=...` como fallback (se implementado).
3. **Content-Type**: utilize `application/json` para requests com body JSON.
4. **Respostas / erros**:
   - Sucesso: status 200/201 e objeto JSON (mensagem + payload).
   - Falhas comuns: 400 (validação), 401 (não autenticado), 403 (sem permissão), 404 (não encontrado), 409 (conflito), 500 (erro interno).
5. **IDs/arrays**: endpoints em lote costumam aceitar arrays (`equipamentos`, `ids`).
6. **Paginação / filtros**: não padronizados por rota. Sugestão: `?page=1&limit=20&sort=createdAt:desc`.

---

> **Referência**: este documento foi elaborado com base no arquivo `routes/index.js` onde as rotas estão mapeadas para seus respectivos controllers e protegidas por `authMiddleware` quando aplicável.

# os-nossos-la-fora

Pequeno site estático com um servidor Node opcional que expõe APIs para ler e atualizar o registo de jogadores.

## Como correr a API

1. Certifica-te de ter o Node 18+ instalado.
2. Instala as dependências (nenhuma externa é necessária):

```bash
npm install
```

3. Arranca o servidor em `http://localhost:3000` (ou outro porto definido em `PORT`):

```bash
npm start
```

## Endpoints disponíveis

- `GET /api/players` — devolve todos os jogadores e o total.
- `GET /api/players/:id` — devolve um jogador específico pelo `id`.
- `POST /api/players` — adiciona um novo jogador. O corpo deve incluir pelo menos um campo `id` string; devolve 409 se o `id` já existir.
- `PUT /api/players/:id` / `PATCH /api/players/:id` — cria ou atualiza um jogador com o `id` fornecido. O corpo pode conter os campos do jogador a gravar.

### Exemplos rápidos

Adicionar um jogador:

```bash
curl -X POST http://localhost:3000/api/players \
  -H "Content-Type: application/json" \
  -d '{"id":"novo-jogador","known_name":"Novo Jogador"}'
```

Atualizar (ou criar) um jogador específico:

```bash
curl -X PUT http://localhost:3000/api/players/novo-jogador \
  -H "Content-Type: application/json" \
  -d '{"current_club":{"name":"Clube Exemplo"}}'
```

Obter todos os jogadores:

```bash
curl http://localhost:3000/api/players
```

Os dados são persistidos no ficheiro `players.json`, permitindo que integrações automáticas atualizem o registo via API.

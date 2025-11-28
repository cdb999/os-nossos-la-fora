const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'players.json');

async function readPlayers() {
  try {
    const contents = await fs.readFile(DATA_FILE, 'utf8');
    const data = JSON.parse(contents);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

async function writePlayers(players) {
  await fs.writeFile(DATA_FILE, JSON.stringify(players, null, 2));
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  res.end(JSON.stringify(payload));
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 5 * 1024 * 1024) {
        reject(new Error('Payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!data) return resolve({});
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function isApiRoute(url) {
  return url.pathname === '/api/players' || url.pathname.startsWith('/api/players/');
}

async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'OPTIONS' && isApiRoute(url)) {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  if (req.method === 'GET' && url.pathname === '/api/players') {
    const players = await readPlayers();
    return sendJson(res, 200, { players, count: players.length });
  }

  if (req.method === 'GET' && url.pathname.startsWith('/api/players/')) {
    const playerId = decodeURIComponent(url.pathname.replace('/api/players/', ''));
    const players = await readPlayers();
    const player = players.find((p) => p.id === playerId);
    if (!player) return sendError(res, 404, 'Player not found');
    return sendJson(res, 200, player);
  }

  if (req.method === 'POST' && url.pathname === '/api/players') {
    try {
      const body = await parseBody(req);
      if (!body.id || typeof body.id !== 'string') {
        return sendError(res, 400, 'Player payload must include a string "id" field.');
      }

      const players = await readPlayers();
      if (players.some((p) => p.id === body.id)) {
        return sendError(res, 409, 'Player with this id already exists.');
      }

      players.unshift(body);
      await writePlayers(players);
      return sendJson(res, 201, { message: 'Player added', player: body });
    } catch (err) {
      return sendError(res, 400, `Invalid JSON payload: ${err.message}`);
    }
  }

  if ((req.method === 'PUT' || req.method === 'PATCH') && url.pathname.startsWith('/api/players/')) {
    const playerId = decodeURIComponent(url.pathname.replace('/api/players/', ''));
    try {
      const body = await parseBody(req);
      const players = await readPlayers();
      const index = players.findIndex((p) => p.id === playerId);

      if (index === -1) {
        players.unshift({ ...body, id: playerId });
        await writePlayers(players);
        return sendJson(res, 201, { message: 'Player created', player: players[0] });
      }

      const updated = { ...players[index], ...body, id: playerId };
      players[index] = updated;
      await writePlayers(players);
      return sendJson(res, 200, { message: 'Player updated', player: updated });
    } catch (err) {
      return sendError(res, 400, `Invalid JSON payload: ${err.message}`);
    }
  }

  sendError(res, 404, 'Not found');
}

const server = http.createServer((req, res) => {
  handleRequest(req, res).catch((err) => {
    console.error('Unhandled error', err);
    sendError(res, 500, 'Internal server error');
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`API server listening on http://localhost:${PORT}`);
  });
}

module.exports = { server, handleRequest };

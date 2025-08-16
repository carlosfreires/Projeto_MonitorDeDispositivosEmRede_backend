// utils/middlewares/cors.js
/**
 * Middleware CORS centralizado e configurável por ENV.
 *
 * - Use `CORS_ORIGIN` para definir origem(s) permitidas.
 *   - Ex.: "http://localhost:4200" ou "http://site1.com,http://site2.com"
 *   - Use "*" para permitir todas as origens (NÃO RECOMENDADO em produção).
 *
 * - Comportamento:
 *   - Se CORS_ORIGIN não estiver definido, usamos "*" e LOGAMOS UM AVISO.
 *   - Se houver uma lista separada por vírgula, transformamos em array.
 */
const cors = require('cors');
const logger = require('../logger/Logger');

const raw = (process.env.CORS_ORIGIN ?? '*').trim();

let corsOptions = {};
if (raw === '*') {
  // Allow all origins (same behavior as cors() sem opções) — manter compatibilidade,
  // mas avisamos que não é recomendado em produção.
  logger.warn('CORS configurado com "*" (todas origens permitidas). Isso NÃO é recomendado em produção.');
  corsOptions = {}; // default -> libera tudo
} else {
  // Permite múltiplos domains separados por vírgula
  const origins = raw.split(',').map(s => s.trim()).filter(Boolean);
  corsOptions = {
    origin: function (origin, callback) {
      // requests sem origin (curl, server-to-server) devem ser permitidos por padrão
      if (!origin) return callback(null, true);
      if (origins.includes(origin)) return callback(null, true);
      const msg = `CORS - origem não permitida: ${origin}`;
      logger.warn(msg);
      return callback(new Error(msg), false);
    },
    optionsSuccessStatus: 200
  };
  logger.info(`CORS configurado para as origens: ${origins.join(', ')}`);
}

module.exports = cors(corsOptions);
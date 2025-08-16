// utils/middlewares/tratamentoDeErros.js
/**
 * Middleware centralizado de tratamento de erros.
 * - Registra erro com logger centralizado.
 * - Responde com JSON consistente.
 * - Não vaza stack trace em ambiente de produção.
 *
 * Uso: app.use(tratamentoDeErros);
 */
const logger = require('../utils/logger');

function tratamentoDeErros(err, req, res, next) {
  // Normaliza status
  const status = err.status || err.statusCode || 500;

  // Log detalhado (sempre registrar stack para investigação)
  logger.error('❌ ERRO DETECTADO:', {
    mensagem: err.message,
    rota: req.originalUrl,
    metodo: req.method,
    ip: req.ip,
    status,
    stack: err.stack ? err.stack.split('\n').slice(0, 10).join('\n') : undefined
  });

  // Construir payload de resposta (evitar vazar stack em produção)
  const payload = {
    error: status === 500 ? 'Algo deu errado no servidor.' : err.message,
    // em ambientes que não sejam produção mostramos detalhes mínimos
    detalhes: process.env.NODE_ENV === 'production' ? undefined : {
      message: err.message,
      // incluir name/codigo se existir
      name: err.name,
      code: err.code || undefined
    }
  };

  // Cabeçalhos e envio
  res.status(status).json(payload);
  // Não chamar next() pois já finalizamos a resposta
}

module.exports = tratamentoDeErros;

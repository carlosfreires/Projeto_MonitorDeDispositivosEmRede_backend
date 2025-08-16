// app.js
/**
 * Arquivo principal da aplicação Express.
 * - Registra middlewares centrais (CORS, JSON parser, logging de requisições).
 * - Monta rotas a partir de ./routes
 * - Trata erros com middleware centralizado
 * - Implementa handlers para uncaughtException / unhandledRejection e shutdown gracioso
 *
 * Padrões seguidos:
 * - Logs claros e padronizados via utils/logger
 * - Configuração via ENV (PORT, NODE_ENV, JWT_SECRET, etc.)
 * - Exporta `app` e `server` para facilitar testes automatizados
 */

const express = require('express');
const http = require('http');
const logger = require('./utils/logger/Logger');
const corsMiddleware = require('./utils/middlewares/cors');
const jsonParser = require('./utils/middlewares/json-parser');
const tratamentoDeErros = require('./utils/middlewares/tratamento-erro');
const routes = require('./routes/index');

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();

// Avisos de configuração crítica
if (!process.env.JWT_SECRET) {
  logger.warn('JWT_SECRET não definido — usando valor de fallback. Não recomendado em produção.');
}

if (NODE_ENV === 'development') {
  logger.info('Rodando em modo desenvolvimento.');
}

// Middlewares globais
app.use((req, res, next) => {
  // Pequeno log de chegada — sem dados sensíveis
  logger.info(`--> ${req.method} ${req.originalUrl}`);
  // marca tempo para cálculo de duração
  req._startAt = process.hrtime();
  // quando resposta finalizar, logamos resultado
  res.on('finish', () => {
    try {
      const diff = process.hrtime(req._startAt || [0, 0]);
      const ms = (diff[0] * 1e3 + diff[1] / 1e6).toFixed(2);
      logger.info(`<-- ${req.method} ${req.originalUrl} ${res.statusCode} - ${ms}ms`);
    } catch (e) {
      // não quebrar em caso de erro no logger
      logger.warn('Erro ao calcular tempo da requisição:', e.message || e);
    }
  });
  next();
});

// CORS configurado no utilitário
app.use(corsMiddleware);

// Parser JSON com limites configuráveis
app.use(jsonParser);

// Rotas
app.use('/api', routes);

// Health checks
app.get('/health', (req, res) => res.json({ status: 'ok', env: NODE_ENV }));
app.get('/ready', (req, res) => res.json({ status: 'ready' }));

// 404 handler (rotas não encontradas)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler centralizado (deve ser o último middleware)
app.use(tratamentoDeErros);

// Cria servidor HTTP
const server = http.createServer(app);

// Start
server.listen(PORT, HOST, () => {
  logger.success(`Servidor iniciado em http://${HOST}:${PORT} (env=${NODE_ENV}).`);
});

// Graceful shutdown utilities
let shuttingDown = false;
async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  logger.warn(`Recebido sinal ${signal}. Iniciando shutdown gracioso...`);

  // fecha servidor para novas conexões
  server.close(async (err) => {
    if (err) {
      logger.error('Erro ao fechar servidor:', err.message || err);
      process.exit(1);
    }

    // tentativa de fechar conexões com banco de dados (se existir)
    try {
      const db = require('./database/bancoDeDados');
      if (db && typeof db.close === 'function') {
        await db.close();
        logger.info('Conexão com banco de dados encerrada.');
      }
    } catch (dbErr) {
      logger.warn('Nenhuma rotina de fechamento de BD encontrada ou erro ao fechá-la:', dbErr.message || dbErr);
    }

    logger.success('Shutdown finalizado. Saindo do processo.');
    process.exit(0);
  });

  // força saída após timeout caso não finalize
  setTimeout(() => {
    logger.error('Timeout de shutdown atingido. Forçando exit.');
    process.exit(1);
  }, 30 * 1000).unref();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Captura erros globais
process.on('uncaughtException', (err) => {
  logger.error('uncaughtException - erro não tratado:', err && err.stack ? err.stack : err);
  // tenta shutdown gracioso
  shutdown('uncaughtException');
});

process.on('unhandledRejection', (reason) => {
  logger.error('unhandledRejection - promessa rejeitada não tratada:', reason);
  // opcional: tentar shutdown gracioso
});

// Exporta app e server para testes
module.exports = { app, server };
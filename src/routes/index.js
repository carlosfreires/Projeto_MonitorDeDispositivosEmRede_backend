// routes/index.js
/**
 * Roteamento central (Express Router) — mapeia endpoints para controllers.
 * - Importar este arquivo em app.js e montar em uma base, ex: app.use('/api', require('./routes'))
 * - Middlewares (CORS, jsonParser, authMiddleware, tratamentoDeErros) devem ser aplicados no app.js
 *
 * Mantemos aqui apenas o mapeamento das rotas e aplicação de authMiddleware
 * em endpoints que normalmente exigem autenticação.
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger/Logger');

// middlewares (opcionais de rota) — o app normalmente já monta o jsonParser e CORS globalmente
const authMiddleware = require('../utils/middlewares/authMiddleware');

// Controllers
const AuthController = require('../controllers/AuthController');
const SessaoController = require('../controllers/SessaoController');
const UsuarioController = require('../controllers/UsuarioController');
const EquipamentoController = require('../controllers/EquipamentoController');
const PingTestController = require('../controllers/PingTestController');
const TelnetController = require('../controllers/TelnetController');
const TracertController = require('../controllers/TracertController');
const LogMonitoramentoController = require('../controllers/LogMonitoramentoController');
const SolicitacaoAcessoController = require('../controllers/SolicitacaoAcessoController');

// ---------- Auth
router.post('/auth/login', (req, res) => AuthController.login(req, res));
router.post('/auth/logout', authMiddleware, (req, res) => AuthController.logout(req, res));

// ---------- Sessões
router.post('/sessoes', authMiddleware, (req, res) => SessaoController.criarSessao(req, res));
router.get('/sessoes/:token', authMiddleware, (req, res) => SessaoController.buscarPorToken(req, res));
router.delete('/sessoes/:token', authMiddleware, (req, res) => SessaoController.removerPorToken(req, res));
router.post('/sessoes/invalidate', authMiddleware, (req, res) => SessaoController.invalidarSessaoDoUsuario(req, res));

// ---------- Usuários
router.post('/usuarios', (req, res) => UsuarioController.criarUsuario(req, res));
router.get('/usuarios/:id', authMiddleware, (req, res) => UsuarioController.buscarPorId(req, res));
router.put('/usuarios/:id', authMiddleware, (req, res) => UsuarioController.atualizarDadosCadastrais(req, res));
router.patch('/usuarios/:id/email', authMiddleware, (req, res) => UsuarioController.atualizarEmail(req, res));
router.patch('/usuarios/:id/senha', authMiddleware, (req, res) => UsuarioController.atualizarSenha(req, res));
router.patch('/usuarios/:id/foto', authMiddleware, (req, res) => UsuarioController.atualizarFotoPerfil(req, res));
router.post('/usuarios/:id/ativar', authMiddleware, (req, res) => UsuarioController.ativar(req, res));
router.post('/usuarios/:id/inativar', authMiddleware, (req, res) => UsuarioController.inativar(req, res));

// ---------- Equipamentos
router.post('/equipamentos', authMiddleware, (req, res) => EquipamentoController.cadastrar(req, res));
router.put('/equipamentos/:id', authMiddleware, (req, res) => EquipamentoController.atualizar(req, res));
router.delete('/equipamentos/:id', authMiddleware, (req, res) => EquipamentoController.deletarPorId(req, res));
router.get('/equipamentos', authMiddleware, (req, res) => EquipamentoController.listarTodos(req, res));
router.get('/equipamentos/ativos', authMiddleware, (req, res) => EquipamentoController.listarAtivos(req, res));
router.get('/equipamentos/:id', authMiddleware, (req, res) => EquipamentoController.buscarPorId(req, res));

// ---------- Ping Test
router.post('/ping/test', authMiddleware, (req, res) => PingTestController.realizarTeste(req, res));
router.post('/ping/batch', authMiddleware, (req, res) => PingTestController.realizarTesteAll(req, res));
router.post('/ping/persist', authMiddleware, (req, res) => PingTestController.executarETPersistirParaTodos(req, res));
router.get('/ping', authMiddleware, (req, res) => PingTestController.listarTodos(req, res));
router.post('/ping/by-ids', authMiddleware, (req, res) => PingTestController.listarPorEquipamentos(req, res));

// ---------- Telnet
router.post('/telnet/test', authMiddleware, (req, res) => TelnetController.realizarTeste(req, res));
router.post('/telnet/persist', authMiddleware, (req, res) => TelnetController.executarETPersistirParaTodos(req, res));
router.get('/telnet', authMiddleware, (req, res) => TelnetController.listarTodos(req, res));
router.post('/telnet/by-ids', authMiddleware, (req, res) => TelnetController.listarPorEquipamentos(req, res));

// ---------- Tracert
router.post('/tracert', authMiddleware, (req, res) => TracertController.executar(req, res));
router.post('/tracert/persist', authMiddleware, (req, res) => TracertController.executarETPersistirParaTodos(req, res));
router.get('/tracert', authMiddleware, (req, res) => TracertController.listarTodos(req, res));
router.post('/tracert/by-ids', authMiddleware, (req, res) => TracertController.listarPorEquipamentos(req, res));

// ---------- Log Monitoramento
router.post('/monitoramento/consolidar', authMiddleware, (req, res) => LogMonitoramentoController.consolidarLogs(req, res));
router.get('/monitoramento', authMiddleware, (req, res) => LogMonitoramentoController.listarTodos(req, res));
router.post('/monitoramento/by-equipment', authMiddleware, (req, res) => LogMonitoramentoController.listarPorEquipamento(req, res));
router.get('/monitoramento/ativos', authMiddleware, (req, res) => LogMonitoramentoController.listarLogsAtivos(req, res));
router.delete('/monitoramento', authMiddleware, (req, res) => LogMonitoramentoController.apagarLogs(req, res));
router.post('/monitoramento/truncate', authMiddleware, (req, res) => LogMonitoramentoController.apagarLogsComTruncate(req, res));

// ---------- Solicitação de Acesso (algumas rotas públicas)
router.post('/solicitacoes', (req, res) => SolicitacaoAcessoController.criarSolicitacao(req, res));
router.get('/solicitacoes/:id', authMiddleware, (req, res) => SolicitacaoAcessoController.buscarPendente(req, res));
router.post('/solicitacoes/:id/approve', authMiddleware, (req, res) => SolicitacaoAcessoController.aprovarSolicitacao(req, res));
router.post('/solicitacoes/:id/reject', authMiddleware, (req, res) => SolicitacaoAcessoController.rejeitarSolicitacao(req, res));

// ---------- Fallback (rota base)
router.get('/', (req, res) => {
  res.json({ message: 'API - rotas disponíveis. Consulte a documentação interna.' });
});

// Exporta o router para o app principal
module.exports = router;
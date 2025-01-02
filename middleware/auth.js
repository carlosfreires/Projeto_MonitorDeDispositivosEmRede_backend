const jwt = require('jsonwebtoken');
const { obterConexao } = require('../database/conectadb');
require('dotenv').config(); // Carrega variáveis de ambiente
const chalk = require('chalk');

const JWT_SECRET = process.env.JWT_SECRET || 'seu_segredo_super_secreto';

/**
 * Middleware de Autenticação
 * @param {Request} req - Objeto de requisição.
 * @param {Response} res - Objeto de resposta.
 * @param {Function} next - Próximo middleware.
 */
async function autenticar(req, res, next) {
    try {
        console.info(chalk.blue('🔑 [Autenticação] Iniciando autenticação...'));

        // Obtém o token do cabeçalho
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            console.warn(chalk.yellow('⚠️ [Autenticação] Token não fornecido.'));
            return res.status(401).json({ error: 'Token não fornecido.' });
        }

        console.info(chalk.blue('✅ [Autenticação] Token recebido com sucesso.'));

        // Verifica o token JWT
        const payload = jwt.verify(token, JWT_SECRET);
        console.info(chalk.green('🔐 [Autenticação] Token JWT verificado com sucesso.'));

        // Verifica se o token está ativo no banco de dados
        console.info(chalk.blue('📡 [Autenticação] Verificando sessão no banco de dados...'));
        const db = await obterConexao();
        const query = `SELECT * FROM sessoes WHERE token = ? AND expiracao > CURRENT_TIMESTAMP`;
        const [result] = await db.execute(query, [token]);

        if (result.length === 0) {
            console.warn(chalk.yellow('⚠️ [Autenticação] Sessão expirada ou inválida.'));
            return res.status(401).json({ error: 'Sessão expirada ou inválida.' });
        }

        console.info(chalk.green('✅ [Autenticação] Sessão válida.'));

        req.usuario = payload; // Armazena os dados do usuário na requisição

        console.info(chalk.green('🚀 [Autenticação] Usuário autenticado com sucesso.'));
        next(); // Chama o próximo middleware
    } catch (erro) {
        console.error(chalk.red('❌ [Autenticação] Erro durante o processo de autenticação.'));
        console.error(chalk.red(`🛑 Mensagem: ${erro.message}`));

        let mensagemErro = 'Não autorizado.';
        if (erro.name === 'TokenExpiredError') {
            mensagemErro = 'Token expirado.';
            console.warn(chalk.yellow('⚠️ [Autenticação] Token expirado.'));
        } else if (erro.name === 'JsonWebTokenError') {
            mensagemErro = 'Token inválido.';
            console.warn(chalk.yellow('⚠️ [Autenticação] Token inválido.'));
        }

        res.status(401).json({ error: mensagemErro });
    }
}

module.exports = { autenticar };
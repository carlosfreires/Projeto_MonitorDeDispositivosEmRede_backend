const { obterConexao } = require('../database/conectadb');
const chalk = require('chalk'); 

class Sessao {
    constructor(id, usuario_id, token, expiracao, ip, criado_em) {
        this.id = id;
        this.usuario_id = usuario_id;
        this.token = token;
        this.expiracao = expiracao;
        this.ip = ip;
        this.criado_em = criado_em;
        console.info(chalk.blue(`🆕 Instância de Sessao criada para usuário ID: ${this.usuario_id}`));
    }

    /**
     * Criar uma nova sessão
     * @param {Object} param0 - Dados da sessão
     */
    static async criarSessao({ usuario_id, token, expiracao, ip }) {
        console.info(chalk.yellow(`🛠️ Criando nova sessão para usuário ID: ${usuario_id}`));
        const db = await obterConexao();

        try {
            const query = `INSERT INTO sessoes (usuario_id, token, expiracao, ip) VALUES (?, ?, ?, ?)`;
            await db.execute(query, [usuario_id, token, expiracao, ip]);
            console.info(chalk.green(`✅ Sessão criada com sucesso para usuário ID: ${usuario_id}, IP: ${ip}`));
        } catch (error) {
            console.error(chalk.red(`❌ Erro ao criar sessão para usuário ID: ${usuario_id}`));
            console.error(chalk.red(`🛑 Detalhes do erro: ${error.message}`));
            throw error;
        }
    }

    /**
     * Remover sessão pelo token
     * @param {string} token - Token da sessão
     */
    static async removerSessaoPorToken(token) {
        console.info(chalk.yellow(`🗑️ Removendo sessão com token: ${token}`));
        const db = await obterConexao();

        try {
            const query = `DELETE FROM sessoes WHERE token = ?`;
            await db.execute(query, [token]);
            console.info(chalk.green(`✅ Sessão com token ${token} removida com sucesso.`));
        } catch (error) {
            console.error(chalk.red(`❌ Erro ao remover sessão com token: ${token}`));
            console.error(chalk.red(`🛑 Detalhes do erro: ${error.message}`));
            throw error;
        }
    }
}

module.exports = { Sessao };
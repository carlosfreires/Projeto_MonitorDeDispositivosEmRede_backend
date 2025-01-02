const { obterConexao } = require('../database/conectadb');
const bcrypt = require('bcrypt');
const chalk = require('chalk');

class SolicitacaoAcesso {
    constructor({ id, nome, sobrenome, email, senha, motivo, status, perfil_solicitado, aprovado_por, rejeitado_por, data_solicitacao, data_aprovacao, data_rejeicao }) {
        this.id = id;
        this.nome = nome;
        this.sobrenome = sobrenome;
        this.email = email;
        this.senha = senha;
        this.motivo = motivo;
        this.status = status;
        this.perfil_solicitado = perfil_solicitado;
        this.aprovado_por = aprovado_por;
        this.rejeitado_por = rejeitado_por;
        this.data_solicitacao = data_solicitacao;
        this.data_aprovacao = data_aprovacao;
        this.data_rejeicao = data_rejeicao;

        console.info(chalk.blue(`🆕 Instância de SolicitacaoAcesso criada para: ${this.email}`));
    }

    /**
     * Cria uma nova solicitação de acesso.
     * @param {Object} param0 - Dados da solicitação.
     */
    static async criar({ nome, sobrenome, email, senha, motivo, perfil_solicitado }) {
        console.info(chalk.yellow(`🛠️ Iniciando criação de solicitação de acesso para: ${email}`));

        // Valida campos obrigatórios
        if (!nome || !sobrenome || !email || !senha || !perfil_solicitado) {
            console.error(chalk.red(`❌ Falha: Campos obrigatórios ausentes.`));
            throw new Error('Todos os campos são obrigatórios.');
        }

        const db = await obterConexao();
        console.info(chalk.blue(`🔑 Conexão com banco de dados obtida.`));

        const hashSenha = await bcrypt.hash(senha, 10); // Criptografa a senha
        console.info(chalk.green(`🔒 Senha criptografada com sucesso.`));

        try {
            const query = `
                INSERT INTO solicitacoes_acesso (nome, sobrenome, email, senha, motivo, perfil_solicitado)
                VALUES (?, ?, ?, ?, ?, ?)`;
            const [result] = await db.execute(query, [nome, sobrenome, email, hashSenha, motivo, perfil_solicitado]);

            console.info(chalk.green(`✅ Solicitação de acesso criada com sucesso para: ${email}`));

            return {
                id: result.insertId,
                nome,
                sobrenome,
                email,
                motivo,
                perfil_solicitado
            };
        } catch (error) {
            console.error(chalk.red(`❌ Erro ao criar solicitação de acesso para: ${email}`));
            console.error(chalk.red(`🛑 Detalhes do erro: ${error.message}`));
            throw error;
        }
    }

    /**
     * Busca uma solicitação pendente pelo ID.
     * @param {number} idSolicitacao - ID da solicitação.
     */
    static async buscarPendente(idSolicitacao) {
        console.info(chalk.yellow(`🔍 Buscando solicitação pendente com ID: ${idSolicitacao}`));
        const db = await obterConexao();

        try {
            const query = `SELECT * FROM solicitacoes_acesso WHERE id = ? AND status = 'pendente'`;
            const [result] = await db.execute(query, [idSolicitacao]);

            if (result.length === 0) {
                console.warn(chalk.yellow(`⚠️ Nenhuma solicitação pendente encontrada com ID: ${idSolicitacao}`));
                return null;
            }

            console.info(chalk.green(`✅ Solicitação pendente encontrada com ID: ${idSolicitacao}`));
            return new SolicitacaoAcesso(result[0]);
        } catch (error) {
            console.error(chalk.red(`❌ Erro ao buscar solicitação pendente com ID: ${idSolicitacao}`));
            console.error(chalk.red(`🛑 Detalhes do erro: ${error.message}`));
            throw error;
        }
    }

    /**
     * Aprova uma solicitação.
     * @param {number} usuarioAprovadorId - ID do usuário que aprovou.
     */
    async aprovar(usuarioAprovadorId) {
        console.info(chalk.yellow(`✅ Aprovando solicitação com ID: ${this.id} por usuário ID: ${usuarioAprovadorId}`));
        const db = await obterConexao();

        try {
            const query = `
                UPDATE solicitacoes_acesso 
                SET status = 'aprovado', aprovado_por = ?, data_aprovacao = CURRENT_TIMESTAMP 
                WHERE id = ?`;
            await db.execute(query, [usuarioAprovadorId, this.id]);

            console.info(chalk.green(`✅ Solicitação ID: ${this.id} aprovada com sucesso.`));
        } catch (error) {
            console.error(chalk.red(`❌ Erro ao aprovar solicitação ID: ${this.id}`));
            console.error(chalk.red(`🛑 Detalhes do erro: ${error.message}`));
            throw error;
        }
    }

    /**
     * Rejeita uma solicitação de acesso.
     * @param {number} usuarioRejeitadorId - ID do usuário que rejeitou.
     */
    async rejeitar(usuarioRejeitadorId) {
        console.info(chalk.yellow(`❌ Rejeitando solicitação com ID: ${this.id} por usuário ID: ${usuarioRejeitadorId}`));
        const db = await obterConexao();

        try {
            const query = `
                UPDATE solicitacoes_acesso 
                SET status = 'rejeitado', rejeitado_por = ?, data_rejeicao = CURRENT_TIMESTAMP 
                WHERE id = ?`;
            await db.execute(query, [usuarioRejeitadorId, this.id]);

            console.info(chalk.green(`✅ Solicitação ID: ${this.id} rejeitada com sucesso.`));
        } catch (error) {
            console.error(chalk.red(`❌ Erro ao rejeitar solicitação ID: ${this.id}`));
            console.error(chalk.red(`🛑 Detalhes do erro: ${error.message}`));
            throw error;
        }
    }
}

module.exports = { SolicitacaoAcesso };
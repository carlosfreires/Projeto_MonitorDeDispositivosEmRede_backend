const { obterConexao } = require('../database/conectadb');
const chalk = require('chalk');

class Equipamento {
    constructor({ id, nome, descricao, mac, ip, porta, ativo, criado_por, atualizado_por, created_at, updated_at }) {
        this.id = id;
        this.nome = nome;
        this.descricao = descricao;
        this.mac = mac;
        this.ip = ip;
        this.porta = porta;
        this.ativo = ativo;
        this.criado_por = criado_por;
        this.atualizado_por = atualizado_por;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    // Método estático para cadastrar um novo equipamento no banco de dados
    static async cadastrar({ nome, descricao, mac, ip, porta, criado_por }) {
        console.info(chalk.blue('ℹ️ Iniciando o cadastro de um novo equipamento...'));
        try {
            const db = await obterConexao();
            console.log(chalk.green('✅ Conexão com o banco de dados estabelecida.'));

            const query = `INSERT INTO equipamentos (nome, descricao, mac, ip, porta, criado_por) VALUES (?, ?, ?, ?, ?, ?)`;
            const [result] = await db.execute(query, [nome, descricao, mac, ip, porta, criado_por]);

            console.info(chalk.greenBright(`✅ Equipamento cadastrado com sucesso! ID: ${result.insertId}`));
            return {
                message: 'Equipamento cadastrado com sucesso!',
                equipamentoID: result.insertId,
            };
        } catch (erro) {
            console.error(chalk.red('🚨 Erro ao cadastrar equipamento:'), erro.message);
            throw new Error('Erro ao cadastrar equipamento.');
        }
    }

    // Método estático para atualizar um equipamento existente
    static async atualizar(id, { nome, descricao, mac, ip, porta, ativo, atualizado_por }) {
        console.info(chalk.blue('ℹ️ Iniciando atualização do equipamento...'));
        try {
            const db = await obterConexao();
            console.log(chalk.green('✅ Conexão com o banco de dados estabelecida.'));

            const query = `UPDATE equipamentos SET nome = ?, descricao = ?, mac = ?, ip = ?, porta = ?, ativo = ?, atualizado_por = ? WHERE id = ?`;
            const [result] = await db.execute(query, [nome, descricao, mac, ip, porta, ativo, atualizado_por, id]);

            console.info(chalk.greenBright(`✅ Equipamento atualizado com sucesso! Linhas afetadas: ${result.affectedRows}`));
            return {
                message: 'Equipamento atualizado com sucesso!',
                affectedRows: result.affectedRows,
            };
        } catch (erro) {
            console.error(chalk.red('🚨 Erro ao atualizar equipamento:'), erro.message);
            throw new Error('Erro ao atualizar equipamento.');
        }
    }

    // Método estático para deletar um equipamento do banco de dados com base no ID
    static async deletarPorId(id) {
        console.info(chalk.blue(`ℹ️ Iniciando exclusão do equipamento com ID: ${id}`));
        try {
            const db = await obterConexao();
            console.log(chalk.green('✅ Conexão com o banco de dados estabelecida.'));

            const query = `DELETE FROM equipamentos WHERE id = ?`;
            const [result] = await db.execute(query, [id]);

            console.info(chalk.greenBright(`✅ Equipamento deletado com sucesso! Linhas afetadas: ${result.affectedRows}`));
            return {
                message: 'Equipamento deletado com sucesso!',
                affectedRows: result.affectedRows,
            };
        } catch (erro) {
            console.error(chalk.red('🚨 Erro ao deletar equipamento:'), erro.message);
            throw new Error('Erro ao deletar equipamento.');
        }
    }

    // Método estático para listar todos os equipamentos
    static async listarTodos() {
        console.info(chalk.blue('ℹ️ Iniciando listagem de todos os equipamentos...'));
        try {
            const db = await obterConexao();
            console.log(chalk.green('✅ Conexão com o banco de dados estabelecida.'));

            const query = `SELECT * FROM equipamentos`;
            const [rows] = await db.execute(query);

            console.info(chalk.greenBright(`✅ Listagem de equipamentos concluída. Total encontrados: ${rows.length}`));
            return rows;
        } catch (erro) {
            console.error(chalk.red('🚨 Erro ao listar equipamentos:'), erro.message);
            throw new Error('Erro ao listar equipamentos.');
        }
    }

    // Método estático para buscar um equipamento por ID
    static async buscarPorId(id) {
        console.info(chalk.blue(`ℹ️ Iniciando busca do equipamento com ID: ${id}`));
        try {
            const db = await obterConexao();
            console.log(chalk.green('✅ Conexão com o banco de dados estabelecida.'));

            const query = `SELECT * FROM equipamentos WHERE id = ? AND ativo = TRUE LIMIT 1`;
            const [resultados] = await db.execute(query, [id]);

            if (resultados.length > 0) {
                console.info(chalk.greenBright(`✅ Equipamento encontrado: ${JSON.stringify(resultados[0])}`));
                return resultados[0];
            } else {
                console.warn(chalk.yellow(`⚠️ Nenhum equipamento ativo encontrado com ID: ${id}`));
                return null;
            }
        } catch (erro) {
            console.error(chalk.red('🚨 Erro ao buscar equipamento por ID:'), erro.message);
            throw new Error('Erro ao buscar equipamento por ID.');
        }
    }

    // Método estático para listar todos os equipamentos ativos
    static async listarAtivos() {
        console.info(chalk.blue('ℹ️ Iniciando listagem de equipamentos ativos...'));
        try {
            const db = await obterConexao();
            console.log(chalk.green('✅ Conexão com o banco de dados estabelecida.'));

            const query = `SELECT * FROM equipamentos WHERE ativo = TRUE`;
            const [resultados] = await db.query(query);

            console.info(chalk.greenBright(`✅ Equipamentos ativos encontrados: ${resultados.length}`));
            return resultados;
        } catch (erro) {
            console.error(chalk.red('🚨 Erro ao listar equipamentos ativos:'), erro.message);
            throw new Error('Erro ao listar equipamentos ativos.');
        }
    }
}

module.exports = { Equipamento };
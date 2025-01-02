const { obterConexao } = require('../database/conectadb');
const ping = require('ping');
const chalk = require('chalk');

class PingTest {
    constructor({ id, equipamento_id, status, tempo_resposta, updated_at }) {
        this.id = id;
        this.equipamento_id = equipamento_id;
        this.status = status;
        this.tempo_resposta = tempo_resposta;
        this.updated_at = updated_at;
        console.info(chalk.blue(`🆕 Instância de PingTest criada para equipamento: ${this.equipamento_id}`));
    }

    /**
    * Salva ou atualiza as informações de teste de ping no banco de dados.
    * @returns {Promise<void>}
    */
    async salvar() {
        const db = await obterConexao();
        if (this.tempo_resposta === null || isNaN(this.tempo_resposta) || this.tempo_resposta > 9999) {
            console.warn(chalk.yellow(`⚠️ Valor inválido para tempo_resposta: ${this.tempo_resposta}. Será salvo como NULL.`));
            this.tempo_resposta = null;
        }
        try {
            const query = ` INSERT INTO pingtest (equipamento_id, status, tempo_resposta) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status), tempo_resposta = VALUES(tempo_resposta), updated_at = CURRENT_TIMESTAMP `;
            await db.execute(query, [this.equipamento_id, this.status, this.tempo_resposta]);
            console.info(chalk.greenBright(`✅ Teste de ping salvo com sucesso para equipamento ${this.equipamento_id}.`));
        } catch (erro) {
            console.error(chalk.redBright(`❌ Erro ao salvar teste de ping: ${erro.message}`));
            throw erro;
        }
    }

    /**
    * Realiza um teste de ping em um equipamento.
    * @param {Object} equipamento Informações do equipamento.
    * @returns {PingTest} Instância de PingTest com os resultados do teste.
    */
    static async realizarTeste(equipamento) {
        console.info(chalk.blueBright(`📡 Realizando teste de ping para equipamento ${equipamento.id} - IP: ${equipamento.ip}`));
        const resultado = await ping.promise.probe(equipamento.ip);
        const tempoResposta = resultado.time ? parseFloat(resultado.time) : null;
        return new PingTest({
            equipamento_id: equipamento.id,
            status: resultado.alive ? 'ativo' : 'inativo',
            tempo_resposta: tempoResposta && tempoResposta < 9999 ? tempoResposta : null,
            updated_at: new Date()
        });
    }

    /**
    * Realiza um teste de ping em um ou mais equipamentos.
    * @param {Object|Array} equipamento Equipamento individual ou lista de equipamentos.
    * @returns {Promise<PingTest|Array<PingTest>>} Resultado(s) do(s) teste(s).
    */
    static async realizarTesteAll(equipamento) {
        if (Array.isArray(equipamento)) {
            console.info(chalk.blueBright(`📡 Realizando teste de ping para múltiplos equipamentos.`));
            const testes = await Promise.all(
                equipamento.map(async (eq) => {
                    const resultado = await ping.promise.probe(eq.ip);
                    const tempoResposta = resultado.time ? parseFloat(resultado.time) : null;

                    return new PingTest({
                        equipamento_id: eq.id,
                        status: resultado.alive ? 'ativo' : 'inativo',
                        tempo_resposta: tempoResposta && tempoResposta < 9999 ? tempoResposta : null,
                        updated_at: new Date()
                    });
                })
            );
            return testes;
        } else {
            return this.realizarTeste(equipamento);
        }
    }

    /**
    * Lista todos os testes de ping.
    * @returns {Promise<Array>} Lista de testes de ping.
    */
    static async listarTodos() {
        console.info(chalk.blue('📋 Listando todos os testes de ping...'));
        const db = await obterConexao();
        const query = ` SELECT p.*, e.nome AS equipamento_nome, e.ip AS equipamento_ip FROM pingtest p INNER JOIN equipamentos e ON p.equipamento_id = e.id `;
        const [resultados] = await db.query(query);
        console.info(chalk.greenBright(`✅ ${resultados.length} registros encontrados.`));
        return resultados;
    }

    /**
    * Lista os testes de ping para equipamentos informados.
    * @param {Array} equipamentos Lista de IDs de equipamentos.
    * @returns {Promise<Array>} Resultados dos testes para os equipamentos informados.
    */
    static async listarPorEquipamentos(equipamentos) {
        console.info(chalk.blue(`🔍 Listando testes de ping para equipamentos: [${equipamentos.join(', ')}]`));
        const db = await obterConexao();
        const query = ` SELECT p.*, e.nome AS equipamento_nome, e.ip AS equipamento_ip FROM pingtest p INNER JOIN equipamentos e ON p.equipamento_id = e.id WHERE e.id IN (?) `;
        const [resultados] = await db.query(query, [equipamentos]);
        console.info(chalk.greenBright(`✅ ${resultados.length} registros encontrados.`));
        return resultados;
    }
}

module.exports = { PingTest };
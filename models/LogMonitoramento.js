const { obterConexao } = require('../database/conectadb');
const chalk = require('chalk');

class LogMonitoramento {
    constructor({ equipamento_id, ip, porta, status_ping, tempo_resposta_ping, status_telnet, mensagem_telnet, detalhes }) {
        this.equipamento_id = equipamento_id ?? null;
        this.ip = ip ?? null;
        this.porta = porta ?? null;
        this.status_ping = status_ping ?? null;
        this.tempo_resposta_ping = tempo_resposta_ping ?? null;
        this.status_telnet = status_telnet ?? null;
        this.mensagem_telnet = mensagem_telnet ?? null;
        this.detalhes = detalhes ? JSON.stringify(detalhes) : null;
    }

    /**
     * Consolida os dados de pingtest e telnet em logs_monitoramento.
     * @returns {Promise<Object>} Resultado da operação.
     */
    static async consolidarLogs() {
        try {
            const db = await obterConexao();

            // Consulta os dados das tabelas pingtest e telnet
            const pingQuery = `SELECT equipamento_id, status AS status_ping, tempo_resposta AS tempo_resposta_ping FROM pingtest`;
            const telnetQuery = `SELECT equipamento_id, status AS status_telnet, mensagem AS mensagem_telnet FROM telnet`;
            
            const [pingResults] = await db.execute(pingQuery);
            const [telnetResults] = await db.execute(telnetQuery);

            console.info(chalk.blue(`🔄 Consolidando ${pingResults.length} registros de ping e ${telnetResults.length} registros de telnet.`));

            // Cria um mapa para fácil acesso por equipamento_id
            const telnetMap = telnetResults.reduce((map, item) => {
                map[item.equipamento_id] = item;
                return map;
            }, {});

            // Insere os dados consolidados na tabela logs_monitoramento
            const insertQuery = `
                INSERT INTO logs_monitoramento 
                (equipamento_id, ip, porta, status_ping, tempo_resposta_ping, status_telnet, mensagem_telnet, detalhes) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            let logsInseridos = 0;

            for (const ping of pingResults) {
                const telnet = telnetMap[ping.equipamento_id];

                if (!telnet) {
                    console.warn(chalk.yellow(`⚠️ Equipamento ID ${ping.equipamento_id} não encontrado nos resultados de telnet.`));
                    continue;
                }

                // Consulta as informações do equipamento (IP e porta)
                const equipamentoQuery = `
                    SELECT ip, porta FROM equipamentos WHERE id = ? LIMIT 1
                `;
                const [equipamentoData] = await db.execute(equipamentoQuery, [ping.equipamento_id]);
                if (!equipamentoData.length) {
                    console.warn(chalk.yellow(`⚠️ Equipamento ID ${ping.equipamento_id} não encontrado na tabela equipamentos.`));
                    continue;
                }

                const { ip, porta } = equipamentoData[0];

                // Insere o log consolidado
                const detalhes = {
                    consolidado_em: new Date().toISOString(),
                    fonte: 'Automático - Ping e Telnet'
                };

                await db.execute(insertQuery, [
                    ping.equipamento_id,
                    ip,
                    porta,
                    ping.status_ping,
                    ping.tempo_resposta_ping,
                    telnet.status_telnet,
                    telnet.mensagem_telnet,
                    JSON.stringify(detalhes)
                ]);

                logsInseridos++;
            }

            console.info(chalk.greenBright(`✅ ${logsInseridos} logs consolidados e inseridos em logs_monitoramento.`));
            return { message: 'Consolidação de logs concluída.', logsInseridos };
        } catch (erro) {
            console.error(chalk.redBright('❌ Erro ao consolidar logs de monitoramento:'), erro.message);
            throw new Error('Erro ao consolidar logs de monitoramento.');
        }
    }


    /**
     * Lista todos os logs.
     * @returns {Promise<Array>}
     */
    static async listarTodos() {
        try {
            const db = await obterConexao();
            const query = `SELECT * FROM logs_monitoramento`;
            const [rows] = await db.execute(query);

            console.info(chalk.blueBright(`📜 Total de logs encontrados: ${rows.length}`));
            return rows;
        } catch (erro) {
            console.error(chalk.redBright('❌ Erro ao listar logs de monitoramento:'), erro.message);
            throw new Error('Erro ao listar logs de monitoramento.');
        }
    }


/**
 * Lista logs de monitoramento por equipamento, com possibilidade de filtro por período.
 * @param {Array} ids - IDs dos equipamentos.
 * @param {string} dataInicial - Data inicial para filtro (opcional).
 * @param {string} dataFinal - Data final para filtro (opcional).
 * @returns {Promise<Array>} Lista de logs filtrados.
 */
static async listarPorEquipamento(ids, dataInicial = null, dataFinal = null) {
    try {
        const db = await obterConexao();

        console.info(chalk.blueBright(`🔍 Consultando logs para equipamentos: [${ids.join(', ')}]`));

        // Base da query SQL
        let query = `SELECT * FROM logs_monitoramento WHERE equipamento_id IN (?)`;
        const parametros = [ids];

        // Adicionando filtros de data
        if (dataInicial && dataFinal) {
            query += ` AND created_at BETWEEN ? AND ?`;
            parametros.push(dataInicial, dataFinal);
            console.info(chalk.cyan(`📅 Período: ${dataInicial} a ${dataFinal}`));
        } else if (dataInicial) {
            query += ` AND created_at >= ?`;
            parametros.push(dataInicial);
            console.info(chalk.cyan(`📅 Data inicial: ${dataInicial}`));
        } else if (dataFinal) {
            query += ` AND created_at <= ?`;
            parametros.push(dataFinal);
            console.info(chalk.cyan(`📅 Data final: ${dataFinal}`));
        }

        // Executando a query
        const [resultados] = await db.execute(query, parametros);

        console.info(chalk.greenBright(`✅ ${resultados.length} logs encontrados.`));
        return resultados;
    } catch (erro) {
        console.error(chalk.redBright('❌ Erro ao buscar logs por equipamento:'), erro.message);
        throw new Error('⚠️ Erro ao buscar logs por equipamento.');
    }
}


   /**
 * Remove todos os logs da tabela usando DELETE FROM.
 * @returns {Promise<Object>} Resultado da operação.
 */
static async apagarLogs() {
    console.info(chalk.yellowBright('🗑️ Iniciando deleção de logs com DELETE FROM...'));
    try {
        const db = await obterConexao();
        const query = `DELETE FROM logs_monitoramento`;

        console.info(chalk.cyan('🔧 Executando query:'), query);
        const [result] = await db.execute(query);

        console.info(chalk.greenBright(`✅ ${result.affectedRows} logs deletados com sucesso!`));
        return {
            message: '✅ Todos os logs deletados com sucesso!',
            affectedRows: result.affectedRows,
        };
    } catch (erro) {
        console.error(chalk.redBright('❌ Erro ao deletar logs com DELETE FROM:'), erro.message);
        throw new Error('⚠️ Erro ao deletar logs de monitoramento.');
    } finally {
        console.info(chalk.yellowBright('🟡 Finalizando deleção de logs com DELETE FROM.'));
    }
}

/**
 * Remove todos os logs da tabela usando TRUNCATE TABLE.
 * @returns {Promise<Object>} Resultado da operação.
 */
static async apagarLogsComTruncate() {
    console.info(chalk.yellowBright('🗑️ Iniciando deleção de logs com TRUNCATE TABLE...'));
    try {
        const db = await obterConexao();
        const query = `TRUNCATE TABLE logs_monitoramento`;

        console.info(chalk.cyan('🔧 Executando query:'), query);
        const [result] = await db.execute(query);

        console.info(chalk.greenBright('✅ Logs deletados com sucesso usando TRUNCATE!'));
        return {
            message: '✅ Todos os logs deletados com sucesso usando TRUNCATE!',
            affectedRows: result.affectedRows || 0, // TRUNCATE pode retornar 0
        };
    } catch (erro) {
        console.error(chalk.redBright('❌ Erro ao deletar logs com TRUNCATE:'), erro.message);
        throw new Error('⚠️ Erro ao deletar logs de monitoramento.');
    } finally {
        console.info(chalk.yellowBright('🟡 Finalizando deleção de logs com TRUNCATE TABLE.'));
    }
}
}

module.exports = { LogMonitoramento };
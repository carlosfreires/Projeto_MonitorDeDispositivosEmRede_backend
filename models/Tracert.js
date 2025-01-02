const traceroute = require('nodejs-traceroute');
const { obterConexao } = require('../database/conectadb');
const chalk = require('chalk');

class Tracert {
    constructor({ id, equipamento_id, protocolo, porta_tipo, porta, rota, updated_at }) {
        this.id = id;
        this.equipamento_id = equipamento_id;
        this.protocolo = protocolo || 'ICMP';
        this.porta_tipo = porta_tipo || 'UDP';
        this.porta = porta || null;
        this.rota = rota || null;
        this.updated_at = updated_at;
        console.info(chalk.blue(`🆕 Instância de Tracert criada para equipamento: ${this.equipamento_id}`));
    }

    /**
     * Executa o tracert para um destino.
     * @param {Object} params - Parâmetros do tracert.
     * @returns {Promise<Object>} Resultado do tracert.
     */
    static async executar({ destino, protocolo = 'ICMP', porta_tipo = null, porta = null, ttlMax = 30, tentativasPorSalto = 3, timeout = 5000 }) {
        const rota = [];
        let ipAnterior = null;
        let destinoAlcancado = false;

        console.info(chalk.blueBright(`🚀 Iniciando tracert para: ${destino}`));
        console.info(chalk.yellow(`📡 Protocolo: ${protocolo}, TTL Máximo: ${ttlMax}, Tentativas: ${tentativasPorSalto}, Timeout: ${timeout}ms`));

        return new Promise((resolve, reject) => {
            const tracer = new traceroute();

            let timeoutId = null;
            let saltoAtual = 1;

            const executarSalto = () => {
                console.log(chalk.cyan(`🔄 Executando salto ${saltoAtual} para destino ${destino}...`));

                if (destinoAlcancado) {
                    console.info(chalk.greenBright(`🏁 Destino ${destino} alcançado. Encerrando rastreamento.`));
                    resolve({ destino, rota });
                    return;
                }

                if (saltoAtual > ttlMax) {
                    console.warn(chalk.yellowBright(`⚠️ Limite máximo de saltos (${ttlMax}) atingido para destino ${destino}.`));
                    resolve({ destino, rota, erro: 'Limite máximo de saltos atingido' });
                    return;
                }

                timeoutId = setTimeout(() => {
                    console.warn(chalk.yellow(`⏳ Timeout no salto ${saltoAtual} para destino ${destino}.`));
                    rota.push({ hop: saltoAtual, ip: '[Timeout]', erro: `Timeout atingido (${timeout}ms)` });
                    saltoAtual++;
                    executarSalto();
                }, timeout);

                try {
                    tracer
                        .once('hop', (hop) => {
                            clearTimeout(timeoutId);

                            if (hop.ip === 'Esgotado o tempo limite do pedido.') {
                                console.warn(chalk.red(`❌ Salto ${saltoAtual} falha - IP: [${destino}] - RTT: *ms`));
                                rota.push({ hop: saltoAtual, ip: '[Timeout]', erro: 'Esgotado o tempo limite do pedido.' });
                            } else if (hop.ip && hop.ip !== ipAnterior) {
                                console.info(chalk.green(`✅ Salto ${saltoAtual} bem-sucedido - IP: ${hop.ip} - RTT: ${hop.rtt1 || '*ms'}`));
                                rota.push({ hop: saltoAtual, ip: hop.ip, rtt: hop.rtt1 || '*ms' });

                                ipAnterior = hop.ip;

                                if (hop.ip === destino) {
                                    destinoAlcancado = true;
                                    console.info(chalk.greenBright(`🏁 Destino ${destino} alcançado no salto ${saltoAtual}.`));
                                    resolve({ destino, rota });
                                    return;
                                }
                            }

                            saltoAtual++;
                            executarSalto();
                        })
                        .once('done', () => {
                            clearTimeout(timeoutId);
                            console.info(chalk.greenBright(`🏁 Tracert concluído com sucesso para ${destino}.`));
                            resolve({ destino, rota });
                        })
                        .once('error', (erro) => {
                            clearTimeout(timeoutId);
                            console.error(chalk.red(`❌ Erro durante o Tracert: ${erro.message}`));
                            rota.push({ hop: saltoAtual, ip: '[Erro]', erro: erro.message });
                            saltoAtual++;
                            executarSalto();
                        });

                    tracer.trace(destino);
                } catch (erro) {
                    clearTimeout(timeoutId);
                    console.error(chalk.redBright(`❌ Erro ao inicializar Tracert: ${erro.message}`));
                    reject(new Error('Erro ao executar Tracert.'));
                }
            };

            executarSalto();
        });
    }

    /**
     * Consolida os resultados de tracert por TTL.
     * @param {Array} tentativas - Tentativas do tracert.
     * @returns {Array} Rota consolidada.
     */
    static consolidarResultados(tentativas) {
        console.info(chalk.blueBright('🔄 Consolidando resultados do tracert.'));
        const rotaConsolidada = [];

        tentativas.forEach((tentativa) => {
            const { hop, ip, rtt1, rtt2, rtt3, erro } = tentativa;
            const entradaExistente = rotaConsolidada.find((r) => r.hop === hop);

            if (!entradaExistente) {
                console.log(chalk.cyan(`📌 Adicionando novo salto ${hop} - IP: ${ip}`));
                rotaConsolidada.push({ hop, ip, rtt1, rtt2, rtt3, erro });
            } else {
                console.log(chalk.cyan(`♻️ Atualizando salto ${hop} - IP: ${ip}`));
                entradaExistente.rtt1 = entradaExistente.rtt1 || rtt1;
                entradaExistente.rtt2 = entradaExistente.rtt2 || rtt2;
                entradaExistente.rtt3 = entradaExistente.rtt3 || rtt3;
                entradaExistente.erro = entradaExistente.erro || erro;
            }
        });

        console.info(chalk.greenBright('✅ Resultados consolidados com sucesso.'));
        return rotaConsolidada;
    }

    /**
     * Salva ou atualiza as informações de tracert no banco de dados.
     */
    async salvar() {
        console.info(chalk.blue('💾 Iniciando salvamento de tracert no banco de dados...'));

        try {
            const db = await obterConexao();
            const query = `
                INSERT INTO tracert (equipamento_id, protocolo, porta_tipo, porta, rota)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE 
                    protocolo = VALUES(protocolo),
                    porta_tipo = VALUES(porta_tipo),
                    porta = VALUES(porta),
                    rota = VALUES(rota),
                    updated_at = CURRENT_TIMESTAMP
            `;
            await db.execute(query, [
                this.equipamento_id,
                this.protocolo,
                this.porta_tipo,
                this.porta,
                JSON.stringify(this.rota || [])
            ]);
            console.info(chalk.greenBright(`✅ Tracert salvo com sucesso para o equipamento ${this.equipamento_id}.`));
        } catch (erro) {
            console.error(chalk.redBright(`❌ Erro ao salvar tracert no banco de dados: ${erro.message}`));
            throw new Error('Erro ao salvar tracert.');
        }
    }

    /**
     * Lista todos os registros de tracert.
     * @returns {Promise<Array>}
     */
    static async listarTodos() {
        console.info(chalk.blue('📋 Listando todos os registros de tracert...'));

        try {
            const db = await obterConexao();
            const query = 'SELECT * FROM tracert';
            const [rows] = await db.execute(query);
            console.info(chalk.greenBright(`✅ ${rows.length} registros de tracert encontrados.`));
            return rows.map((row) => new Tracert(row));
        } catch (erro) {
            console.error(chalk.redBright(`❌ Erro ao listar todos os tracerts: ${erro.message}`));
            throw new Error('Erro ao listar todos os tracerts.');
        }
    }

    /**
     * Lista registros de tracert por IDs de equipamentos.
     * @param {Array} equipamentosIds - IDs dos equipamentos.
     * @returns {Promise<Array>}
     */
    static async listarPorEquipamentos(equipamentosIds) {
        console.info(chalk.blue(`🔍 Listando registros de tracert para equipamentos: [${equipamentosIds.join(', ')}]...`));

        try {
            const db = await obterConexao();
            const placeholders = equipamentosIds.map(() => '?').join(',');
            const query = `SELECT * FROM tracert WHERE equipamento_id IN (${placeholders})`;
            const [rows] = await db.execute(query, equipamentosIds);
            console.info(chalk.greenBright(`✅ ${rows.length} registros encontrados para equipamentos: [${equipamentosIds.join(', ')}].`));
            return rows.map((row) => new Tracert(row));
        } catch (erro) {
            console.error(chalk.redBright(`❌ Erro ao listar tracerts por equipamentos: ${erro.message}`));
            throw new Error('Erro ao listar tracerts por equipamentos.');
        }
    }
}

module.exports = { Tracert };


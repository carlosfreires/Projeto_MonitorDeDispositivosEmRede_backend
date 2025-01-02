const chalk = require('chalk');
const { LogMonitoramento } = require('../../../../models/LogMonitoramento.js');

/**
 * Lista logs de monitoramento por equipamento, com possibilidade de filtro por período.
 */
async function listarPorEquipamento(ids, dataInicial = null, dataFinal = null) {
    console.info(chalk.blue('🔧 Iniciando a função listarPorEquipamento()'));

    try {
        // Validação dos IDs
        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            console.error(chalk.red('❌ IDs de equipamentos inválidos ou ausentes.'));
            throw new Error('IDs de equipamentos inválidos ou ausentes');
        } else {
            console.log(chalk.green(`📋 IDs recebidos: ${ids.join(', ')}`));
        }

        // Log dos parâmetros de período
        if (dataInicial || dataFinal) {
            console.log(chalk.yellow(`📅 Intervalo de datas fornecido: Inicial = ${dataInicial}, Final = ${dataFinal}`));
        } else {
            console.log(chalk.yellow('📅 Nenhum intervalo de datas fornecido. Listando todos os logs para os IDs.'));
        }

        // Chama o modelo para listar os logs
        console.info(chalk.green('🔍 Chamando LogMonitoramento.listarPorEquipamento() para obter os dados.'));
        const logs = await LogMonitoramento.listarPorEquipamento(ids, dataInicial, dataFinal);
        console.info(chalk.greenBright(`✅ Logs listados com sucesso. Total: ${logs.length}`));
        return logs;

    } catch (error) {
        console.error(chalk.red(`❌ Erro ao listar logs por equipamento: ${error.message}`));
        throw new Error('Erro ao listar logs por equipamento: ' + error.message);
    }
}

module.exports = { listarPorEquipamento };
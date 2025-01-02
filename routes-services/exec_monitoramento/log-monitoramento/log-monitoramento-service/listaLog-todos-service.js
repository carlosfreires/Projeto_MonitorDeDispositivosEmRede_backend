const chalk = require('chalk');
const { LogMonitoramento } = require('../../../../models/LogMonitoramento');

/**
 * Listar todos os logs
 */
async function listarTodos(dataInicial = null, dataFinal = null) {
    console.info(chalk.blue('📋 Iniciando a função listarTodos()'));
    
    if (dataInicial || dataFinal) {
        console.log(chalk.yellow(`📅 Intervalo de datas fornecido: Inicial = ${dataInicial}, Final = ${dataFinal}`));
    } else {
        console.log(chalk.yellow('📅 Nenhum intervalo de datas fornecido. Listando todos os logs.'));
    }

    try {
        console.info(chalk.green('🔍 Chamando LogMonitoramento.listarTodos() para obter os dados.'));
        const logs = await LogMonitoramento.listarTodos();
        console.info(chalk.greenBright(`✅ Logs listados com sucesso. Total: ${logs.length}`));
        return logs;
    } catch (error) {
        console.error(chalk.red(`❌ Erro ao listar todos os logs: ${error.message}`));
        throw new Error('Erro ao listar todos os logs: ' + error.message);
    }
}

module.exports = { listarTodos };
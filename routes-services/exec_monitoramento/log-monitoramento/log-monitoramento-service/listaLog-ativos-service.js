const chalk = require('chalk');
const { LogMonitoramento } = require('../../../../models/LogMonitoramento.js');
const { Equipamento } = require('../../../../models/Equipamento.js');

/**
 * Listar logs de equipamentos ativos.
 */
async function listarLogsAtivos(dataInicial = null, dataFinal = null) {
    console.info(chalk.blue('🚀 Iniciando a função listarLogsAtivos()'));

    try {
        // Recupera os equipamentos ativos
        console.info(chalk.cyan('🔍 Recuperando a lista de equipamentos ativos.'));
        const equipamentosAtivos = await Equipamento.listarAtivos();

        if (equipamentosAtivos.length === 0) {
            console.warn(chalk.yellow('⚠️ Nenhum equipamento ativo encontrado.'));
            return [];
        }

        console.log(chalk.green(`✅ Equipamentos ativos encontrados: ${equipamentosAtivos.length}`));

        // Extrai os IDs dos equipamentos ativos
        const ids = equipamentosAtivos.map(equip => equip.id);
        console.log(chalk.magenta(`📋 IDs dos equipamentos ativos: ${ids.join(', ')}`));

        // Chama o serviço de LogMonitoramento para listar os logs
        console.info(chalk.cyan('🔄 Listando logs dos equipamentos ativos.'));
        const logs = await LogMonitoramento.listarPorEquipamento(ids, dataInicial, dataFinal);

        console.info(chalk.greenBright(`✅ Logs listados com sucesso. Total: ${logs.length}`));
        return logs;

    } catch (error) {
        console.error(chalk.red(`❌ Erro ao listar logs dos equipamentos ativos: ${error.message}`));
        throw new Error('Erro ao listar logs dos equipamentos ativos: ' + error.message);
    }
}

module.exports = { listarLogsAtivos };
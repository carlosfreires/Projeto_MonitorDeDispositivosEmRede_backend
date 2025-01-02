const { Tracert } = require('../../../../models/Tracert');
const chalk = require('chalk');

/**
* Lista Tracerts para equipamentos específicos
*/
async function listarTracertsPorEquipamentos(equipamentosIds) {
    console.info(chalk.blue('🔄 Iniciando a listagem de Tracerts para os equipamentos...'));
  
    try {
        console.info(chalk.yellow(`🔍 Buscando Tracerts para os equipamentos com IDs: ${equipamentosIds.join(', ')}`));

        const tracerts = await Tracert.listarPorEquipamentos(equipamentosIds);

        if (tracerts.length > 0) {
            console.info(chalk.green(`✅ Foram encontrados ${tracerts.length} registros de Tracert para os equipamentos solicitados.`));
        } else {
            console.info(chalk.yellow('⚠️ Nenhum registro de Tracert encontrado para os equipamentos solicitados.'));
        }

        return tracerts;
    } catch (erro) {
        console.error(chalk.red(`❌ Erro ao listar Tracerts para os equipamentos ${equipamentosIds.join(', ')}: ${erro.message}`));
        throw erro;
    }
}

module.exports = { listarTracertsPorEquipamentos };
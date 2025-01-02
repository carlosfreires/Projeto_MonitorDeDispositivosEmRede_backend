const { Tracert } = require('../../../../models/Tracert');
const chalk = require('chalk');

/**
* Lista todos os registros de Tracert
*/
async function listarTracerts() {
    console.info(chalk.blue('🔄 Iniciando a listagem de todos os registros de Tracert...'));
  
    try {
        const tracerts = await Tracert.listarTodos();

        console.info(chalk.green(`✅ ${tracerts.length} registros de Tracert encontrados.`));
        
        return tracerts;
    } catch (erro) {
        console.error(chalk.red(`❌ Erro ao listar registros de Tracert: ${erro.message}`));
        throw erro;
    }
}

module.exports = { listarTracerts };
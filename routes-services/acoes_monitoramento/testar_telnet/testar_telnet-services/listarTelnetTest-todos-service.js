const { Telnet } = require('../../../../models/Telnet');
const chalk = require('chalk');

/**
* Lista todos os testes Telnet registrados.
* @returns {Promise<Array>} Lista de testes Telnet.
*/
async function listarTodosTestesTelnet() {
    try {
        console.info(chalk.blue('🔍 Iniciando a listagem dos testes Telnet...'));

        const testes = await Telnet.listarTodos();

        console.log(chalk.green(`✅ Testes Telnet listados com sucesso. Total de ${testes.length} testes encontrados.`));

        return testes;
    } catch (erro) {
        console.error(chalk.red(`❌ Erro ao listar os testes Telnet: ${erro.message}`));
        throw erro;
    }
}

module.exports = { listarTodosTestesTelnet };
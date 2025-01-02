const { PingTest } = require('../../../../models/PingTest');
const chalk = require('chalk');

/**
 * Lista todos os testes de ping registrados.
 * @returns {Promise<Array>} Lista de testes de ping.
 */
async function listarTodosTestesPing() {
  try {
    console.info(chalk.blue('🔍 Iniciando a listagem de todos os testes de ping registrados...'));

    const testes = await PingTest.listarTodos();

    if (testes.length === 0) {
      console.warn(chalk.yellow('⚠️ Nenhum teste de ping registrado encontrado.'));
    } else {
      console.log(chalk.green(`✅ ${testes.length} testes de ping encontrados.`));
    }

    return testes;
  } catch (erro) {
    console.error(chalk.red(`❌ Erro ao listar testes de ping: ${erro.message}`));
    throw new Error('Erro ao listar testes de ping.');
  }
}

module.exports = { listarTodosTestesPing };
const { PingTest } = require('../../../../models/PingTest');
const chalk = require('chalk');

/**
 * Lista os testes de ping para equipamentos informados.
 * @param {Array} equipamentos Lista de IDs de equipamentos.
 * @returns {Promise<Array>} Resultados dos testes.
 */
async function listarTestesPingPorEquipamentos(equipamentos) {
  try {
    if (!equipamentos || equipamentos.length === 0) {
      console.warn(chalk.yellow('⚠️ Nenhum ID de equipamento foi informado.'));
      return [];
    }

    console.info(chalk.blue('🔍 Iniciando a listagem dos testes de ping para os equipamentos informados...'));

    const testes = await PingTest.listarPorEquipamentos(equipamentos);

    if (testes.length === 0) {
      console.warn(chalk.yellow('⚠️ Nenhum teste de ping encontrado para os equipamentos informados.'));
    } else {
      console.log(chalk.green(`✅ ${testes.length} testes de ping encontrados para os equipamentos.`));
    }

    return testes;
  } catch (erro) {
    console.error(chalk.red(`❌ Erro ao listar testes de ping: ${erro.message}`));
    throw new Error('Erro ao listar testes de ping por equipamentos.');
  }
}

module.exports = { listarTestesPingPorEquipamentos };
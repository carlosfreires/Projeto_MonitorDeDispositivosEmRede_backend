const { Telnet } = require('../../../../models/Telnet');
const chalk = require('chalk');

/**
* Lista os testes Telnet para equipamentos informados.
* @param {Array} equipamentos Lista de IDs de equipamentos.
* @returns {Promise<Array>} Resultados dos testes.
*/
async function listarTestesTelnetPorEquipamentos(equipamentos) {
  try {
    console.info(chalk.blue('🔍 Iniciando a busca pelos testes Telnet para os equipamentos informados...'));

    if (!Array.isArray(equipamentos) || equipamentos.length === 0) {
      console.warn(chalk.yellow('⚠️ Nenhum equipamento informado ou lista vazia.'));
      return [];
    }

    console.info(chalk.blue(`🔢 Total de equipamentos informados: ${equipamentos.length}`));

    const resultados = await Telnet.listarPorEquipamentos(equipamentos);

    console.log(chalk.green(`✅ Testes Telnet encontrados para os equipamentos: ${resultados.length} testes listados.`));

    return resultados;
  } catch (erro) {
    console.error(chalk.red(`❌ Erro ao listar os testes Telnet para os equipamentos: ${erro.message}`));
    throw erro;
  }
}

module.exports = { listarTestesTelnetPorEquipamentos };
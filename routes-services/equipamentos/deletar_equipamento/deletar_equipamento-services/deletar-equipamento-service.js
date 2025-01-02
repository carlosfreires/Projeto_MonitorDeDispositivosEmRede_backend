const chalk = require('chalk');
const { Equipamento } = require('../../../../models/Equipamento'); 

/**
 * Deletar equipamento.
 */
async function deletarEquipamento(id) {
  console.info(chalk.blue('🗑️ Iniciando o processo de deleção de equipamento.'));
  console.log(chalk.cyan(`🔧 ID recebido para deleção: ${id}`));

  try {
    const resultado = await Equipamento.deletarPorId(id);
    if (resultado) {
      console.log(chalk.green(`✅ Equipamento com ID ${id} deletado com sucesso.`));
    } else {
      console.warn(chalk.yellow(`⚠️ Nenhum equipamento encontrado com ID ${id}.`));
    }
    return resultado;
  } catch (erro) {
    console.error(chalk.red(`❌ Erro ao deletar equipamento: ${erro.message}`));
    throw new Error('Erro ao deletar equipamento.');
  }
}

module.exports = { deletarEquipamento };
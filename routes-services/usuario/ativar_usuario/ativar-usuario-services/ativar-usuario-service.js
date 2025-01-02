const { Usuario } = require('../../../../models/Usuario');
const chalk = require('chalk');

/**
 * Ativa um usuário pelo ID.
 * @param {number} id - ID do usuário a ser ativado.
 * @returns {Object} Resultado da ativação.
 */
async function ativarUsuario(id) {
  console.info(chalk.blue('📥 [Ativação de Usuário] Iniciando processo de ativação de usuário...'));
  console.log(chalk.cyan(`🔑 ID do Usuário a ser ativado: ${id}`));

  try {
    console.info(chalk.blue('🛠️ [Ativação de Usuário] Chamando método de ativação do modelo de usuário...'));
    const resultado = await Usuario.ativar(id);

    console.info(chalk.green('✅ [Ativação de Usuário] Usuário ativado com sucesso.'));
    console.log(chalk.cyan(`📄 Detalhes do Resultado: ${JSON.stringify(resultado)}`));

    return resultado;
  } catch (erro) {
    console.error(chalk.red('❌ [Ativação de Usuário] Erro ao ativar usuário.'));
    console.error(chalk.red(`🛑 Detalhes do erro: ${erro.message}`));
    throw new Error('Erro ao ativar usuário.');
  } finally {
    console.info(chalk.blue('🔄 [Ativação de Usuário] Finalizando processo de ativação de usuário.'));
  }
}

module.exports = { ativarUsuario };
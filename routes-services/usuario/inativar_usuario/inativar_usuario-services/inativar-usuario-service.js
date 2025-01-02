const { Usuario } = require('../../../../models/Usuario');
const chalk = require('chalk');

/**
 * Inativa um usuário pelo ID.
 * @param {number} id - ID do usuário a ser inativado.
 * @returns {Object} Resultado da inativação.
 */
async function inativarUsuario(id) {
  console.info(chalk.blue('📥 [Inativação de Usuário] Iniciando processo de inativação de usuário...'));
  console.log(chalk.cyan(`🔑 ID do Usuário a ser inativado: ${id}`));

  try {
    console.info(chalk.blue('🛠️ [Inativação de Usuário] Chamando método de inativação do modelo de usuário...'));
    const resultado = await Usuario.inativar(id);

    console.info(chalk.green('✅ [Inativação de Usuário] Usuário inativado com sucesso.'));
    console.log(chalk.cyan(`📄 Detalhes do Resultado: ${JSON.stringify(resultado)}`));

    return resultado;
  } catch (erro) {
    console.error(chalk.red('❌ [Inativação de Usuário] Erro ao inativar usuário.'));
    console.error(chalk.red(`🛑 Detalhes do erro: ${erro.message}`));
    throw new Error('Erro ao inativar usuário.');
  } finally {
    console.info(chalk.blue('🔄 [Inativação de Usuário] Finalizando processo de inativação de usuário.'));
  }
}

module.exports = { inativarUsuario };
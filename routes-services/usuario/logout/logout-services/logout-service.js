const { Sessao } = require('../../../../models/Sessao');
const chalk = require('chalk');

/**
 * Realiza o logout do usuário.
 * @param {string} token - Token JWT da sessão do usuário.
 * @returns {Object} Mensagem de confirmação.
 */
async function realizarLogout(token) {
  console.info(chalk.blue('📥 [Logout] Iniciando processo de logout...'));
  console.log(chalk.cyan(`🔑 Token recebido: ${token}`));

  try {
    console.info(chalk.blue('🛠️ [Logout] Chamando método para remover a sessão do token...'));
    await Sessao.removerSessaoPorToken(token);

    console.info(chalk.green('✅ [Logout] Logout realizado com sucesso.'));
    return { message: 'Logout realizado com sucesso.' };
  } catch (erro) {
    console.error(chalk.red('❌ [Logout] Erro ao realizar logout.'));
    console.error(chalk.red(`🛑 Detalhes do erro: ${erro.message}`));
    throw new Error('Erro ao realizar logout.');
  } finally {
    console.info(chalk.blue('🔄 [Logout] Finalizando processo de logout.'));
  }
}

module.exports = { realizarLogout };
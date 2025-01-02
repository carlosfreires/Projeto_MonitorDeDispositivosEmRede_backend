const { SolicitacaoAcesso } = require('../../../../models/SolicitacaoAcesso');
const chalk = require('chalk');

/**
 * Rejeita uma solicitação de acesso.
 * @param {number} idSolicitacao - ID da solicitação.
 * @param {number} usuarioRejeitadorId - ID do usuário que rejeitou.
 * @returns {Object} Mensagem de sucesso.
 */
async function rejeitarSolicitacao(idSolicitacao, usuarioRejeitadorId) {
  console.info(chalk.blue('📥 [Rejeição de Solicitação] Iniciando rejeição da solicitação de acesso...'));
  console.log(chalk.cyan(`🔑 ID da Solicitação: ${idSolicitacao}, ID do Usuário Rejeitador: ${usuarioRejeitadorId}`));

  try {
    console.info(chalk.blue('🔍 [Rejeição de Solicitação] Buscando solicitação pendente...'));

    // Busca a solicitação pendente
    const solicitacao = await SolicitacaoAcesso.buscarPendente(idSolicitacao);

    if (!solicitacao) {
      console.warn(chalk.yellow('⚠️ [Rejeição de Solicitação] Solicitação não encontrada ou já processada.'));
      throw new Error('Solicitação não encontrada ou já processada.');
    }

    console.info(chalk.blue('🛠️ [Rejeição de Solicitação] Rejeitando a solicitação...'));

    // Rejeita a solicitação
    await solicitacao.rejeitar(usuarioRejeitadorId);

    console.info(chalk.green('✅ [Rejeição de Solicitação] Solicitação rejeitada com sucesso.'));
    return { message: 'Solicitação rejeitada com sucesso.' };
  } catch (erro) {
    console.error(chalk.red('❌ [Rejeição de Solicitação] Erro ao rejeitar a solicitação.'));
    console.error(chalk.red(`🛑 Mensagem: ${erro.message}`));
    throw new Error('Erro ao rejeitar solicitação.');
  } finally {
    console.info(chalk.blue('🔄 [Rejeição de Solicitação] Finalizando processo de rejeição.'));
  }
}

module.exports = { rejeitarSolicitacao };
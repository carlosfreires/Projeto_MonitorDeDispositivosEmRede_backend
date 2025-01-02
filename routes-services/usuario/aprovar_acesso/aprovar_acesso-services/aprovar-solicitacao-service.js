const { SolicitacaoAcesso } = require('../../../../models/SolicitacaoAcesso');
const { Usuario } = require('../../../../models/Usuario');
const chalk = require('chalk');

/**
 * Aprova uma solicitação de acesso.
 * @param {number} idSolicitacao - ID da solicitação.
 * @param {number} usuarioAprovadorId - ID do usuário que aprovou.
 * @returns {Object} Mensagem de sucesso.
 */
async function aprovarSolicitacao(idSolicitacao, usuarioAprovadorId) {
  console.info(chalk.blue('📥 [Aprovação de Solicitação] Iniciando aprovação da solicitação...'));
  console.log(chalk.cyan(`🔑 ID da Solicitação: ${idSolicitacao}, ID do Usuário Aprovador: ${usuarioAprovadorId}`));

  try {
    console.info(chalk.blue('🔍 [Aprovação de Solicitação] Buscando solicitação pendente...'));
    const solicitacao = await SolicitacaoAcesso.buscarPendente(idSolicitacao);

    if (!solicitacao) {
      console.warn(chalk.yellow('⚠️ [Aprovação de Solicitação] Solicitação não encontrada ou já processada.'));
      throw new Error('Solicitação não encontrada ou já processada.');
    }

    console.info(chalk.blue('✅ [Aprovação de Solicitação] Solicitação encontrada. Iniciando aprovação...'));
    await solicitacao.aprovar(usuarioAprovadorId);
    console.info(chalk.green('✅ [Aprovação de Solicitação] Solicitação aprovada com sucesso.'));

    console.info(chalk.blue('👤 [Criação de Usuário] Criando novo usuário com os dados aprovados...'));
    await Usuario.salvar(
      {
        nome: solicitacao.nome,
        sobrenome: solicitacao.sobrenome,
        email: solicitacao.email,
        senha: solicitacao.senha,
        perfil: solicitacao.perfil_solicitado,
        aprovadoPor: usuarioAprovadorId,
      },
      true // Usuário ativo após aprovação
    );
    console.info(chalk.green('✅ [Criação de Usuário] Usuário criado e ativado com sucesso.'));

    return { message: 'Solicitação aprovada e usuário criado com sucesso.' };
  } catch (erro) {
    console.error(chalk.red('❌ [Aprovação de Solicitação] Erro ao aprovar solicitação.'));
    console.error(chalk.red(`🛑 Detalhes do erro: ${erro.message}`));
    throw new Error('Erro ao aprovar solicitação.');
  } finally {
    console.info(chalk.blue('🔄 [Aprovação de Solicitação] Finalizando processo de aprovação.'));
  }
}

module.exports = { aprovarSolicitacao };
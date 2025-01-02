const { SolicitacaoAcesso } = require('../../../../models/SolicitacaoAcesso');
const chalk = require('chalk');

/**
 * Solicita acesso para um novo usuário.
 * @param {Object} dadosSolicitacao - Dados para solicitar acesso.
 * @returns {Object} Mensagem de confirmação e ID da solicitação.
 */
async function solicitarAcesso({ nome, sobrenome, email, senha, motivo, perfil_solicitado }) {
  console.info(chalk.blue('📥 [Solicitação de Acesso] Iniciando solicitação de acesso...'));
  
  try {
    console.info(chalk.blue('🛠️ [Solicitação de Acesso] Chamando método criar da classe SolicitacaoAcesso...'));
    console.log(chalk.cyan(`🔑 Nome: ${nome}, Sobrenome: ${sobrenome}, Email: ${email}, Perfil: ${perfil_solicitado}`));

    // Chama o método de criação na classe SolicitacaoAcesso
    const novaSolicitacao = await SolicitacaoAcesso.criar({ nome, sobrenome, email, senha, motivo, perfil_solicitado });
    
    console.info(chalk.green('✅ [Solicitação de Acesso] Solicitação criada com sucesso.'));
    console.log(chalk.cyan(`🆔 ID da Solicitação: ${novaSolicitacao.id}`));
    
    return { 
      message: '✅ Solicitação enviada com sucesso! Aguardando aprovação.', 
      solicitacaoId: novaSolicitacao.id 
    };
  } catch (erro) {
    console.error(chalk.red('❌ [Solicitação de Acesso] Erro ao solicitar acesso.'));
    console.error(chalk.red(`🛑 Mensagem: ${erro.message}`));
    throw new Error('Erro ao solicitar acesso.');
  } finally {
    console.info(chalk.blue('🔄 [Solicitação de Acesso] Finalizando solicitação de acesso.'));
  }
}

module.exports = { solicitarAcesso };
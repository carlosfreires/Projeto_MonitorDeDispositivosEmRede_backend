const { Usuario } = require('../../../../models/Usuario');
const chalk = require('chalk');

/**
 * Cadastra um novo usuário.
 * @param {Object} dadosUsuario - Dados para cadastrar o usuário.
 * @returns {Object} Mensagem de confirmação e ID do usuário.
 */
async function cadastrarUsuario({ nome, sobrenome, email, senha, perfil, aprovadoPor }) {
  console.info(chalk.blue('📥 [Cadastro de Usuário] Iniciando processo de cadastro de novo usuário...'));
  console.log(
    chalk.cyan(
      `🔑 Dados do Usuário: Nome: ${nome}, Sobrenome: ${sobrenome}, Email: ${email}, Perfil: ${perfil}, Aprovado por: ${aprovadoPor}`
    )
  );

  try {
    console.info(chalk.blue('🛠️ [Cadastro de Usuário] Salvando novo usuário no banco de dados...'));
    const novoUsuario = await Usuario.salvar(
      { nome, sobrenome, email, senha, perfil, aprovadoPor },
      false // Usuário inativo por padrão
    );

    console.info(chalk.green('✅ [Cadastro de Usuário] Usuário cadastrado com sucesso.'));
    console.log(chalk.cyan(`🆔 ID do Novo Usuário: ${novoUsuario.id}`));

    return { 
      message: 'Usuário cadastrado com sucesso!', 
      userId: novoUsuario.id 
    };
  } catch (erro) {
    console.error(chalk.red('❌ [Cadastro de Usuário] Erro ao cadastrar usuário.'));
    console.error(chalk.red(`🛑 Detalhes do erro: ${erro.message}`));
    throw new Error('Erro ao cadastrar usuário.');
  } finally {
    console.info(chalk.blue('🔄 [Cadastro de Usuário] Finalizando processo de cadastro de usuário.'));
  }
}

module.exports = { cadastrarUsuario };
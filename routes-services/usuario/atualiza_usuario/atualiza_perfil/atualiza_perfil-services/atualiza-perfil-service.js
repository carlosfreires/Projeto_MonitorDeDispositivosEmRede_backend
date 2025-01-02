const { Usuario } = require('../../../../../models/Usuario');
const { SolicitacaoAcesso } = require('../../../../../models/SolicitacaoAcesso');
const chalk = require('chalk');

/**
 * Serviço para solicitar atualização de perfil.
 */
async function solicitarAtualizacaoPerfil({ idUsuario, novoPerfil, motivo }) {
    console.info(chalk.yellow(`🛠️ Solicitando atualização de perfil para o usuário ID: ${idUsuario}`));

    try {
        // Buscar informações do usuário usando a classe Usuario
        const { nome, sobrenome, email } = await Usuario.buscarPorId(idUsuario);

        // Criar solicitação na tabela SolicitacaoAcesso
        await SolicitacaoAcesso.criar({
            nome,
            sobrenome,
            email,
            senha: 'N/A', // Senha não é relevante para essa solicitação
            motivo,
            perfil_solicitado: novoPerfil,
        });

        console.info(chalk.green(`✅ Solicitação de atualização de perfil criada com sucesso para o usuário ID: ${idUsuario}`));
    } catch (error) {
        console.error(chalk.red(`❌ Erro ao solicitar atualização de perfil: ${error.message}`));
        throw error;
    }
}

module.exports = { solicitarAtualizacaoPerfil };
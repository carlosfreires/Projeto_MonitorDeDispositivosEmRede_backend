const { Usuario } = require('../../../../../models/Usuario');
const chalk = require('chalk');

/**
 * Serviço para atualizar senha.
 */
async function atualizarSenha(req, res) {
    console.log(chalk.blue('🔑 [Service] Recebendo solicitação para atualizar senha.'));
    try {
        const { id } = req.params;
        const { novaSenha } = req.body;
        await Usuario.atualizarSenha(id, novaSenha);
        console.info(chalk.green('✅ Senha atualizada com sucesso.'));
        res.status(200).json({ mensagem: 'Senha atualizada com sucesso.' });
    } catch (erro) {
        console.error(chalk.red('❌ Erro ao atualizar senha:', erro.message));
        res.status(500).json({ erro: erro.message });
    }
}

module.exports = { atualizarSenha };

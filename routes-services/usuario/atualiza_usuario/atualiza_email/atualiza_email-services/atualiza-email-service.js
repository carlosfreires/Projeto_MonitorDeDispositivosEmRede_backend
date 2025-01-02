const { Usuario } = require('../../../../../models/Usuario');
const chalk = require('chalk');

/**
 * Serviço para atualizar o email do usuário.
 */
async function atualizarEmail(req, res) {
    console.log(chalk.blue('📧 [Service] Recebendo solicitação para atualizar email.'));
    try {
        const { id } = req.params;
        const { novoEmail } = req.body;
        await Usuario.atualizarEmail(id, novoEmail);
        console.info(chalk.green('✅ Email atualizado com sucesso.'));
        res.status(200).json({ mensagem: 'Email atualizado com sucesso.' });
    } catch (erro) {
        console.error(chalk.red('❌ Erro ao atualizar email:', erro.message));
        res.status(500).json({ erro: erro.message });
    }
}

module.exports = { atualizarEmail };
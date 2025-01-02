const { Usuario } = require('../../../../../models/Usuario');
const chalk = require('chalk');

/**
 * Serviço para atualizar dados cadastrais do usuário.
 */
async function atualizarDadosCadastrais(req, res) {
    console.log(chalk.blue('🔄 [Service] Recebendo solicitação para atualizar dados cadastrais.'));
    try {
        const { id } = req.params;
        const { nome, sobrenome } = req.body;
        await Usuario.atualizarDadosCadastrais(id, { nome, sobrenome });
        console.info(chalk.green('✅ Dados cadastrais atualizados com sucesso.'));
        res.status(200).json({ mensagem: 'Dados cadastrais atualizados com sucesso.' });
    } catch (erro) {
        console.error(chalk.red('❌ Erro ao atualizar dados cadastrais:', erro.message));
        res.status(500).json({ erro: erro.message });
    }
}

module.exports = { atualizarDadosCadastrais };
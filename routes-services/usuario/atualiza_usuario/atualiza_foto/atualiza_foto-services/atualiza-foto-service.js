const { Usuario } = require('../../../../../models/Usuario');
const chalk = require('chalk');

/**
 * Serviço para atualizar foto de perfil.
 */
async function atualizarFotoPerfil(req, res) {
    console.log(chalk.blue('📸 [Service] Recebendo solicitação para atualizar foto de perfil.'));
    try {
        const { id } = req.params;
        const { fotoPerfilUrl } = req.body;
        await Usuario.atualizarFotoPerfil(id, fotoPerfilUrl);
        console.info(chalk.green('✅ Foto de perfil atualizada com sucesso.'));
        res.status(200).json({ mensagem: 'Foto de perfil atualizada com sucesso.' });
    } catch (erro) {
        console.error(chalk.red('❌ Erro ao atualizar foto de perfil:', erro.message));
        res.status(500).json({ erro: erro.message });
    }
}

module.exports = { atualizarFotoPerfil };
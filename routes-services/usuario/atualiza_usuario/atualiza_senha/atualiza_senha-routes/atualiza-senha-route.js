const express = require('express');
const { atualizarSenha } = require('../atualiza_senha-services/atualiza-senha-service');
const chalk = require('chalk'); // Para logs coloridos

const router = express.Router();

router.put('/:id', express.json(), async (req, res) => {
    console.info(chalk.blue('📥 [Atualização de Senha - Rota] Recebendo requisição para atualizar senha...'));
    console.log(chalk.cyan(`🔑 ID do Usuário: ${req.params.id}, Corpo da Requisição: ${JSON.stringify(req.body)}`));

    try {
        const { id } = req.params;
        const { novaSenha } = req.body;

        if (!novaSenha) {
            console.warn(chalk.yellow('⚠️ [Atualização de Senha - Rota] Campo "novaSenha" ausente no corpo da requisição.'));
            return res.status(400).json({ erro: 'O campo "novaSenha" é obrigatório.' });
        }

        console.info(chalk.blue('🛠️ [Atualização de Senha - Rota] Chamando serviço de atualização de senha...'));
        await atualizarSenha(req, res);

        console.info(chalk.green('✅ [Atualização de Senha - Rota] Senha atualizada com sucesso.'));
    } catch (erro) {
        console.error(chalk.red('❌ [Atualização de Senha - Rota] Erro ao atualizar senha.'));
        console.error(chalk.red(`🛑 Detalhes do erro: ${erro.message}`));

        res.status(500).json({ error: 'Erro ao atualizar senha.' });
    } finally {
        console.info(chalk.blue('🔄 [Atualização de Senha - Rota] Finalizando processamento da requisição.'));
    }
});

module.exports = router;
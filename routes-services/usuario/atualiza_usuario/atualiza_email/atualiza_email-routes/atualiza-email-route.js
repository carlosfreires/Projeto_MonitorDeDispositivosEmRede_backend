const express = require('express');
const { atualizarEmail } = require('../atualiza_email-services/atualiza-email-service');
const chalk = require('chalk');

const router = express.Router();

router.put('/:id', express.json(), async (req, res) => {
    console.info(chalk.blue('📥 [Atualização de Email - Rota] Recebendo requisição para atualizar o email de um usuário...'));
    console.log(chalk.cyan(`🔑 ID do Usuário: ${req.params.id}, Corpo da Requisição: ${JSON.stringify(req.body)}`));

    try {
        const { id } = req.params;
        const { novoEmail } = req.body;

        if (!novoEmail) {
            console.warn(chalk.yellow('⚠️ [Atualização de Email - Rota] Campo "novoEmail" ausente no corpo da requisição.'));
            return res.status(400).json({ erro: 'O campo "novoEmail" é obrigatório.' });
        }

        console.info(chalk.blue('🛠️ [Atualização de Email - Rota] Chamando serviço de atualização de email...'));
        await atualizarEmail(req, res);

        console.info(chalk.green('✅ [Atualização de Email - Rota] Email atualizado com sucesso.'));
    } catch (erro) {
        console.error(chalk.red('❌ [Atualização de Email - Rota] Erro ao atualizar o email.'));
        console.error(chalk.red(`🛑 Detalhes do erro: ${erro.message}`));

        res.status(500).json({ error: 'Erro ao atualizar email do usuário.' });
    } finally {
        console.info(chalk.blue('🔄 [Atualização de Email - Rota] Finalizando processamento da requisição.'));
    }
});

module.exports = router;

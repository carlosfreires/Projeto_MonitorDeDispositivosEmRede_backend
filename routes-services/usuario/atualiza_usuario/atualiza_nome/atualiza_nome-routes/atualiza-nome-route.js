const express = require('express');
const { atualizarDadosCadastrais } = require('../atualiza_nome-services/atualiza-nome-service');
const chalk = require('chalk');

const router = express.Router();

router.put('/:id', express.json(), async (req, res) => {
    console.info(chalk.blue('📥 [Atualização de Dados Cadastrais - Rota] Recebendo requisição para atualizar dados cadastrais do usuário...'));
    console.log(chalk.cyan(`🔑 ID do Usuário: ${req.params.id}, Corpo da Requisição: ${JSON.stringify(req.body)}`));

    try {
        const { id } = req.params;
        const { nome, sobrenome } = req.body;

        if (!nome || !sobrenome) {
            console.warn(chalk.yellow('⚠️ [Atualização de Dados Cadastrais - Rota] Campos "nome" ou "sobrenome" ausentes no corpo da requisição.'));
            return res.status(400).json({ erro: 'Os campos "nome" e "sobrenome" são obrigatórios.' });
        }

        console.info(chalk.blue('🛠️ [Atualização de Dados Cadastrais - Rota] Chamando serviço de atualização de dados cadastrais...'));
        await atualizarDadosCadastrais(req, res);

        console.info(chalk.green('✅ [Atualização de Dados Cadastrais - Rota] Dados cadastrais atualizados com sucesso.'));
    } catch (erro) {
        console.error(chalk.red('❌ [Atualização de Dados Cadastrais - Rota] Erro ao atualizar os dados cadastrais.'));
        console.error(chalk.red(`🛑 Detalhes do erro: ${erro.message}`));

        res.status(500).json({ error: 'Erro ao atualizar os dados cadastrais do usuário.' });
    } finally {
        console.info(chalk.blue('🔄 [Atualização de Dados Cadastrais - Rota] Finalizando processamento da requisição.'));
    }
});

module.exports = router;
const express = require('express');
const { aprovarSolicitacao } = require('../aprovar_acesso-services/aprovar-solicitacao-service');
const chalk = require('chalk');

const router = express.Router();

router.put('/:id', express.json(), async (req, res) => {
  console.info(chalk.blue('📥 [Aprovação de Solicitação - Rota] Recebendo requisição para aprovar uma solicitação...'));
  console.log(chalk.cyan(`🔑 ID da Solicitação: ${req.params.id}, Corpo da Requisição: ${JSON.stringify(req.body)}`));

  try {
    const { usuarioAprovadorId } = req.body; // ID do usuário aprovador
    const idSolicitacao = req.params.id;

    console.info(chalk.blue('🛠️ [Aprovação de Solicitação - Rota] Chamando serviço de aprovação...'));
    const resultado = await aprovarSolicitacao(idSolicitacao, usuarioAprovadorId);

    console.info(chalk.green('✅ [Aprovação de Solicitação - Rota] Solicitação aprovada com sucesso.'));
    console.log(chalk.cyan(`📄 Resposta enviada ao cliente: ${JSON.stringify(resultado)}`));

    res.status(200).json(resultado);
  } catch (erro) {
    console.error(chalk.red('❌ [Aprovação de Solicitação - Rota] Erro ao processar aprovação.'));
    console.error(chalk.red(`🛑 Detalhes do erro: ${erro.message}`));

    res.status(500).json({ error: 'Erro ao aprovar solicitação.' });
  } finally {
    console.info(chalk.blue('🔄 [Aprovação de Solicitação - Rota] Finalizando processamento da requisição.'));
  }
});

module.exports = router;
const express = require('express');
const { rejeitarSolicitacao } = require('../negar_acesso-services/rejeitar-solicitacao-service');
const chalk = require('chalk');

const router = express.Router();

router.put('/:id', express.json(), async (req, res) => {
  console.info(chalk.blue('📥 [Rejeição de Solicitação - Rota] Recebendo requisição para rejeitar uma solicitação...'));
  console.log(chalk.cyan(`🔑 ID da Solicitação: ${req.params.id}, Corpo da Requisição: ${JSON.stringify(req.body)}`));

  try {
    const { usuarioRejeitadorId } = req.body; // ID do usuário que está rejeitando
    const idSolicitacao = req.params.id;

    console.info(chalk.blue('🛠️ [Rejeição de Solicitação - Rota] Chamando serviço de rejeição...'));
    const resultado = await rejeitarSolicitacao(idSolicitacao, usuarioRejeitadorId);

    console.info(chalk.green('✅ [Rejeição de Solicitação - Rota] Solicitação rejeitada com sucesso.'));
    console.log(chalk.cyan(`📄 Resposta enviada ao cliente: ${JSON.stringify(resultado)}`));

    res.status(200).json(resultado);
  } catch (erro) {
    console.error(chalk.red('❌ [Rejeição de Solicitação - Rota] Erro ao processar rejeição.'));
    console.error(chalk.red(`🛑 Detalhes do erro: ${erro.message}`));

    res.status(500).json({ error: 'Erro ao rejeitar solicitação.' });
  } finally {
    console.info(chalk.blue('🔄 [Rejeição de Solicitação - Rota] Finalizando processamento da requisição.'));
  }
});

module.exports = router;
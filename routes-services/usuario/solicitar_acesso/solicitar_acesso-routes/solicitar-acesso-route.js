const express = require('express');
const { solicitarAcesso } = require('../solicitar_acesso-services/solicitar-acesso-service');
const chalk = require('chalk');

const router = express.Router();

router.post('/', express.json(), async (req, res) => {
  console.info(chalk.blue('📥 [Rota de Solicitação de Acesso] Recebendo requisição POST para solicitar acesso.'));
  
  try {
    console.info(chalk.cyan('📝 [Rota de Solicitação de Acesso] Dados recebidos no corpo da requisição:'));
    console.log(chalk.cyan(JSON.stringify(req.body, null, 2)));

    // Chamando serviço de solicitação de acesso
    console.info(chalk.blue('🛠️ [Rota de Solicitação de Acesso] Chamando serviço de solicitação de acesso...'));
    const resultado = await solicitarAcesso(req.body);

    console.info(chalk.green('✅ [Rota de Solicitação de Acesso] Solicitação processada com sucesso.'));
    console.log(chalk.green(`🔑 ID da Solicitação: ${resultado.solicitacaoId}`));

    res.status(201).json(resultado);
  } catch (erro) {
    console.error(chalk.red('❌ [Rota de Solicitação de Acesso] Erro ao processar solicitação.'));
    console.error(chalk.red(`🛑 Detalhes do erro: ${erro.message}`));

    res.status(500).json({ error: 'Erro ao solicitar acesso.' });
  } finally {
    console.info(chalk.yellow('🔄 [Rota de Solicitação de Acesso] Finalizando processamento da requisição POST.'));
  }
});

module.exports = router;
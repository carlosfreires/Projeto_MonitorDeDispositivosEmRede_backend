const express = require('express');
const { ativarUsuario } = require('../ativar-usuario-services/ativar-usuario-service');
const chalk = require('chalk');

const router = express.Router();

router.put('/:id', express.json(), async (req, res) => {
  console.info(chalk.blue('📥 [Ativação de Usuário - Rota] Recebendo requisição para ativação de usuário...'));
  console.log(chalk.cyan(`🔑 ID do Usuário recebido: ${req.params.id}`));

  try {
    const usuario_id = req.params.id;

    console.info(chalk.blue('🛠️ [Ativação de Usuário - Rota] Chamando serviço de ativação de usuário...'));
    const resultado = await ativarUsuario(usuario_id);

    console.info(chalk.green('✅ [Ativação de Usuário - Rota] Usuário ativado com sucesso.'));
    console.log(chalk.cyan(`📄 Resposta enviada ao cliente: ${JSON.stringify(resultado)}`));

    res.status(200).json(resultado);
  } catch (erro) {
    console.error(chalk.red('❌ [Ativação de Usuário - Rota] Erro ao ativar usuário.'));
    console.error(chalk.red(`🛑 Detalhes do erro: ${erro.message}`));

    res.status(500).json({ error: 'Erro ao ativar usuário.' });
  } finally {
    console.info(chalk.blue('🔄 [Ativação de Usuário - Rota] Finalizando processamento da requisição.'));
  }
});

module.exports = router;
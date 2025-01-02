const express = require('express');
const { inativarUsuario } = require('../inativar_usuario-services/inativar-usuario-service');
const chalk = require('chalk');

const router = express.Router();

router.put('/:id', express.json(), async (req, res) => {
  console.info(chalk.blue('📥 [Inativação de Usuário - Rota] Recebendo requisição para inativação de usuário...'));
  console.log(chalk.cyan(`🔑 ID do Usuário recebido: ${req.params.id}`));

  try {
    const usuario_id = req.params.id;

    console.info(chalk.blue('🛠️ [Inativação de Usuário - Rota] Chamando serviço de inativação de usuário...'));
    const resultado = await inativarUsuario(usuario_id);

    console.info(chalk.green('✅ [Inativação de Usuário - Rota] Usuário inativado com sucesso.'));
    console.log(chalk.cyan(`📄 Resposta enviada ao cliente: ${JSON.stringify(resultado)}`));

    res.status(200).json(resultado);
  } catch (erro) {
    console.error(chalk.red('❌ [Inativação de Usuário - Rota] Erro ao inativar usuário.'));
    console.error(chalk.red(`🛑 Detalhes do erro: ${erro.message}`));

    res.status(500).json({ error: 'Erro ao inativar usuário.' });
  } finally {
    console.info(chalk.blue('🔄 [Inativação de Usuário - Rota] Finalizando processamento da requisição.'));
  }
});

module.exports = router;
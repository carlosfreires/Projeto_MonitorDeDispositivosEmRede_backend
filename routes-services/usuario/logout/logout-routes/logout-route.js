const express = require('express');
const { realizarLogout } = require('../logout-services/logout-service');
const chalk = require('chalk');

const router = express.Router();

router.post('/', async (req, res) => {
  console.info(chalk.blue('📥 [Logout - Rota] Recebendo requisição para realizar logout...'));

  try {
    const token = req.headers.authorization?.split(' ')[1]; // Obtém o token do cabeçalho
    console.log(chalk.cyan(`🔑 Token recebido do cabeçalho: ${token}`));

    console.info(chalk.blue('🛠️ [Logout - Rota] Chamando serviço de logout...'));
    const resultado = await realizarLogout(token); // Chama o serviço de logout

    console.info(chalk.green('✅ [Logout - Rota] Logout realizado com sucesso.'));
    console.log(chalk.cyan(`📄 Resposta enviada ao cliente: ${JSON.stringify(resultado)}`));

    return res.status(200).json(resultado);
  } catch (erro) {
    console.error(chalk.red('❌ [Logout - Rota] Erro ao realizar logout.'));
    console.error(chalk.red(`🛑 Detalhes do erro: ${erro.message}`));

    res.status(500).json({ error: 'Erro ao realizar logout.' });
  } finally {
    console.info(chalk.blue('🔄 [Logout - Rota] Finalizando processamento da requisição.'));
  }
});

module.exports = router;
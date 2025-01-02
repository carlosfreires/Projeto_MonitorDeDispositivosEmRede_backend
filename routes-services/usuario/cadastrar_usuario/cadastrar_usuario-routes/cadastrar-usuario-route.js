const express = require('express');
const { cadastrarUsuario } = require('../cadastrar_usuario-services/cadastrar-usuario-service');
const chalk = require('chalk');

const router = express.Router();

// Rota para cadastro de usuários
router.post('/', express.json(), async (req, res) => {
  console.info(chalk.blue('📥 [Cadastro de Usuário - Rota] Recebendo requisição para cadastro de usuário...'));
  console.log(chalk.cyan(`📄 Dados da Requisição: ${JSON.stringify(req.body)}`));

  try {
    console.info(chalk.blue('🛠️ [Cadastro de Usuário - Rota] Chamando serviço de cadastro de usuário...'));
    const resultado = await cadastrarUsuario(req.body);

    console.info(chalk.green('✅ [Cadastro de Usuário - Rota] Usuário cadastrado com sucesso.'));
    console.log(chalk.cyan(`📄 Resposta enviada ao cliente: ${JSON.stringify(resultado)}`));

    res.status(201).json(resultado);
  } catch (erro) {
    console.error(chalk.red('❌ [Cadastro de Usuário - Rota] Erro ao processar cadastro de usuário.'));
    console.error(chalk.red(`🛑 Detalhes do erro: ${erro.message}`));

    res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
  } finally {
    console.info(chalk.blue('🔄 [Cadastro de Usuário - Rota] Finalizando processamento da requisição.'));
  }
});

module.exports = router;
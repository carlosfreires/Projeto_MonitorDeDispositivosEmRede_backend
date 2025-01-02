const express = require('express');
const { login } = require('../login-services/login-service');
const chalk = require('chalk');

const router = express.Router();

router.post('/', express.json(), async (req, res) => {
    console.info(chalk.blue('📥 [Login] Iniciando requisição de login...'));

    try {
        const { email, senha } = req.body;
        const ip = req.ip; // Captura o IP do cliente

        console.log(chalk.cyan(`🔑 [Login] Dados recebidos: Email: ${email}, IP: ${ip}`));

        const resultado = await login({ email, senha, ip });

        console.info(chalk.green('✅ [Login] Login realizado com sucesso.'));
        console.log(chalk.cyan(`📄 [Login] Token gerado: ${resultado.token}, Expiração: ${resultado.expiracao}`));

        res.status(200).json(resultado);
    } catch (erro) {
        console.error(chalk.red('❌ [Login] Erro ao realizar login.'));
        console.error(chalk.red(`🛑 Detalhes do erro: ${erro.message}`));

        res.status(401).json({ error: erro.message });
    }
});

module.exports = router;
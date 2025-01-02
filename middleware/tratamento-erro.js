const chalk = require('chalk');

/**
 * Middleware de tratamento de erros
 * @param {Error} err - Objeto de erro.
 * @param {Request} req - Objeto de requisição.
 * @param {Response} res - Objeto de resposta.
 * @param {Function} next - Próximo middleware.
 */
function tratamentoDeErros(err, req, res, next) {
    console.error(chalk.red.bold('❌ ERRO DETECTADO:'));
    console.error(chalk.red(`🛑 Mensagem: ${err.message}`));
    console.error(chalk.red(`📄 Rota: ${req.originalUrl}`));
    console.error(chalk.red(`🔧 Método: ${req.method}`));
    console.error(chalk.red(`💻 IP: ${req.ip}`));
    console.error(chalk.red(`📝 Stack Trace:\n${err.stack}`));

    console.info(chalk.yellow('⚠️ Enviando resposta de erro para o cliente...'));
    res.status(500).json({
        error: 'Algo deu errado no servidor.',
        detalhes: err.message
    });
    
    console.info(chalk.green('✅ Resposta de erro enviada com sucesso.'));
}

module.exports = tratamentoDeErros;
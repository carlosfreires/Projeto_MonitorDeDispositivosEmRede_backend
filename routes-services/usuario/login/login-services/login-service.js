const { Usuario } = require('../../../../models/Usuario');
const { Sessao } = require ('../../../../models/Sessao');
const jwt = require('jsonwebtoken');
const chalk = require('chalk');

// Configuração do segredo JWT e tempo de expiração
const JWT_SECRET = 'seu_segredo_super_secreto';
const TOKEN_EXPIRATION = '2h'; // Tempo de expiração do token

/**
 * Realiza o login do usuário.
 * @param {Object} params - Parâmetros do login.
 * @param {string} params.email - E-mail do usuário.
 * @param {string} params.senha - Senha do usuário.
 * @param {string} params.ip - Endereço IP do usuário.
 * @returns {Object} Token e data de expiração.
 */
async function login({ email, senha, ip }) {
    console.info(chalk.blue('📥 [Login] Iniciando processo de login...'));
    console.log(chalk.cyan(`🔑 Email: ${email}, IP: ${ip}`));

    try {
        // Busca o usuário pelo e-mail
        console.info(chalk.blue('🔎 [Login] Buscando usuário pelo e-mail...'));
        const usuario = await Usuario.buscarPorEmail(email);
        if (!usuario) {
            console.error(chalk.red('❌ [Login] Usuário não encontrado ou inativo.'));
            throw new Error('Usuário não encontrado ou inativo.');
        }

        // Valida a senha 
        console.info(chalk.blue('🔑 [Login] Validando senha...'));
        const senhaValida = await usuario.validarSenha(senha);
        if (!senhaValida) {
            console.error(chalk.red('❌ [Login] Credenciais inválidas.'));
            throw new Error('Credenciais inválidas.');
        }

        // Gera token JWT
        console.info(chalk.blue('🛠️ [Login] Gerando token JWT...'));
        const token = jwt.sign({ id: usuario.id }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
        const expiracao = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 horas

        // Cria a sessão
        console.info(chalk.blue('🛠️ [Login] Criando sessão...'));
        await Sessao.criarSessao({ usuario_id: usuario.id, token, expiracao, ip });

        console.info(chalk.green('✅ [Login] Login realizado com sucesso.'));
        console.log(chalk.cyan(`📄 Token gerado: ${token}, Expiração: ${expiracao}`));

        return { token, expiracao };
    } catch (erro) {
        console.error(chalk.red('❌ [Login] Erro no processo de login.'));
        console.error(chalk.red(`🛑 Detalhes do erro: ${erro.message}`));
        throw new Error('Erro ao realizar login.');
    }
}

module.exports = { login };
const { obterConexao } = require('../database/conectadb');
const bcrypt = require('bcrypt');
const chalk = require('chalk');

class Usuario {
    constructor({ id, nome, sobrenome, email, senha, foto_perfil, perfil, ativo, aprovado_por, ultima_modificacao_por, created_at, updated_at }) {
        this.id = id;
        this.nome = nome;
        this.sobrenome = sobrenome;
        this.email = email;
        this.senha = senha;
        this.foto_perfil = foto_perfil;
        this.perfil = perfil;
        this.ativo = ativo;
        this.aprovado_por = aprovado_por;
        this.ultima_modificacao_por = ultima_modificacao_por;
        this.created_at = created_at;
        this.updated_at = updated_at;
        console.info(chalk.blue(`🆕 Instância de Usuario criada: ${this.nome} ${this.sobrenome}`));
    }

    /**
     * Atualiza os dados cadastrais do usuário (exceto e-mail, senha, foto e perfil).
     */
    static async atualizarDadosCadastrais(id, { nome, sobrenome }) {
        console.info(chalk.yellow(`✏️ Atualizando dados cadastrais do usuário ID: ${id}`));
        const db = await obterConexao();
        const query = `UPDATE usuarios SET nome = ?, sobrenome = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        await db.execute(query, [nome, sobrenome, id]);
        console.info(chalk.green(`✅ Dados cadastrais atualizados com sucesso.`));
    }

    /**
     * Atualiza o e-mail do usuário.
     */
    static async atualizarEmail(id, novoEmail) {
        console.info(chalk.yellow(`📧 Atualizando e-mail do usuário ID: ${id}`));
        const db = await obterConexao();
        const query = `UPDATE usuarios SET email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        await db.execute(query, [novoEmail, id]);
        console.info(chalk.green(`✅ E-mail atualizado com sucesso.`));
    }

    /**
     * Atualiza a senha do usuário.
     */
    static async atualizarSenha(id, novaSenha) {
        console.info(chalk.yellow(`🔑 Atualizando senha do usuário ID: ${id}`));
        const db = await obterConexao();
        const senhaCriptografada = await bcrypt.hash(novaSenha, 10);
        const query = `UPDATE usuarios SET senha = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        await db.execute(query, [senhaCriptografada, id]);
        console.info(chalk.green(`✅ Senha atualizada com sucesso.`));
    }

    /**
     * Atualiza a foto do perfil do usuário.
     */
    static async atualizarFotoPerfil(id, novaFotoPerfil) {
        console.info(chalk.yellow(`🖼️ Atualizando foto do perfil do usuário ID: ${id}`));
        const db = await obterConexao();
        const query = `UPDATE usuarios SET foto_perfil = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        await db.execute(query, [novaFotoPerfil, id]);
        console.info(chalk.green(`✅ Foto do perfil atualizada com sucesso.`));
    }

    /**
     * Busca usuário pelo id.
     * 
     */
    static async buscarPorId(idUsuario) {
        console.info(chalk.yellow(`🔍 Buscando informações do usuário ID: ${idUsuario}`));
        const db = await obterConexao();
        const query = `SELECT nome, sobrenome, email FROM usuarios WHERE id = ?`;
        const [resultado] = await db.execute(query, [idUsuario]);
    
        if (resultado.length === 0) {
            console.warn(chalk.red(`❌ Usuário com ID ${idUsuario} não encontrado.`));
            throw new Error(`Usuário com ID ${idUsuario} não encontrado.`);
        }
    
        console.info(chalk.green(`✅ Informações do usuário ID ${idUsuario} obtidas com sucesso.`));
        return resultado[0];
    }

    /**
     * Busca usuário pelo email.
     * @param {string} email - Email do usuário.
     * @returns {Usuario|null} - Retorna instância de Usuario ou null.
     */
    static async buscarPorEmail(email) {
        console.info(chalk.yellow(`🔍 Buscando usuário pelo email: ${email}`));
        const db = await obterConexao();
        const query = `SELECT id, senha FROM usuarios WHERE email = ? AND ativo = TRUE`;
        const [result] = await db.execute(query, [email]);

        if (result.length > 0) {
            console.info(chalk.green(`✅ Usuário encontrado com email: ${email}`));
            return new Usuario(result[0]);
        } else {
            console.warn(chalk.yellow(`⚠️ Nenhum usuário ativo encontrado com email: ${email}`));
            return null;
        }
    }

    /**
     * Valida a senha do usuário.
     * @param {string} senha - Senha fornecida pelo usuário.
     * @returns {boolean} - Retorna verdadeiro se a senha for válida.
     */
    async validarSenha(senha) {
        console.info(chalk.cyan(`🔑 Validando senha para o usuário ${this.email}`));
        const valida = await bcrypt.compare(senha, this.senha);

        if (valida) {
            console.info(chalk.green(`✅ Senha válida para o usuário ${this.email}`));
        } else {
            console.warn(chalk.red(`❌ Senha inválida para o usuário ${this.email}`));
        }

        return valida;
    }

    /**
     * Salva um usuário no banco de dados.
     * @param {Object} dadosUsuario - Dados do usuário.
     * @param {boolean} ativo - Define se o usuário está ativo ou não.
     * @returns {Object} - Dados do usuário criado.
     */
    static async salvar({ nome, sobrenome, email, senha, perfil, aprovadoPor }, ativo = false) {
        console.info(chalk.yellowBright(`💾 Salvando novo usuário: ${nome} ${sobrenome}`));
        const db = await obterConexao();
        
        const senhaSegura = senha.startsWith('$2b$') ? senha : await bcrypt.hash(senha, 10);
        console.info(chalk.cyan(`🔒 Senha criptografada com sucesso para o usuário ${email}`));

        const query = `
            INSERT INTO usuarios (nome, sobrenome, email, senha, perfil, aprovado_por, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await db.execute(query, [nome, sobrenome, email, senhaSegura, perfil, aprovadoPor, ativo]);
        
        console.info(chalk.greenBright(`✅ Usuário salvo com sucesso: ${nome} ${sobrenome}, ID: ${result.insertId}`));
        return { id: result.insertId, nome, sobrenome, email, perfil, aprovadoPor, ativo };
    }

    /**
     * Ativa um usuário pelo ID.
     * @param {number} id - ID do usuário a ser ativado.
     */
    static async ativar(id) {
        console.info(chalk.yellow(`🚀 Ativando usuário com ID: ${id}`));
        const db = await obterConexao();
        const query = `UPDATE usuarios SET ativo = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const [result] = await db.execute(query, [id]);
        
        if (result.affectedRows === 0) {
            console.warn(chalk.red(`❌ Usuário com ID ${id} não encontrado ou já está ativo.`));
            throw new Error('Usuário não encontrado ou já está ativo.');
        }

        console.info(chalk.greenBright(`✅ Usuário com ID ${id} ativado com sucesso.`));
        return { message: 'Usuário ativado com sucesso.', id };
    }
    
    /**
     * Inativa um usuário pelo ID.
     * @param {number} id - ID do usuário a ser inativado.
     */
    static async inativar(id) {
        console.info(chalk.yellow(`🛑 Inativando usuário com ID: ${id}`));
        const db = await obterConexao();
        const query = `UPDATE usuarios SET ativo = FALSE, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        const [result] = await db.execute(query, [id]);
        
        if (result.affectedRows === 0) {
            console.warn(chalk.red(`❌ Usuário com ID ${id} não encontrado ou já está inativo.`));
            throw new Error('Usuário não encontrado ou já está inativo.');
        }

        console.info(chalk.greenBright(`✅ Usuário com ID ${id} inativado com sucesso.`));
        return { message: 'Usuário inativado com sucesso.', id };
    }
}

module.exports = { Usuario };

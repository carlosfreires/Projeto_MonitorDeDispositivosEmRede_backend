// models/Usuario.js
/**
 * Model de domínio para Usuário.
 * Apenas representação dos dados (sem lógica de persistência).
 */
class UsuarioModel {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.nome = data.nome ?? null;
    this.sobrenome = data.sobrenome ?? null;
    this.email = data.email ?? null;
    this.senha = data.senha ?? null; // hash
    this.foto_perfil = data.foto_perfil ?? null;
    this.perfil = data.perfil ?? null;
    this.ativo = data.ativo ?? false;
    this.aprovado_por = data.aprovado_por ?? null;
    this.ultima_modificacao_por = data.ultima_modificacao_por ?? null;
    this.created_at = data.created_at ?? null;
    this.updated_at = data.updated_at ?? null;
  }
}

module.exports = UsuarioModel;

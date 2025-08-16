// models/SolicitacaoAcessoModel.js
/**
 * Model: representa uma solicitação de acesso.
 * Camada de domínio — sem SQL nem lógica de persistência.
 */
class SolicitacaoAcessoModel {
  constructor(data = {}) {
    this.id = data.id ?? null;
    this.nome = data.nome ?? null;
    this.sobrenome = data.sobrenome ?? null;
    this.email = data.email ?? null;
    // no banco a coluna é "senha" — aqui mantemos "senhaHash" para ficar explícito que é hash
    this.senhaHash = data.senhaHash ?? data.senha ?? null;
    this.motivo = data.motivo ?? null;
    this.status = data.status ?? null; // ex: 'pendente', 'aprovado', 'rejeitado'
    this.perfil_solicitado = data.perfil_solicitado ?? null;
    this.aprovado_por = data.aprovado_por ?? null;
    this.rejeitado_por = data.rejeitado_por ?? null;
    this.data_solicitacao = data.data_solicitacao ?? data.created_at ?? null;
    this.data_aprovacao = data.data_aprovacao ?? null;
    this.data_rejeicao = data.data_rejeicao ?? null;
  }
}

module.exports = SolicitacaoAcessoModel;
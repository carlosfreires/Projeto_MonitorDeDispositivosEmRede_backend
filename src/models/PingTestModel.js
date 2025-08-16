// models/PingTestModel.js
/**
 * Model que representa um registro de ping.
 * PingTestResult herda de PingTestModel e traz validações/normalizações.
 */

class PingTestModel {
  constructor({
    id = null,
    equipamento_id = null,
    status = null,
    tempo_resposta = null,
    updated_at = null
  } = {}) {
    this.id = id;
    this.equipamento_id = equipamento_id;
    this.status = status;
    this.tempo_resposta = tempo_resposta;
    this.updated_at = updated_at;
  }
}

class PingTestResult extends PingTestModel {
  /**
   * Normaliza/valida o tempo de resposta antes de persistir/usar.
   * - Valores não numéricos ou absurdos (> 9999) viram null.
   * - Converte strings numéricas para Number.
   */
  normalizarTempoResposta() {
    if (this.tempo_resposta === null || this.tempo_resposta === undefined) {
      this.tempo_resposta = null;
      return;
    }

    const v = Number(this.tempo_resposta);
    if (Number.isNaN(v) || !isFinite(v) || v > 9999) {
      this.tempo_resposta = null;
    } else {
      this.tempo_resposta = v;
    }
  }

  /**
   * Retorna payload pronto para persistência (objeto plano).
   */
  toPersistenceObject() {
    return {
      equipamento_id: this.equipamento_id,
      status: this.status,
      tempo_resposta: this.tempo_resposta
    };
  }
}

module.exports = { PingTestModel, PingTestResult };

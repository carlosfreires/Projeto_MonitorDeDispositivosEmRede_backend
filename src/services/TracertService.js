// services/TracertService.js
/**
 * Serviço para executar traceroute (tracert), consolidar e persistir resultados.
 * Padrões:
 * - logger centralizado (utils/logger)
 * - separação entre executar (sem persistência) e salvar (persistência)
 * - evitar variáveis/trechos indefinidos
 */
const Traceroute = require('nodejs-traceroute');
const logger = require('../utils/logger');
const { TracertModel } = require('../models/TracertModel');
const TracertRepository = require('../repositories/TracertRepository');
const EquipamentoService = require('./EquipamentoService');

class TracertService {
  /**
   * Executa traceroute para um destino.
   * Retorna { destino, rota } onde rota é um array de hops.
   * Parâmetros: destino (IP/host) ou equipamentoOrId (objeto ou id)
   */
  async executar({ destino, protocolo = 'ICMP', porta_tipo = null, porta = null, ttlMax = 30, tentativasPorSalto = 3, timeout = 5000 } = {}) {
    if (!destino) {
      const err = new Error('Destino é obrigatório para executar tracert.');
      err.status = 400;
      throw err;
    }

    const rota = [];
    let ipAnterior = null;

    logger.info(`Iniciando tracert para: ${destino}`);
    logger.debug(`Opções: protocolo=${protocolo}, ttlMax=${ttlMax}, tentativasPorSalto=${tentativasPorSalto}, timeout=${timeout}`);

    return new Promise((resolve, reject) => {
      let tracer;
      try {
        tracer = new Traceroute();
      } catch (err) {
        logger.error('Erro ao inicializar nodejs-traceroute:', err.message || err);
        return reject(new Error('Erro ao inicializar Traceroute.'));
      }

      // event handlers
      tracer.on('hop', (hop) => {
        // hop pode ter forma { hop: number, ip: 'x.x.x.x', rtt1, rtt2, rtt3 }
        if (!hop || hop.hop == null) return;
        // normaliza ip textual
        const ip = hop.ip || '[Timeout]';
        const item = {
          hop: hop.hop,
          ip,
          rtt1: hop.rtt1 ?? null,
          rtt2: hop.rtt2 ?? null,
          rtt3: hop.rtt3 ?? null
        };

        // evita duplicar linhas idênticas consecutivas
        if (ip !== ipAnterior) {
          rota.push(item);
          ipAnterior = ip;
        } else {
          // se já existe, podemos complementar RTTs
          const existente = rota.find(r => r.hop === hop.hop);
          if (existente) {
            existente.rtt1 = existente.rtt1 || item.rtt1;
            existente.rtt2 = existente.rtt2 || item.rtt2;
            existente.rtt3 = existente.rtt3 || item.rtt3;
          }
        }

        // se hop atingiu destino, encerramos cedo
        if (hop.ip && String(hop.ip) === String(destino)) {
          // aguarda 'done' ou resolve aqui
        }
      });

      tracer.on('done', () => {
        logger.info('Traceroute finalizado (evento done).');
        resolve({ destino, rota });
      });

      tracer.on('error', (err) => {
        logger.warn('Evento de erro no traceroute:', err && err.message ? err.message : err);
        // Em erro, retornamos rota parcial para diagnóstico
        resolve({ destino, rota, erro: err && err.message ? err.message : 'Erro no traceroute' });
      });

      // Executa o trace; nodejs-traceroute usa trace(destino)
      try {
        tracer.trace(destino);
        // Não há timeout built-in no nodejs-traceroute; adicionamos fallback
        setTimeout(() => {
          logger.warn(`Timeout global atingido para traceroute (${timeout}ms). Retornando rota parcial.`);
          resolve({ destino, rota, erro: `Timeout após ${timeout}ms` });
        }, timeout);
      } catch (err) {
        logger.error('Erro ao iniciar traceroute:', err.message || err);
        reject(new Error('Erro ao executar Tracert.'));
      }
    });
  }

  /**
   * Consolida um conjunto de tentativas (lista de hops) em uma rota única.
   */
  consolidarResultados(tentativas) {
    logger.info('Consolidando resultados de tracert...');
    const rotaConsolidada = [];

    (tentativas || []).forEach(tentativa => {
      if (!tentativa || tentativa.hop == null) return;
      const { hop, ip, rtt1, rtt2, rtt3, erro } = tentativa;
      const existente = rotaConsolidada.find(r => r.hop === hop);
      if (!existente) {
        rotaConsolidada.push({ hop, ip, rtt1, rtt2, rtt3, erro });
      } else {
        existente.rtt1 = existente.rtt1 || rtt1;
        existente.rtt2 = existente.rtt2 || rtt2;
        existente.rtt3 = existente.rtt3 || rtt3;
        existente.erro = existente.erro || erro;
        existente.ip = existente.ip || ip;
      }
    });

    logger.success('Consolidação concluída.');
    return rotaConsolidada;
  }

  /**
   * Persiste um Tracert (upsert).
   */
  async salvar(tracert) {
    logger.info(`Persistindo tracert para equipamento ${tracert.equipamento_id}...`);
    try {
      const resultado = await TracertRepository.upsert(tracert.toPersistenceObject ? tracert.toPersistenceObject() : tracert);
      logger.success('Tracert persistido com sucesso.');
      return resultado;
    } catch (err) {
      logger.error('Erro ao persistir tracert:', err.message || err);
      throw err;
    }
  }

  /**
   * Executa tracert para múltiplos equipamentos e persiste resultados.
   */
  async executarETPersistirParaTodos(equipamentos, options = {}) {
    if (!Array.isArray(equipamentos)) equipamentos = [equipamentos];
    logger.info(`Executando tracert em lote para ${equipamentos.length} equipamentos.`);

    const tasks = equipamentos.map(async (eq) => {
      try {
        // eq pode ser id ou objeto; obter objeto completo se necessário
        let equipamento = eq;
        if (!eq || !eq.ip || !eq.id) {
          equipamento = await EquipamentoService.buscarPorId(eq);
          if (!equipamento) {
            logger.warn(`Equipamento não encontrado: ${JSON.stringify(eq)}`);
            return { ok: false, equipamento: eq, error: 'Equipamento não encontrado' };
          }
        }

        const execResult = await this.executar({ destino: equipamento.ip, ...options });
        const rotaConsolidada = this.consolidarResultados(execResult.rota || []);
        const tracert = new TracertModel({
          equipamento_id: equipamento.id,
          protocolo: options.protocolo || 'ICMP',
          porta_tipo: options.porta_tipo || null,
          porta: options.porta || null,
          rota: rotaConsolidada,
          updated_at: new Date()
        });

        await this.salvar(tracert);
        return { ok: true, result: tracert };
      } catch (err) {
        logger.warn(`Falha no tracert para equipamento ${eq && eq.id ? eq.id : JSON.stringify(eq)}:`, err.message || err);
        return { ok: false, equipamento: eq, error: err.message || err };
      }
    });

    const results = await Promise.all(tasks);
    const total = results.length;
    const success = results.filter(r => r.ok).length;
    const failed = total - success;

    logger.success(`Tracert em lote finalizado. total=${total} sucesso=${success} falha=${failed}`);
    return { total, success, failed, details: results };
  }

  /**
   * Lista todos os registros de tracert.
   */
  async listarTodos() {
    logger.info('Listando todos os registros de Tracert...');
    try {
      const rows = await TracertRepository.findAll();
      logger.success(`${rows.length} registros de Tracert encontrados.`);
      return rows;
    } catch (err) {
      logger.error('Erro ao listar registros de Tracert:', err.message || err);
      throw err;
    }
  }

  /**
   * Lista tracerts filtrados por equipamentos (array ou single id).
   */
  async listarPorEquipamentos(equipamentosIds) {
    logger.info('Listando Tracerts por equipamentos...');
    if (!equipamentosIds || (Array.isArray(equipamentosIds) && equipamentosIds.length === 0)) {
      const err = new Error('Nenhum ID de equipamento informado');
      err.status = 400;
      logger.error(err.message);
      throw err;
    }

    try {
      const rows = await TracertRepository.findByEquipamentoIds(equipamentosIds);
      logger.success(`${rows.length} registros de Tracert encontrados para os equipamentos informados.`);
      return rows;
    } catch (err) {
      logger.error('Erro ao listar Tracerts por equipamentos:', err.message || err);
      throw err;
    }
  }
}

module.exports = new TracertService();

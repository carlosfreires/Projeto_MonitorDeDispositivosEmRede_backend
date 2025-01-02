const { obterConexao } = require('../database/conectadb');
const net = require('net');
const chalk = require('chalk');

class Telnet {
  constructor({ id, equipamento_id, status, mensagem, updated_at }) {
    this.id = id;
    this.equipamento_id = equipamento_id;
    this.status = status;
    this.mensagem = mensagem;
    this.updated_at = updated_at;
  }

  /**
   * Salva ou atualiza o resultado do teste Telnet no banco de dados.
   * @returns {Promise<void>}
   */
  async salvar() {
    try {
      console.info(chalk.blue(`💾 Salvando resultado do teste Telnet para equipamento ID: ${this.equipamento_id}`));
      const db = await obterConexao();
      const query = `
        INSERT INTO telnet (equipamento_id, status, mensagem) 
        VALUES (?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
          status = VALUES(status), 
          mensagem = VALUES(mensagem), 
          updated_at = CURRENT_TIMESTAMP
      `;
      await db.execute(query, [this.equipamento_id, this.status, this.mensagem]);
      console.info(chalk.green(`✅ Resultado do teste Telnet salvo com sucesso para equipamento ID: ${this.equipamento_id}`));
    } catch (erro) {
      console.error(chalk.red(`❌ Erro ao salvar resultado do teste Telnet: ${erro.message}`));
      throw erro;
    }
  }

  /**
   * Realiza o teste Telnet em um equipamento.
   * @param {Object} equipamento Objeto contendo informações do equipamento.
   * @returns {TelnetTest} Instância com o resultado do teste.
   */
  static async realizarTeste(equipamento) {
    console.info(chalk.blue(`🔍 Iniciando teste Telnet para o equipamento: ${equipamento.nome} (IP: ${equipamento.ip}, Porta: ${equipamento.porta || 23})`));
    const resultado = await new Promise((resolve) => {
      const cliente = net.createConnection(
        { host: equipamento.ip, port: equipamento.porta || 23 },
        () => {
          console.info(chalk.green(`✅ Conexão bem-sucedida com o equipamento: ${equipamento.nome} (IP: ${equipamento.ip}, Porta: ${equipamento.porta || 23})`));
          resolve({ status: 'ativo', mensagem: 'Conexão bem-sucedida.' });
          cliente.end();
        }
      );

      cliente.on('error', (err) => {
        console.warn(chalk.yellow(`⚠️ Erro na conexão com o equipamento: ${equipamento.nome} - ${err.message}`));
        resolve({ status: 'inativo', mensagem: `Erro: ${err.message}` });
      });

      cliente.on('timeout', () => {
        console.warn(chalk.yellow(`⏳ Timeout na conexão com o equipamento: ${equipamento.nome}`));
        resolve({ status: 'inativo', mensagem: 'Timeout na conexão.' });
      });
    });

    console.info(chalk.green(`🔄 Resultado do teste Telnet: ${resultado.status} - ${resultado.mensagem}`));
    return new Telnet({
      equipamento_id: equipamento.id,
      status: resultado.status,
      mensagem: resultado.mensagem,
    });
  }

  /**
   * Lista todos os testes de Telnet.
   * @returns {Promise<Array>} Lista de testes Telnet.
   */
  static async listarTodos() {
    try {
      console.info(chalk.blue(`📋 Listando todos os testes Telnet...`));
      const db = await obterConexao();
      const query = `
        SELECT t.*, e.nome AS equipamento_nome, e.ip AS equipamento_ip, e.porta AS equipamento_porta
        FROM telnet t
        INNER JOIN equipamentos e ON t.equipamento_id = e.id
      `;
      const [resultados] = await db.query(query);
      console.info(chalk.green(`✅ ${resultados.length} resultados encontrados.`));
      return resultados;
    } catch (erro) {
      console.error(chalk.red(`❌ Erro ao listar todos os testes Telnet: ${erro.message}`));
      throw erro;
    }
  }

  /**
   * Lista os testes de Telnet para equipamentos fornecidos.
   * @param {Array} equipamentos Lista de IDs de equipamentos.
   * @returns {Promise<Array>} Resultados para os IDs fornecidos.
   */
  static async listarPorEquipamentos(equipamentos) {
    try {
      console.info(chalk.blue(`📋 Listando testes Telnet para equipamentos: [${equipamentos.join(', ')}]`));
      const db = await obterConexao();
      const query = `
        SELECT t.*, e.nome AS equipamento_nome, e.ip AS equipamento_ip, e.porta AS equipamento_porta
        FROM telnet t
        INNER JOIN equipamentos e ON t.equipamento_id = e.id
        WHERE e.id IN (?)
      `;
      const [resultados] = await db.query(query, [equipamentos]);
      console.info(chalk.green(`✅ ${resultados.length} resultados encontrados para os IDs fornecidos.`));
      return resultados;
    } catch (erro) {
      console.error(chalk.red(`❌ Erro ao listar testes Telnet por equipamentos: ${erro.message}`));
      throw erro;
    }
  }
}

module.exports = { Telnet };
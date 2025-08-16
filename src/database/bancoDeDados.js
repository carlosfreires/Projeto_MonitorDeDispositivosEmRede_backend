const mysql = require('mysql2/promise');
require('dotenv').config();
const logger = require('../utils/logger');

class BancoDeDados {
  #pool = null;

  #inicializaPool() {
    try {
      if (!this.#pool) {
        this.#pool = mysql.createPool({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
          port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
          waitForConnections: true,
          connectionLimit: 30,
          queueLimit: 0
        });
        logger.success('Pool de conexões inicializado com sucesso.');
      }
    } catch (err) {
      logger.error('Erro ao inicializar o pool de conexões:', err.message || err);
      // Em ambiente de produção você pode querer lançar em vez de process.exit
      process.exit(1);
    }
  }

  /**
   * Obtém uma conexão do pool (promessa).
   * Inicializa o pool se necessário.
   * @returns {Promise<import('mysql2/promise').PoolConnection>}
   */
  async obterConexao() {
    try {
      if (!this.#pool) this.#inicializaPool();
      const conexao = await this.#pool.getConnection();
      logger.info('Conexão obtida do pool.');
      return conexao;
    } catch (err) {
      logger.error('Erro ao obter conexão do pool:', err.message || err);
      throw err;
    }
  }
}

const instancia = new BancoDeDados();
// Exporta função bound para facilitar import por desestruturação
module.exports = {
  obterConexao: instancia.obterConexao.bind(instancia),
  __internal: instancia // caso precise acessar internamente
};
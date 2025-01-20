const mysql = require('mysql2/promise');
require('dotenv').config(); // Carrega variáveis de ambiente
const chalk = require('chalk');

let pool; // Armazena o pool de conexões

// Função para inicializar o pool
function inicializaPool() {
  try {
    if (!pool) {
      pool = mysql.createPool({
        host: process.env.DB_HOST,      // Host do banco de dados
        user: process.env.DB_USER,      // Usuário do banco de dados
        password: process.env.DB_PASSWORD, // Senha do banco de dados
        database: process.env.DB_NAME,  // Nome do banco de dados
        port: process.env.DB_PORT || 3306,  // Porta do banco de dados (3306 por padrão)
        waitForConnections: true,       // Aguarda conexões disponíveis
        connectionLimit: 30,            // Número máximo de conexões no pool
        queueLimit: 0,                  // Sem limite para fila de requisições
      });
      console.log(chalk.green('✅ Pool de conexões inicializado com sucesso!'));
    }
  } catch (erro) {
    console.error(chalk.red('🚨 Erro ao inicializar o pool de conexões:'), erro.message);
    process.exit(1); // Encerra a aplicação em caso de erro crítico
  }
}

// Função para obter uma conexão do pool
async function obterConexao() {
  try {
    if (!pool) {
      inicializaPool();
    }
    const conexao = await pool.getConnection();
    console.info(chalk.cyan('🔌 Nova conexão obtida do pool.'));
    return conexao;
  } catch (erro) {
    console.error(chalk.red('🚨 Erro ao obter conexão do pool:'), erro.message);
    throw erro;
  }
}

module.exports = { inicializaPool, obterConexao };
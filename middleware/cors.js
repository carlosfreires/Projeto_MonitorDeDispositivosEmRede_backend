const cors = require('cors');

// Configuração do CORS
const corsMiddleware = cors(); // Sem restrições (((NÃO RECOMENDADO)))
//const corsMiddleware = cors({ origin: 'http://192.168.1.11:4200' }); // restrito a apenas 1 cliente

module.exports = corsMiddleware;
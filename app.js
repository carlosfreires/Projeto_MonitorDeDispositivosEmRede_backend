require('dotenv').config();
const express = require('express');
const { inicializaPool } = require('./database/conectadb');
const chalk = require('chalk');
const { autenticar } = require('./middleware/auth');
const corsMiddleware = require('./middleware/cors');
const jsonParser = require('./middleware/json-parser');
const tratamentoDeErros = require('./middleware/tratamento-erro');

// Instância do app
const app = express();
const PORT = process.env.SERVER_PORT || 2200;

// Inicializa o pool de conexões ao iniciar o servidor
(async () => {
    try {
        console.info(chalk.blue('🔄 Inicializando o pool de conexões ao banco de dados...'));
        inicializaPool();
        console.log(chalk.green('✅ Pool de conexões inicializado com sucesso!'));
        console.log(chalk.blue('🌐 Servidor pronto para processar requisições.'));
    } catch (erro) {
        console.error(chalk.red('🚨 Falha ao inicializar o pool de conexões:'), erro.message);
        process.exit(1); // Encerra a aplicação em caso de erro crítico
    }
})();

// Middlewares globais
console.info(chalk.yellow('🔧 Configurando middlewares globais...'));
app.use(corsMiddleware); // Configuração de CORS
console.log(chalk.green('✅ Middleware de CORS configurado.'));
app.use(jsonParser); // Middleware para interpretar JSON
console.log(chalk.green('✅ Middleware de JSON configurado.'));

// Rotas públicas
console.info(chalk.yellow('🚪 Configurando rotas públicas...'));
app.use('/login', require('./routes-services/usuario/login/login-routes/login-route'));
console.log(chalk.green('✅ Rota pública "/login" configurada.'));
app.use('/solicitarAcesso', require('./routes-services/usuario/solicitar_acesso/solicitar_acesso-routes/solicitar-acesso-route'));
console.log(chalk.green('✅ Rota pública "/solicitarAcesso" configurada.'));

// Rotas protegidas (necessitam de autenticação)
console.info(chalk.yellow('🔒 Configurando rotas protegidas...'));
// Usuário
app.use('/ativarUsuario', autenticar, require('./routes-services/usuario/ativar_usuario/ativar-usuario-routes/ativar-usuario-route'));
console.log(chalk.green('✅ Rota protegida "/ativarUsuario" configurada.'));
app.use('/inativarUsuario', autenticar, require('./routes-services/usuario/inativar_usuario/inativar_usuario-routes/inativar-usuario-route'));
console.log(chalk.green('✅ Rota protegida "/inativarUsuario" configurada.'));
app.use('/logout', autenticar, require('./routes-services/usuario/logout/logout-routes/logout-route'));
console.log(chalk.green('✅ Rota protegida "/logout" configurada.'));
app.use('/cadastrarUsuario', autenticar, require('./routes-services/usuario/cadastrar_usuario/cadastrar_usuario-routes/cadastrar-usuario-route'));
console.log(chalk.green('✅ Rota protegida "/cadastrarUsuario" configurada.'));
app.use('/aprovarSolicitacaoUsuario', autenticar, require('./routes-services/usuario/aprovar_acesso/aprovar_acesso-routes/aprovar-solicitacao-route'));
console.log(chalk.green('✅ Rota protegida "/aprovarSolicitacaoUsuario" configurada.'));
app.use('/rejeitarSolicitacaoUsuario', autenticar, require('./routes-services/usuario/negar_acesso/negar_acesso-routes/rejeitar-solicitacao-route'));
console.log(chalk.green('✅ Rota protegida "/rejeitarSolicitacaoUsuario" configurada.'));

app.use('/atualizar-senha', autenticar, require('./routes-services/usuario/atualiza_usuario/atualiza_senha/atualiza_senha-routes/atualiza-senha-route'));
console.log(chalk.green('✅ Rota protegida "/atualizar-senha" configurada.'));
app.use('/solicitar-atualizacao-perfil', autenticar, require('./routes-services/usuario/atualiza_usuario/atualiza_perfil/atualiza_perfil-routes/atualiza-perfil-route'));
console.log(chalk.green('✅ Rota protegida "/solicitar-atualizacao-perfil" configurada.'));
app.use('/dados-cadastrais', autenticar, require('./routes-services/usuario/atualiza_usuario/atualiza_nome/atualiza_nome-routes/atualiza-nome-route'));
console.log(chalk.green('✅ Rota protegida "/dados-cadastrais" configurada.'));
app.use('/foto-perfil', autenticar, require('./routes-services/usuario/atualiza_usuario/atualiza_foto/atualiza_foto-routes/atualiza-foto-route'));
console.log(chalk.green('✅ Rota protegida "/foto-perfil" configurada.'));
app.use('/email', autenticar, require('./routes-services/usuario/atualiza_usuario/atualiza_email/atualiza_email-routes/atualiza-email-route'));
console.log(chalk.green('✅ Rota protegida "/email" configurada.'));


// Equipamentos
app.use('/cadastrarEquipamento', autenticar, require('./routes-services/equipamentos/cadastrar_equipamento/cadastrar_equipamento-routes/cadastrar-equipamento-route'));
console.log(chalk.green('✅ Rota protegida "/cadastrarEquipamento" configurada.'));
app.use('/atualizarEquipamento', autenticar, require('./routes-services/equipamentos/atualizar_equipamento/atualizar_equipamento-routes/atualizar-equipamento-route'));
console.log(chalk.green('✅ Rota protegida "/atualizarEquipamento" configurada.'));
app.use('/deletarEquipamento', autenticar, require('./routes-services/equipamentos/deletar_equipamento/deletar_equipamento-routes/deletar-equipamento-route'));
console.log(chalk.green('✅ Rota protegida "/deletarEquipamento" configurada.'));
app.use('/listarEquipamentos', autenticar, require('./routes-services/equipamentos/listar_equipamentos/listar_equipamentos-routes/listar-equipamentos-route'));
console.log(chalk.green('✅ Rota protegida "/listarEquipamentos" configurada.'));

// Teste de ping
app.use('/pingTestEquipamento', autenticar, require('./routes-services/acoes_monitoramento/teste_ping/teste_ping-routes/pingar-equipamento-route'));
console.log(chalk.green('✅ Rota protegida "/pingTestEquipamento" configurada.'));
app.use('/pingTestTodos', autenticar, require('./routes-services/acoes_monitoramento/teste_ping/teste_ping-routes/pingar-todos-route'));
console.log(chalk.green('✅ Rota protegida "/pingTestTodos" configurada.'));
app.use('/listapingTestTodos', autenticar, require('./routes-services/acoes_monitoramento/teste_ping/teste_ping-routes/listarPingTest-todos-route'));
console.log(chalk.green('✅ Rota protegida "/listapingTestTodos" configurada.'));
app.use('/listapingTestEquipamentos', autenticar, require('./routes-services/acoes_monitoramento/teste_ping/teste_ping-routes/listarPingTest-equipamentos-route'));
console.log(chalk.green('✅ Rota protegida "/listapingTestEquipamentos" configurada.'));

// Telnet
app.use('/testarTelnetTodos', autenticar, require('./routes-services/acoes_monitoramento/testar_telnet/testar_telnet-routes/conectaTelnet-todos-route'));
console.log(chalk.green('✅ Rota protegida "/testarTelnetTodos" configurada.'));
app.use('/testarTelnetEquipamento', autenticar, require('./routes-services/acoes_monitoramento/testar_telnet/testar_telnet-routes/conectaTelnet-equipamento-route'));
console.log(chalk.green('✅ Rota protegida "/testarTelnetEquipamento" configurada.'));
app.use('/listarTelnetEquipamento', autenticar, require('./routes-services/acoes_monitoramento/testar_telnet/testar_telnet-routes/listarTelnetTest-equipamento-route'));
console.log(chalk.green('✅ Rota protegida "/listarTelnetEquipamento" configurada.'));
app.use('/listarTelnetTodos', autenticar, require('./routes-services/acoes_monitoramento/testar_telnet/testar_telnet-routes/listarTelnetTest-todos-route'));
console.log(chalk.green('✅ Rota protegida "/listarTelnetTodos" configurada.'));

// Tracert
app.use('/execTracertEquipamento',autenticar, require('./routes-services/acoes_monitoramento/executar_tracert/executar_tracert-routes/executar-tracert-equipamento-route'));
console.log(chalk.green('✅ Rota protegida "/execTracertEquipamento" configurada.'));
app.use('/listaTracertTodos', autenticar, require('./routes-services/acoes_monitoramento/executar_tracert/executar_tracert-routes/listarTracert-todos-route'));
console.log(chalk.green('✅ Rota protegida "/execTracertTodos" configurada.'));
app.use('/listaTracertEquipamentos', autenticar, require('./routes-services/acoes_monitoramento/executar_tracert/executar_tracert-routes/listarTracert-equipamentos-route'));
console.log(chalk.green('✅ Rota protegida "listaTracertEquipamentos" configurada.'));

// Monitoramento
app.use('/monitoramento', autenticar, require('./routes-services/exec_monitoramento/exec_monitoramento-routes/executar-monitoramento-route'));
console.log(chalk.green('✅ Rota protegida "/monitoramento" configurada.'));


// Middleware de erros
app.use(tratamentoDeErros);
console.log(chalk.green('✅ Middleware de tratamento de erros configurado.'));

// Porta
app.listen(PORT, () => console.info(chalk.blueBright(`🚀 Servidor rodando na porta ${PORT}`)));
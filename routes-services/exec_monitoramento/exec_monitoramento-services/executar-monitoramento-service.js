const chalk = require('chalk');
const { LogMonitoramento } = require('../../../models/LogMonitoramento');
const { testarTodosEquipamentos } = require('../../acoes_monitoramento/teste_ping/teste_ping-services/pingar-todos-service');
const { testarTodosEquipamentosTelnet } = require('../../acoes_monitoramento/testar_telnet/testar_telnet-services/conectaTelnet-todos-service');

/**
 * Sistema de monitoramento
 */
let intervalId = null;  // Para armazenar a referência ao intervalo, para podermos cancelar

async function executarConsolidacaoAutomatica() {
    console.info('⏰ Iniciando o processo de verificação e consolidação.');

    try {
        // 1 etapa, testamos todos os equipamentos via Ping
        console.info('🌐 Iniciando testes de Ping em todos os equipamentos...');
        await testarTodosEquipamentos();
        console.info('✅ Testes de Ping concluídos.');

        // 2 etapa, testamos todos os equipamentos via Telnet
        console.info('🔌 Iniciando testes de Telnet em todos os equipamentos...');
        await testarTodosEquipamentosTelnet();
        console.info('✅ Testes de Telnet concluídos.');

        // Por fim, consolida os logs após os testes
        console.info('📝 Iniciando consolidação dos logs...');
        await LogMonitoramento.consolidarLogs();
        console.info('✅ Consolidação de logs concluída.');
    } catch (erro) {
        console.error('🚨 Erro no processo de consolidação automática:', erro.message);
    }
}

/**
 * Inicia o agendamento com intervalo definido pelo usuario
 */
function iniciarAgendamento(intervaloEmMinutos = 3) {
    // Caso já exista um agendamento, cancela o agendamento anterior
    if (intervalId !== null) {
        console.info(chalk.yellow('⏸️ Agendamento anterior cancelado.'));
        clearInterval(intervalId);
    }

    // Configura o intervalo em milissegundos
    const intervaloEmMs = intervaloEmMinutos * 60 * 1000;
    console.log(chalk.cyan(`🔧 Agendamento iniciado a cada ${intervaloEmMinutos} minutos.`));

    // Inicia o novo agendamento
    intervalId = setInterval(async () => {
        console.info('⏰ Iniciando o ciclo de consolidação automática de logs.');
        await executarConsolidacaoAutomatica();
    }, intervaloEmMs);
}

/**
 * Parar o agendamento
 */
function pararAgendamento() {
    if (intervalId !== null) {
        clearInterval(intervalId);
        console.info(chalk.red('🚨 Agendamento interrompido.'));
    } else {
        console.info(chalk.yellow('⚠️ Nenhum agendamento ativo para parar.'));
    }
}

module.exports = { iniciarAgendamento, pararAgendamento };
const { Tracert } = require('../../../../models/Tracert');
const { Equipamento } = require('../../../../models/Equipamento');
const { TRACERT_CONFIGURACOES_PADRAO } = require('../../../../config');
const chalk = require('chalk');

/**
* Executa Tracert para equipamento específico
*/
async function executarTracert(equipamentoId) {
    console.info(chalk.blue('🔄 Iniciando execução do Tracert...'));

    const equipamento = await Equipamento.buscarPorId(equipamentoId);
    if (!equipamento) {
        console.error(chalk.red(`❌ Equipamento com ID ${equipamentoId} não encontrado!`));
        throw new Error('Equipamento não encontrado');
    }

    console.info(chalk.green(`✅ Equipamento encontrado: ${equipamento.nome}, IP: ${equipamento.ip}`));

    const configuracoes = {
        ...TRACERT_CONFIGURACOES_PADRAO,
        destino: equipamento.ip,
    };

    console.info(chalk.yellow(`🔧 Configurando Tracert com destino para IP: ${equipamento.ip}`));

    // Executa o Tracert
    let resultado;
    try {
        resultado = await Tracert.executar(configuracoes);
        console.info(chalk.green('✅ Tracert executado com sucesso.'));
    } catch (erro) {
        console.error(chalk.red(`❌ Erro ao executar Tracert: ${erro.message}`));
        throw erro;
    }

    // Consolida os resultados da rota
    const rotaConsolidada = resultado.rota.map((hop) => ({
        hop: hop.hop,
        ip: hop.ip,
        rtt: hop.rtt || '*ms',
        erro: hop.erro || null,
    }));

    console.info(chalk.cyan(`🔍 Rota consolidada: ${JSON.stringify(rotaConsolidada, null, 2)}`));

    // Cria o objeto Tracert
    const tracert = new Tracert({
        equipamento_id: equipamentoId,
        protocolo: configuracoes.protocolo,
        porta_tipo: configuracoes.porta_tipo,
        porta: configuracoes.porta,
        rota: rotaConsolidada,
    });

    // Salva o log no banco
    try {
        await tracert.salvar();
        console.info(chalk.green('✅ Log de Tracert salvo no banco com sucesso.'));
    } catch (erro) {
        console.error(chalk.red(`❌ Erro ao salvar Tracert no banco: ${erro.message}`));
    }

    return {
        destino: resultado.destino,
        protocolo: configuracoes.protocolo,
        ttlMax: configuracoes.ttlMax,
        tentativasPorSalto: configuracoes.tentativasPorSalto,
        timeout: configuracoes.timeout,
        porta: configuracoes.porta,
        porta_tipo: configuracoes.porta_tipo,
        rota: rotaConsolidada,
        erro: resultado.erro || null,
    };
}

module.exports = { executarTracert };
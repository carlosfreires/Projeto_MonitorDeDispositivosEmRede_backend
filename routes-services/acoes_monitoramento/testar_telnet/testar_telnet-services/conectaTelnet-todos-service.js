const { Telnet } = require('../../../../models/Telnet');
const { Equipamento } = require('../../../../models/Equipamento');
const chalk = require('chalk');

/**
* Testa todos os equipamentos
*/
async function testarTodosEquipamentosTelnet() {
    try {
        console.info(chalk.blue('🔍 Iniciando o teste de Telnet em todos os equipamentos ativos...'));

        const equipamentos = await Equipamento.listarAtivos();
        
        if (!equipamentos || equipamentos.length === 0) {
            console.warn(chalk.yellow('⚠️ Nenhum equipamento ativo encontrado.'));
            return [];
        }

        console.info(chalk.blue(`🔢 Encontrados ${equipamentos.length} equipamentos ativos para testar.`));

        const resultados = await Promise.allSettled(
            equipamentos.map(async (equipamento) => {
                try {
                    console.info(chalk.green(`🔄 Iniciando teste Telnet no equipamento ${equipamento.id}...`));
                    const teste = await Telnet.realizarTeste(equipamento);
                    await teste.salvar();
                    console.log(chalk.green(`✅ Teste de Telnet bem-sucedido no equipamento ${equipamento.id}.`));
                    return { equipamento, status: 'sucesso', teste };
                } catch (erro) {
                    console.error(chalk.red(`❌ Erro ao testar Telnet no equipamento ${equipamento.id}: ${erro.message}`));
                    return { equipamento, status: 'falha', erro: erro.message };
                }
            })
        );

        console.log(chalk.green(`✅ Todos os testes foram realizados. ${resultados.length} testes concluídos.`));

        return resultados;
    } catch (erro) {
        console.error(chalk.red(`❌ Erro ao testar todos os equipamentos via Telnet: ${erro.message}`));
        throw erro;
    }
}

module.exports = { testarTodosEquipamentosTelnet };
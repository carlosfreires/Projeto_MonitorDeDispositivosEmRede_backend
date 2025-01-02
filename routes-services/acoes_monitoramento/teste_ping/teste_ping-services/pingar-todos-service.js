const { PingTest } = require('../../../../models/PingTest');
const { Equipamento } = require('../../../../models/Equipamento');
const chalk = require('chalk');

/**
 * Realiza o teste de ping em todos os equipamentos ativos.
 * @returns {Promise<Array>} Resultados dos testes.
 */
async function testarTodosEquipamentos() {
    console.info(chalk.blue('🔄 Iniciando o teste de ping em todos os equipamentos ativos...'));

    try {
        // Recupera todos os equipamentos ativos
        const equipamentos = await Equipamento.listarAtivos();
        console.log(chalk.cyan(`📝 Equipamentos ativos encontrados: ${equipamentos.length}`));

        // Realiza o teste de ping em todos os equipamentos
        const testes = await PingTest.realizarTesteAll(equipamentos);
        console.log(chalk.yellow(`⚡ Testes de ping realizados para todos os equipamentos.`));

        // Salva todos os resultados dos testes
        await Promise.all(testes.map(teste => teste.salvar()));
        console.info(chalk.green(`✅ Todos os testes de ping foram salvos com sucesso!`));

        return testes;
    } catch (erro) {
        console.error(chalk.red(`❌ Erro ao testar todos os equipamentos: ${erro.message}`));
        throw erro;
    }
}

module.exports = { testarTodosEquipamentos };
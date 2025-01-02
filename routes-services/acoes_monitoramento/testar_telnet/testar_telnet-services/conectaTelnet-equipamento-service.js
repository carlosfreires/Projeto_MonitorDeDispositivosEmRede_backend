const { Telnet } = require('../../../../models/Telnet');
const { Equipamento } = require('../../../../models/Equipamento');
const chalk = require('chalk');

/**
 * Realiza o teste Telnet para um equipamento específico.
 * @param {number|string} id ID do equipamento.
 * @returns {Promise<Object>} Resultado do teste.
 */
async function testarTelnet(id) {
    try {
        console.info(chalk.blue(`🔍 Iniciando o teste Telnet para o equipamento ID ${id}...`));

        const equipamento = await Equipamento.buscarPorId(id);

        if (!equipamento) {
            console.error(chalk.red(`❌ Equipamento com ID ${id} não encontrado ou inativo.`));
            throw new Error(`Equipamento com ID ${id} não encontrado ou inativo.`);
        }

        console.info(chalk.green(`✅ Equipamento com ID ${id} encontrado. Iniciando o teste Telnet...`));

        try {
            const teste = await Telnet.realizarTeste(equipamento);
            await teste.salvar();
            console.log(chalk.green(`✅ Teste Telnet realizado com sucesso para o equipamento ID ${id}.`));
            return { equipamento, status: 'sucesso', teste };
        } catch (erro) {
            console.error(chalk.red(`❌ Erro ao testar Telnet para o equipamento ID ${id}: ${erro.message}`));
            return { equipamento, status: 'falha', erro: erro.message };
        }
    } catch (erro) {
        console.error(chalk.red(`❌ Erro ao tentar testar Telnet para o equipamento ID ${id}: ${erro.message}`));
        throw erro;
    }
}

module.exports = { testarTelnet };
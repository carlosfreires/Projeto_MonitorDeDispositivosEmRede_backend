const { Equipamento } = require('../../../../models/Equipamento');
const chalk = require('chalk');

/**
 * Atualizar os dados de um equipamento
 */
async function atualizarEquipamento(id, { nome, descricao, mac, ip, porta, ativo, atualizado_por }) {
    console.info(chalk.blue(`🔄 Iniciando atualização do equipamento com ID: ${id}...`));

    try {
        console.log(chalk.cyan(`📝 Dados recebidos para atualização:`, { nome, descricao, mac, ip, porta, ativo, atualizado_por }));

        const resultado = await Equipamento.atualizar(id, {
            nome, descricao, mac, ip, porta, ativo, atualizado_por
        });

        console.log(chalk.green(`✅ Equipamento com ID ${id} atualizado com sucesso!`));

        return resultado;
    } catch (erro) {
        console.error(chalk.red(`❌ Erro no serviço de atualização de equipamento com ID ${id}: ${erro.message}`));
        throw new Error('Erro no serviço de atualização de equipamento.');
    }
}

module.exports = { atualizarEquipamento };
const chalk = require('chalk');
const { Equipamento } = require('../../../../models/Equipamento');

/**
 * Lista equipamentos.
 */
async function listarEquipamentos() {
    console.info(chalk.blue('🚀 Função listarEquipamentos chamada.'));

    try {
        console.info(chalk.cyan('🔍 Chamando o método listarTodos no modelo Equipamento.'));
        const equipamentos = await Equipamento.listarTodos();
        console.log(chalk.green(`✅ Equipamentos listados com sucesso. Total: ${equipamentos.length}`));
        return equipamentos;
    } catch (error) {
        console.error(chalk.red(`❌ Erro ao listar equipamentos: ${error.message}`));
        throw new Error('Erro ao listar equipamentos: ' + error.message);
    }
}

module.exports = { listarEquipamentos };
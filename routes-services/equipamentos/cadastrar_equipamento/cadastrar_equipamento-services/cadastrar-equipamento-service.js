const { Equipamento } = require('../../../../models/Equipamento');
const chalk = require('chalk');

/**
 * Cadastrar novo equipamento
 */
async function cadastrarEquipamento({ nome, descricao, mac, ip, porta, criado_por }) {
    console.info(chalk.blue('🔧 Iniciando o cadastro de um novo equipamento...'));

    try {
        console.log(chalk.cyan(`📋 Dados recebidos: 
        Nome: ${nome}, 
        Descrição: ${descricao}, 
        MAC: ${mac}, 
        IP: ${ip}, 
        Porta: ${porta}, 
        Criado por: ${criado_por}`));

        const resultado = await Equipamento.cadastrar({
            nome,
            descricao,
            mac,
            ip,
            porta,
            criado_por
        });

        console.log(chalk.green('✅ Equipamento cadastrado com sucesso!'));
        console.info(chalk.green(`📦 ID do equipamento: ${resultado.id}`));
        
        // Retorna o resultado da operação, contendo a mensagem e o id do equipamento
        return resultado;
    } catch (erro) {
        console.error(chalk.red(`❌ Erro no serviço de cadastro de equipamento: ${erro.message}`));
        throw new Error('Erro no serviço de cadastro de equipamento.');
    }
}

module.exports = { cadastrarEquipamento };
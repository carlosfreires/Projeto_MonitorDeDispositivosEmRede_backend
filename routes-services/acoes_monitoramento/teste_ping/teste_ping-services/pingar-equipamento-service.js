const { PingTest } = require('../../../../models/PingTest');
const { Equipamento } = require('../../../../models/Equipamento');
const chalk = require('chalk');

/**
 * Realiza o teste de ping para um equipamento.
 * @param {number|string} id ID do equipamento.
 * @returns {Promise<Object>} Resultado do teste.
 */
async function realizarTestePing(id) {
  console.info(chalk.blue(`🔍 Iniciando o teste de ping para o equipamento com ID: ${id}...`));

  try {
    // Recupera o equipamento pelo ID
    const equipamento = await Equipamento.buscarPorId(id);

    if (!equipamento) {
      console.error(chalk.red(`❌ Equipamento com ID ${id} não encontrado ou inativo.`));
      throw new Error(`Equipamento com ID ${id} não encontrado ou inativo.`);
    }

    console.log(chalk.green(`✅ Equipamento encontrado: ${equipamento.nome} (${equipamento.id})`));

    // Realiza o teste de ping no equipamento
    const teste = await PingTest.realizarTeste(equipamento);
    console.log(chalk.cyan(`⚡ Teste de ping realizado para o equipamento ID ${id}. Tempo de resposta: ${teste.tempo_resposta}ms`));

    // Salva o resultado do teste
    await teste.salvar();
    console.info(chalk.green(`✅ Resultado do teste de ping salvo com sucesso para o equipamento ID ${id}.`));

    return teste;
  } catch (erro) {
    console.error(chalk.red(`❌ Erro ao testar ping para o equipamento ID ${id}: ${erro.message}`));

    // Salva o registro em caso de falha
    const testeFalha = new PingTest({
      equipamento_id: id,
      status: 'falha',
      tempo_resposta: null,
      updated_at: new Date()
    });
    await testeFalha.salvar();
    console.info(chalk.yellow(`⚠️ Registro de falha salvo para o equipamento ID ${id}.`));

    return {
      equipamento_id: id,
      status: 'falha',
      tempo_resposta: null,
      updated_at: new Date()
    };
  }
}

module.exports = { realizarTestePing };
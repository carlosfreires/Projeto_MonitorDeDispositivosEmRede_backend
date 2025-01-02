const express = require('express');
const chalk = require('chalk');
const { iniciarAgendamento, pararAgendamento } = require('../exec_monitoramento-services/executar-monitoramento-service');

const router = express.Router();

/**
 * Rota para iniciar o agendamento.
 */
router.post('/iniciarAgendamento', (req, res) => {
    const { intervalo } = req.body;  // Espera o intervalo em minutos no corpo da requisição
    const intervaloEmMinutos = intervalo ? parseInt(intervalo, 10) : 3;  // Padrão de 3 minutos se não informado
    console.log(chalk.green(`✅ Iniciando o agendamento a cada ${intervaloEmMinutos} minutos...`));
    iniciarAgendamento(intervaloEmMinutos);
    res.status(200).json({ message: `Agendamento iniciado a cada ${intervaloEmMinutos} minutos.` });
});

/**
 * Rota para parar o agendamento.
 */
router.post('/pararAgendamento', (req, res) => {
    pararAgendamento();
    res.status(200).json({ message: 'Agendamento parado com sucesso.' });
});

module.exports = router;
const express = require('express');

// Middleware para interpretar JSON no corpo das requisições
const jsonParser = express.json();

module.exports = jsonParser;
// utils/middlewares/jsonParser.js

/**
 * Middleware para parse do body JSON.
 * Configurável via ENV:
 *  - JSON_LIMIT (ex.: "1mb", "10kb")
 *  - JSON_STRICT (se "false" => strict=false)
 *
 * O padrão é: limit = "1mb", strict = true.
 */
const express = require('express');
const logger = require('../utils/logger');

const limit = process.env.JSON_LIMIT || '1mb';
const strict = (process.env.JSON_STRICT ?? 'true').toLowerCase() !== 'false';

logger.debug(`JSON parser configurado (limit=${limit}, strict=${strict})`);

const jsonParser = express.json({ limit, strict });

module.exports = jsonParser;
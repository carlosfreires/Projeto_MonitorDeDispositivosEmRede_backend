/**
 * Converte uma data para o formato 'YYYY-MM-DD HH:MM:SS' aceito pelo MySQL.
 * 
 * @param {Date|string} data - Objeto Date ou string ISO.
 * @returns {string} Data formatada no padrão MySQL.
 */
function formatarDataMySQL(data) {
  const dateObj = data instanceof Date ? data : new Date(data);
  
  const ano = dateObj.getFullYear();
  const mes = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dia = String(dateObj.getDate()).padStart(2, '0');
  const horas = String(dateObj.getHours()).padStart(2, '0');
  const minutos = String(dateObj.getMinutes()).padStart(2, '0');
  const segundos = String(dateObj.getSeconds()).padStart(2, '0');

  return `${ano}-${mes}-${dia} ${horas}:${minutos}:${segundos}`;
}

module.exports = { formatarDataMySQL };
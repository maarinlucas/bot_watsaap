// utils.js

// Função para verificar se é horário restrito
function isRestrictedTime() {
  const now = new Date();
  const hours = now.getHours();
  return (hours >= 23 || hours < 0);
}

module.exports = {
  isRestrictedTime,
};

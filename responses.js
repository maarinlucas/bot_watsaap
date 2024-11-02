// responses.js
module.exports = {
  groupCommands: {
      command100: '- Mensagem automática: Comando /100 recebido no grupo!',
      lateNightMessage: 'Ei, já é tarde! Que tal você ir dormir? Somente administradores podem enviar mensagens entre 23:00 e 6:00.',
  },
  warnings: [
      'Cuidado! Você mencionou uma palavra-chave.',
      'Atenção! Essa palavra foi mencionada novamente.',
      'Mais uma vez! Fique atento às palavras que você usa.',
      'Última chamada! Você está perto do limite.',
  ],
  finalWarning: 'Você já recebeu todos os avisos. Se continuar, poderá ser removido do grupo.',
  keywords: ['palavra1', 'palavra2', 'palavra3']
};

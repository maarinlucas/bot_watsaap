const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');  // Importa LocalAuth para salvar sessão
const fs = require('fs');
require('dotenv').config();  // Importa as variáveis do .env

// Configuração do cliente com armazenamento local da sessão
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "example"  // Identificador único para a sessão
    })
});

// Gera o QR code apenas se a sessão ainda não estiver salva
client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

// Mensagem de conexão bem-sucedida
client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

client.initialize();

const delay = ms => new Promise(res => setTimeout(res, ms));

// ID do grupo específico (substitua pelo ID real do grupo)
const specificGroupId = process.env.SPECIFIC_GROUP_ID;  // Usa a variável do .env

client.on('message', async msg => {
    // Exibe o ID do grupo se a mensagem for enviada no grupo
    if (msg.from.endsWith('@g.us')) {
        console.log(`ID do grupo: ${msg.from}`);
    }
});

client.on('message', async msg => {
    // Verifica se a mensagem é o comando '/100' de um membro no grupo específico
    if (msg.body === '/100' && msg.from.endsWith('@g.us') && msg.from === specificGroupId) {
        const groupChat = await msg.getChat();
        await client.sendMessage(groupChat.id._serialized, '- Mensagem automática: Comando /100 recebido no grupo!');
    }
});

client.on('group_join', async notification => {
    const groupChat = await client.getChatById(notification.id.remote);

    // Verifica se o grupo é o específico
    if (groupChat.id._serialized === specificGroupId) {
        const newMember = notification.recipientIds[0];
        const contact = await client.getContactById(newMember);
        const welcomeMessage = `Olá, ${contact.pushname || 'Novo membro'}! Bem-vindo(a) ao grupo "${groupChat.name}". Estamos aqui para ajudar com qualquer dúvida!`;
        await client.sendMessage(groupChat.id._serialized, welcomeMessage);
    }
});

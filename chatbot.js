const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const responses = require('./responses');
const { isRestrictedTime } = require('./utils');
require('dotenv').config();

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "example"
    })
});

const specificGroupId = '120363336744782655@g.us';
let points = {};
let warningCount = {};

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Tudo certo! WhatsApp conectado.');
});

client.on('message', async msg => {
    // Verifica se a mensagem é o comando '/100' de um membro no grupo específico
    if (msg.body === '/100' && msg.from.endsWith('@g.us') && msg.from === specificGroupId) {
        try {
            await client.sendMessage(specificGroupId, '- Mensagem automática: Comando /100 recebido no grupo!');
            console.log('Mensagem de comando /100 enviada com sucesso para o grupo!');
        } catch (error) {
            console.error('Erro ao enviar mensagem de comando /100 para o grupo:', error);
        }
    }



    // Responde ao comando se o bot foi mencionado
    if (
        msg.body === '/100' &&
        msg.from === specificGroupId &&
        msg.mentionedIds.includes(client.info.wid._serialized)
    ) {
        try {
            await client.sendMessage(specificGroupId, '- Mensagem automática: Comando /100 recebido no grupo!');
            console.log('Mensagem de comando /100 enviada com sucesso para o grupo!');
        } catch (error) {
            console.error('Erro ao enviar mensagem de comando /100 para o grupo:', error);
        }
    }

    if (msg.from === specificGroupId) {
        // Checa se é horário restrito
        if (isRestrictedTime()) {
            const chat = await client.getChatById(specificGroupId);
            const participants = await chat.participants;

            // Verifica se o remetente é um administrador
            const isAdmin = participants.some(participant => participant.id._serialized === msg.from && participant.isAdmin);

            // Se não for administrador, avise a pessoa para dormir


            if (!isAdmin) {
                await client.sendMessage(msg.from, 'Ei, já é tarde! Que tal você ir dormir? Somente administradores podem enviar mensagens entre 23:00 e 6:00.');
                console.log(`Aviso enviado para ${msg.from} para ir dormir.`);
                return; // Sai da função para evitar processar a mensagem mais
            }
        }

        // Verifica se a mensagem contém alguma palavra-chave
        const foundKeyword = responses.keywords.find(keyword => msg.body.includes(keyword));
        if (foundKeyword) {
            if (!points[msg.from]) points[msg.from] = 0;
            points[msg.from] += 1;

            // Verifica se os pontos ultrapassam 3
            if (points[msg.from] > 3) {
                try {
                    const groupChat = await client.getChatById(specificGroupId);


                    const participant = await groupChat.getParticipant(msg.from);
                    await groupChat.removeParticipants([participant.id._serialized]);
                    console.log(`Usuário ${msg.from} removido por exceder o limite de pontos.`);
                } catch (error) {


                    console.error('Erro ao remover o usuário:', error);
                }
            } else {
                if (!warningCount[msg.from]) warningCount[msg.from] = 0;
                warningCount[msg.from] += 1;

                const warningMessage = warningCount[msg.from] <= responses.warnings.length
                    ? responses.

                        warnings[warningCount[msg.from] - 1]
                    : responses.finalWarning;

                const chancesLeft = 3 - points[msg.from];
                const chancesMessage = `Você ainda tem ${chancesLeft} chance(s) antes de ser removido.`;

                // Responde à mensagem original do usuário com o aviso
                await client.sendMessage(specificGroupId, `@${msg.from.split('@')[0]} ${warningMessage} ${chancesMessage}`, {
                    quotedMessageId: msg.id._serialized // Responde à mensagem do usuário
                });
                console.log(`Aviso enviado para ${msg.from}: ${warningMessage} ${chancesMessage}`);
            }
        }
    }
});
client.on('group_join', async notification => {
    const groupChat = await client.getChatById(notification.id.remote);
    if (groupChat.id._serialized === specificGroupId) {
        console.log(`Novo membro adicionado ao grupo ${specificGroupId}`);
    }
});

client.initialize();

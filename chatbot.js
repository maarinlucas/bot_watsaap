const http = require('http');
const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const { isRestrictedTime } = require('./utils');
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const cron = require('node-cron');
// ID do grupo específico (definido como variável de ambiente)



// Configuração do cliente WhatsApp Web
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: "example"
    })
});

client.initialize();


/* client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
}); */


// Exibir QR code no terminal para autenticação no WhatsApp
client.on('qr', qr => {
const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr)}`;
console.log(`Scan the QR code at this URL: ${qrCodeUrl}`);
});




/* const audioFile1 = 'musica1.mp3'
const audioFile2 = 'musica2.mp3'
const audioFile3 = 'musica3.mp3' */

const specificGroupId = process.env.GROUP_ID;

const forbiddenWords = ['#palavrao', 'porra', 'poha', 'caralho', 'cacete', 'merda', 'bosta', 'puta', 'caraleo', 'buceta', 'desgraça', 'peranha', 'puto', 'boçal', 'taquepariu', 'safada']

const userInfractions = {};

client.on('ready', async () => {
    console.log('Bot iniciado!');

    /* cron.schedule('0 6 * * *', async () => {
        try {
            const chat = await client.getChatById('ID_DO_GRUPO'); // Substitua pelo ID do grupo
            await chat.setMessagesAdminsOnly(false); // Abre o grupo para todos
            await chat.sendMessage("🔓 O grupo está aberto! Todos os participantes podem enviar mensagens.");
            console.log("Grupo aberto às 6:00");
        } catch (error) {
            console.error("Erro ao abrir o grupo:", error);
        }
    });

    // Agendar para fechar o grupo às 23:00
    cron.schedule('0 0 * * *', async () => {
        try {
            const chat = await client.getChatById('ID_DO_GRUPO'); // Substitua pelo ID do grupo
            await chat.setMessagesAdminsOnly(true); // Fecha o grupo para todos, permitindo apenas administradores
            await chat.sendMessage("🔒 O grupo foi fechado! Apenas administradores podem enviar mensagens.");
            console.log("Grupo fechado às 23:00");
        } catch (error) {
            console.error("Erro ao fechar o grupo:", error);
        }
    }); */
});

const allowedUserIds = [
    '5511976047647@c.us',  // Substitua por IDs reais
    '5519996132496@c.us'  // Substitua por IDs reais
    // Adicione mais IDs conforme necessário
];

function clearCache() {
    for (let key in userInfractions) {
        delete userInfractions[key];
    }
    console.log('Cache de infrações foi limpo.');
}

client.on('message', async msg => {
    const chat = await msg.getChat();


    if (chat.isGroup && chat.id._serialized === specificGroupId) {

        // Converte a mensagem para minúsculas para comparação
        const messageText = msg.body.toLowerCase();


        if (msg.body === "Sentido soldado!") {
            const authorId = msg.author || msg.from;

            console.log(msg.mentionedIds.includes(client.info.wid._serialized))
            if (allowedUserIds.includes(authorId)) {
                try {
                    // Aqui você pode adicionar a lógica para verificar se o autor é um administrador

                    await msg.reply("Á sua disposição! 🫡");
                    console.log(`Mensagem enviada para o autor: ${authorId}`);
                } catch (error) {
                    // Captura o erro e exibe no console
                    console.error(`Erro ao enviar a mensagem para o autor ${authorId}:`, error);
                    await chat.sendMessage("Houve um erro ao processar seu comando. Tente novamente mais tarde.");
                }

                return;
            }

        }

        // Resposta ao comando Apresente-se
        if (msg.body === "Apresente-se!") {
            const authorId = msg.author || msg.from;
            if (allowedUserIds.includes(authorId)) {
                try {

                    await chat.sendMessage("Me chamo SENTINELA e sou um 🤖 de inteligência artificial,\n\nMinha missão é vigiar o grupo e garantir a ordem na ausência dos administradores...\n\n *Ezequiel 33:7*\n`Filho do homem, eu fiz de você uma sentinela para a nação de Israel; por isso, ouça a minha palavra e advirta-os em meu nome.` 📖\n\nDigite */ajuda* e confira os comandos disponíveis.");

                } catch (error) {
                    console.error(`Erro ao enviar o áudio:`, error);
                }


                return;
            }
            // Caminho completo do áudio

        }




        if (msg.body === '/limpar') {
            const authorId = msg.author || msg.from;


            // Verifica se o autor é um administrador      

            if (allowedUserIds.includes(authorId)) {
                clearCache(); // Limpa o cache de infrações
                await msg.reply('Cache e dados de infrações foram limpos com sucesso pelos administradores.');
            } else {
                await msg.reply('Apenas administradores podem usar este comando.');
            }
            return;
        }


        // Verifica se a mensagem contém alguma palavra proibida
        if (forbiddenWords.some(word => typeof messageText === 'string' && messageText.includes(word))) {
            let senderId = msg.author || msg.from;

            // Verifica se `senderId` é uma string e o formata corretamente se necessário
            if (typeof senderId === 'string' && !senderId.includes('@c.us')) {
                senderId = `${senderId.split('@')[0]}@c.us`;
            }

            // Inicializa o contador de infrações do usuário se não existir
            if (!userInfractions[senderId]) {
                userInfractions[senderId] = 0;
            }

            // Incrementa o número de infrações do usuário
            userInfractions[senderId] += 1;

            console.log(`Usuário ${senderId} cometeu ${userInfractions[senderId]} infração(ões).`);

            if (userInfractions[senderId] >= 3) {
                try {
                    if (chat && typeof chat.removeParticipants === 'function') {
                        // Remove o usuário do grupo
                        await chat.removeParticipants([senderId]);
                        console.log(`O usuário ${senderId} foi removido por atingir o limite de infrações.`);

                        // Envia a mensagem de aviso no grupo
                        await chat.sendMessage(`O usuário ${senderId.split('@')[0]} foi removido por atingir o limite de infrações.`);

                        // Reseta o contador de infrações do usuário após a remoção
                        delete userInfractions[senderId];
                    }
                } catch (error) {
                    console.error(`Erro ao tentar remover o usuário ${senderId}:`, error);
                }
            } else {
                // Respostas aleatórias
                const responses = [
                    `@${senderId.split('@')[0]}\n\n❗ Palavrões não são permitidos, pare ou poderá ou será banido automaticamente❗\n\n*Efésios 4:29*\n"Não saia da vossa boca nenhuma palavra suja, mas unicamente a que for boa para edificação, conforme a necessidade, e assim transmita graça aos que a ouvem."` + `\n\n*${3 - userInfractions[senderId]} chance(s)*`,
                    `@${senderId.split('@')[0]}\n\n❗ Palavrões não são permitidos, pare ou poderá ou será banido automaticamente❗\n\n*Tiago 1:26*\n"Se alguém cuida ser religioso e não refreia a sua língua, antes engana o seu coração, a sua religião é vã."` + `\n\n*${3 - userInfractions[senderId]} chance(s)*`,
                    `@${senderId.split('@')[0]}\n\n❗ Palavrões não são permitidos, pare ou poderá ou será banido automaticamente❗\n\n*Colossenses 3:8*\n"Mas agora deixai também vós todas estas coisas: ira, indignação, malícia, blasfêmias e palavras desonestas da vossa boca."` + `\n\n*${3 - userInfractions[senderId]} chance(s)*`
                ];

                // Seleciona uma resposta aleatória
                const randomResponse = responses[Math.floor(Math.random() * responses.length)];

                try {
                    // Envia a mensagem de aviso ao usuário
                    await chat.sendMessage(randomResponse, {
                        mentions: [senderId]
                    });
                } catch (error) {
                    console.error('Erro ao enviar mensagem de aviso:', error);
                }
            }
        }





    }

    if (
        msg.body === '/ajuda' &&
        msg.from === specificGroupId
    ) {



        try {

            await msg.reply("*/louvor*\nMostra a lista de louvores para download");
        } catch (error) {
            console.error(`Erro ao executar o comando:`, error);
        }
    }

    if (
        msg.body === '/admsComandos' &&
        msg.from === specificGroupId
    ) {
        if (allowedUserIds.includes(authorId)) {

            try {

                await chat.sendMessage(`*/limpar*\nlimpa o cache do bot e reinicia a contagem de banimento do grupo`);
            } catch (error) {
                console.error(`Erro ao executar o comando:`, error);
            }
        }


    }

    ////////////////////////////////////////////
   

    if (
        msg.body === '/louvor' &&
        msg.from === specificGroupId
    ) {



        try {

            await msg.reply("*/louvor1*\nFilho Meu - Talles Roberto\n\n*/louvor2*\nFogo em Teus Olhos - Ministério ir\n\n*/louvor3*\nPsalm 125 - 'Música dos Templarios'");
        } catch (error) {
            console.error(`Erro ao executar o comando:`, error);
        }
    }



    if (chat.isGroup && chat.id._serialized === specificGroupId) {
        let audioPath;
        let captions;

        if (msg.body === '/louvor1') {
            audioPath = path.join(__dirname, 'musicas', 'musica1.mp3');
            captions = 'Filho Meu - Talles Roberto';
        } else if (msg.body === '/louvor2') {
            audioPath = path.join(__dirname, 'musicas', 'musica2.mp3');
            captions = 'Fogo em Teus Olhos - Ministério Ir';
        } else if (msg.body === '/louvor3') {
            audioPath = path.join(__dirname, 'musicas', 'musica3.mp3');
            captions = 'Psalm 125 - "Música dos Templários"';
        }

        if (audioPath) {
            // Verifica se o arquivo de áudio existe
            if (!fs.existsSync(audioPath)) {
                console.error('Arquivo de áudio não encontrado:', audioPath);
                return;
            }

            try {
                // Cria a mídia a partir do arquivo de áudio
                const media = MessageMedia.fromFilePath(audioPath);
                // Envia a música no grupo
                await msg.reply(media);
                await chat.sendMessage(captions)
                console.log(`Áudio enviado com sucesso: ${captions}`);
            } catch (error) {
                console.error(`Erro ao enviar o áudio:`, error);
            }
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
                await client.sendMessage(msg.from, 'Ei, já é tarde! Que tal você ir dormir?  😴\n\n*Salmos 4:*\n`Em paz me deitarei e dormirei, pois só tu, Senhor, me fazes habitar em segurança.`');
                console.log(`Aviso enviado para ${msg.from} para ir dormir.`);
                return; // Sai da função para evitar processar a mensagem mais
            }
        }



    }



});

client.on('group_join', async (notification) => {
    const chat = await notification.getChat();

    // Verifica se o evento aconteceu no grupo específico
    if (chat.isGroup && chat.id._serialized === specificGroupId) {
        const participantId = notification.id.participant;  // ID do novo participante

        // Envia a mensagem de boas-vindas no grupo específico com o ID do participante na lista de mentions
        chat.sendMessage(`@${participantId.split('@')[0]}\n\nBem-vindo(a) a comunidade!\n\nAqui praticamos jejuns coletivos, mandamos versículos, devocionais, respondemos dúvidas, orações e damos conselhos para o avanço do reino de Deus 👑\n\nPor favor leia as regras na descrição do grupo ❗\n\n*` + "1Corintios 16:23*\n`A graça do Senhor Jesus seja com vocês.`", {
            mentions: [participantId]  // Usando o ID do participante como string
        });
    }
});

// Inicializa o cliente WhatsApp Web


// Configura o servidor HTTP para o Render
const PORT = process.env.PORT || 4000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('WhatsApp Bot está em execução');
}).listen(PORT, () => {
    console.log(`Servidor HTTP rodando na porta ${PORT}`);
});

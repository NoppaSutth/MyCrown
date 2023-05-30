require('dotenv').config(); // Load environment variables from .env file

const { Client, GatewayIntentBits } = require('discord.js');
const { Configuration, OpenAIApi } = require('openai');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
  });

const openaiToken = process.env.OPENAI_API_KEY; // Retrieve OpenAI API key from environment variable
const botToken = process.env.DISCORD_BOT_TOKEN; // Retrieve Discord bot token from environment variable

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

const configuration = new Configuration({
    apiKey: openaiToken
});

const openai = new OpenAIApi(configuration);

client.on('messageCreate', async (message) => {
   if (message.author.bot) return;
   if (message.channel.id !== process.env.CHANNEL_ID) return;
   if (message.content.startsWith('!')) return;

   let conversationLog = [{ role: 'system', content: 'You are a helpful assistant.'}];

   await message.channel.sendTyping();

   let prevMessages = await message.channel.messages.fetch({ limit: 15 });
   prevMessages.reverse();

    prevMessages.forEach((msg) => {
        if (message.content.startsWith('!')) return;
        if (msg.author.id !== client.user.id && message.author.bot) return;
        if (msg.author.id !== message.author.id) return;

        conversationLog.push({
            role: 'user',
            content: msg.content
        })
    });


   const result = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: conversationLog
   })

   message.reply(result.data.choices[0].message);
});

client.login(botToken); // Use Discord bot token from environment variable

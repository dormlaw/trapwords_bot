require('dotenv').config();
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TOKEN, { polling: true });

const { messages } = require('./messages')

const sessions = new Map();
const players = new Map();

bot.onText(/\/test/, (msg) => {
  console.log(sessions)
});

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, messages.start.text, {
    parse_mode: 'Markdown',
  });
});

bot.onText(/\/rules/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, messages.rules_main.text, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: messages.rules_main.keyboard
    }
  });
});

bot.onText(/\/new/, (msg) => {
  const chatId = msg.chat.id;

  let sessionCode = "";
  let check = false;
  for (let games of sessions) {
    if (games[1].toString() === chatId) { check = true, sessionCode = games[0] }
  }
  if (!check) {
    const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < 6; i++) {
      sessionCode += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
    };
    let game = {
      toString: () => chatId,
      players: [chatId],
      team1: [],
      team2: [],
    }
    sessions.set(sessionCode, game);

    bot.sendMessage(chatId, `Игровая сессия создана. Поделитесь этим токеном с остальными участниками игры: \`${sessionCode}\`.`, {
      parse_mode: 'Markdown',
    });
    bot.sendMessage(chatId, messages.team_select.text,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: messages.team_select.keyboard
        }
      });
  } else {
    bot.sendMessage(chatId, `Вы уже являетесь создателем игры: \`${sessionCode}\`\n`+ messages.team_select.text,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: messages.team_select.keyboard
        }
      });
  }
});

bot.onText(/\/join (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const session = match[1]
  const players = sessions.get(session).players

  if (!players.includes(chatId)) {
    players.push(chatId);
    bot.sendMessage(chatId, `Вы присоединились к игре: \`${session}\`.\n`+ messages.team_select.text, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: messages.team_select.keyboard
      }
    });
  } else {
    bot.sendMessage(chatId, `Вы уже находитесь в игре: \`${session}\`\n`+ messages.team_select.text, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: messages.team_select.keyboard
      }
    });
  }
});

bot.on('callback_query', (callbackQuery) => {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;

  switch (action) {
    //===Rules===
    case 'rules_main':
      bot.editMessageText(messages.rules_main.text, {
        chat_id: chatId,
        message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: messages.rules_main.keyboard
        }
      });
      break;
    case 'rules_words':
      bot.editMessageText(messages.rules_words.text, {
        chat_id: chatId,
        message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: messages.rules_words.keyboard
        }
      });
      break;

    //===Teams===
    case 'team1':
      sessions.get()
      bot.editMessageText('Участники:', {
        chat_id: chatId,
        message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: messages.team_ready.keyboard
        }
      });
      break;
  }
});
require('dotenv').config();
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TOKEN, { polling: true });

const { messages } = require('./messages')

const sessions = new Map();
const players = new Map();

bot.onText(/\/test/, (msg) => {
  console.log(sessions)
  console.log(players)

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

bot.onText(/\/leave/, (msg) => {
  const chatId = msg.chat.id;

  if (players.has(chatId)) {
    sessions.delete(players.get(chatId));
    players.delete(chatId);
    bot.sendMessage(chatId, 'Вы покинули игру', {
      parse_mode: 'Markdown',
    });
  } else {
    bot.sendMessage(chatId, 'Вы не состоите в игре', {
      parse_mode: 'Markdown',
    });
  }
});

bot.onText(/\/new/, (msg) => {
  const chatId = msg.chat.id;

  let sessionCode = "";
  if (!players.has(chatId)) {
    const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < 6; i++) {
      sessionCode += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
    };
    let game = {
      players: new Map,
      team1: new Map,
      team2: new Map,
    }
    game.players.set(chatId, msg.chat.username)
    players.set(chatId, sessionCode);
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
    sessionCode = players.get(chatId)
    bot.sendMessage(chatId, `Вы уже являетесь создателем игры: \`${sessionCode}\`\n` + messages.team_select.text,
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

  if (!players.has(chatId) && sessions.has(session)) {
    players.set(chatId, session);
    sessions.get(session).players.set(chatId, msg.chat.username);
    bot.sendMessage(chatId, `Вы присоединились к игре: \`${session}\`.\n` + messages.team_select.text, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: messages.team_select.keyboard
      }
    });
  } else if (sessions.has(session)) {
    bot.sendMessage(chatId, `Вы уже находитесь в игре: \`${session}\`\n` + messages.team_select.text, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: messages.team_select.keyboard
      }
    });
  } else {
    bot.sendMessage(chatId, 'Такой игры не существует', {
      parse_mode: 'Markdown',
    });
  }
});

bot.on('callback_query', (callbackQuery) => {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const sessionCode = players.get(chatId);
  const game = sessions.get(sessionCode);

  let team1Players = []
  let team2Players = []

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
      if (!game.team1.has(chatId) && !game.team2.has(chatId)) {
        game.team1.set(chatId, game.players.get(chatId))
        for (let player of game.team1.values()) {
          team1Players.push(player);
        };
        for (let player of game.team2.values()) {
          team2Players.push(player);
        };
        bot.editMessageText(`Комманда 👻: ${team1Players.toString()}\nКомманда 👽: ${team2Players.toString()}`, {
          chat_id: chatId,
          message_id: msg.message_id,
          reply_markup: {
            inline_keyboard: messages.team_ready.keyboard
          }
        });
      } else {
        bot.sendMessage(chatId, 'Вы уже выбрали команду', {
          reply_markup: {
            inline_keyboard: messages.team_ready.keyboard
          }
        });
      }
      break;
    case 'team2':
      if (!game.team1.has(chatId) && !game.team2.has(chatId)) {
        game.team2.set(chatId, game.players.get(chatId))
        for (let player of game.team1.values()) {
          team1Players.push(player);
        };
        for (let player of game.team2.values()) {
          team2Players.push(player);
        };
        bot.editMessageText(`Команда 👻: ${team1Players.toString()}\nКоманда 👽: ${team2Players.toString()}`, {
          chat_id: chatId,
          message_id: msg.message_id,
          reply_markup: {
            inline_keyboard: messages.team_ready.keyboard
          }
        });
      } else {
        bot.sendMessage(chatId, 'Вы уже выбрали команду', {
          reply_markup: {
            inline_keyboard: messages.team_ready.keyboard
          }
        });
      }
      break;
    case 'team_switch':
      if (game.team1.has(chatId)) { game.team1.delete(chatId) }
      if (game.team2.has(chatId)) { game.team2.delete(chatId) }
      for (let player of game.team1.values()) {
        team1Players.push(player);
      };
      for (let player of game.team2.values()) {
        team2Players.push(player);
      };
      bot.editMessageText(
        messages.team_select.text +
        `\nКоманда 👻: ${team1Players.toString()}\nКоманда 👽: ${team2Players.toString()}`, {
        chat_id: chatId,
        message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: messages.team_select.keyboard
        }
      });
      break;
    case 'team_ready':
      for (let player of game.team1.values()) {
        team1Players.push(player);
      };
      for (let player of game.team2.values()) {
        team2Players.push(player);
      };
      if ((game.team1.size >= 1) &&
          (game.team2.size >= 1) &&
          (((game.team1.size % game.team2.size) <= 1) || ((game.team2.size % game.team1.size) <= 1))) {
        bot.editMessageText(
          messages.team_ready.text +
          `\nКомманда 👻: ${team1Players.toString()}\nКоманда 👽: ${team2Players.toString()}`, {
          chat_id: chatId,
          message_id: msg.message_id,
          reply_markup: {
            inline_keyboard: messages.team_ready.keyboard
          }
        });
      } else {
        bot.editMessageText(
          'Команды должны быть примерно равны и иметь минимум по 2 игрока' +
          `\nКоманда 👻: ${team1Players.toString()}\nКоманда 👽: ${team2Players.toString()}`, {
          chat_id: chatId,
          message_id: msg.message_id,
          reply_markup: {
            inline_keyboard: messages.team_ready.keyboard
          }
        });
      }
      break;
  }
});
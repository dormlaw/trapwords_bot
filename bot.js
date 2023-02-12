require('dotenv').config();
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TOKEN, { polling: true });

const { messages } = require('./messages');
const Session = require('./session');

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

  if (!players.has(chatId)) {
    Session.code()
    const sessionCode = Session.code();
    let game = new Session(chatId, msg.chat.username);
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
    const sessionCode = players.get(chatId)
    bot.sendMessage(chatId, `Вы уже являетесь создателем игры: \`${sessionCode}\`\n` + messages.team_select.text,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: messages.team_select.keyboard
        }
      });
  }
});

bot.onText(/\/join/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, 'Введите токен', {
    parse_mode: 'Markdown',
  });
  
  bot.once("text", (msg) => {
    const session = msg.text;
    const game = sessions.get(session);
  
    if (!players.has(chatId) && sessions.has(session)) {
      players.set(chatId, session);
      game.addPlayer(chatId, msg.chat.username);
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
});


bot.on('callback_query', (callbackQuery) => {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const sessionCode = players.get(chatId);
  const game = sessions.get(sessionCode);

  const teamPlayers = ()=> {
    let players = [[], []]
    game.team1.forEach(element => {
      players[0].push(game.name(element))
    });
    game.team2.forEach(element => {
      players[1].push(game.name(element))
    });
    return players
  }
  let teams

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
      if (!game.team1.includes(chatId) && !game.team2.includes(chatId)) {
        game.toTeam(chatId, 1);
        teams = teamPlayers();
        bot.editMessageText(`Комманда 👻: ${teams[0].toString()}\nКомманда 👽: ${teams[1].toString()}`, {
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
      if (!game.team1.includes(chatId) && !game.team2.includes(chatId)) {
        game.toTeam(chatId, 2);
        teams = teamPlayers();
        bot.editMessageText(`Команда 👻: ${teams[0].toString()}\nКоманда 👽: ${teams[1].toString()}`, {
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
      if (game.team1.includes(chatId)) { delete game.team1[game.team1.indexOf(chatId)] }
      if (game.team2.includes(chatId)) { delete game.team2[game.team2.indexOf(chatId)] }
      teams = teamPlayers();
      bot.editMessageText(
        messages.team_select.text +
        `\nКоманда 👻: ${teams[0].toString()}\nКоманда 👽: ${teams[1].toString()}`, {
        chat_id: chatId,
        message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: messages.team_select.keyboard
        }
      });
      break;
    case 'team_ready':
      teams = teamPlayers();
      if (game.fairPlay()) {
        bot.editMessageText(
          messages.team_ready.text +
          `\nКомманда 👻: ${teams[0].toString()}\nКоманда 👽: ${teams[1].toString()}`, {
          chat_id: chatId,
          message_id: msg.message_id,
          reply_markup: {
            inline_keyboard: messages.team_ready.keyboard
          }
        });
      } else {
        bot.editMessageText(
          'Команды должны быть примерно равны и иметь минимум по 2 игрока' +
          `\nКоманда 👻: ${teams[0].toString()}\nКоманда 👽: ${teams[1].toString()}`, {
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
'use strict'
require('dotenv').config();
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;

const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(TOKEN,
  {
    polling: true,
    parse_mode: 'Markdown'
  });

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

  bot.sendMessage(chatId, messages.start.text);
});

bot.onText(/\/rules/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, messages.rules_main.text, {
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
    bot.sendMessage(chatId, 'Вы покинули игру');
  } else {
    bot.sendMessage(chatId, 'Вы не состоите в игре');
  }
});

bot.onText(/\/new/, (msg) => {
  const chatId = msg.chat.id;

  if (!players.has(chatId)) {
    bot.sendMessage(chatId, 'Введите название игровой сессии:');
    bot.once('message', (msg) => {
      const sessionCode = msg.text;
      const game = new Session(chatId, msg.chat.username);
      game.creator = chatId;
      players.set(chatId, sessionCode);
      sessions.set(sessionCode, game);

      bot.sendMessage(chatId, `Игровая сессия создана. Поделитесь этим токеном с остальными участниками игры: \`${sessionCode}\`.`);
      bot.sendMessage(chatId, messages.team_select.text,
        {
          reply_markup: {
            inline_keyboard: messages.team_select.keyboard
          }
        });
    });
  } else {
    const sessionCode = players.get(chatId)
    bot.sendMessage(chatId, `Вы уже состоите в игре: \`${sessionCode}\`\n` + messages.team_select.text,
      {
        reply_markup: {
          inline_keyboard: messages.team_select.keyboard
        }
      });
  }
});

bot.onText(/\/join/, (msg) => {
  const chatId = msg.chat.id;

  bot.sendMessage(chatId, 'Введите токен',);

  bot.once("text", (msg) => {
    const session = msg.text;
    const game = sessions.get(session);

    if (!players.has(chatId) && sessions.has(session)) {
      players.set(chatId, session);
      game.addPlayer(chatId, msg.chat.username);
      bot.sendMessage(chatId, `Вы присоединились к игре: \`${session}\`.\n` + messages.team_select.text, {
        reply_markup: {
          inline_keyboard: messages.team_select.keyboard
        }
      });
    } else if (sessions.has(session)) {
      bot.sendMessage(chatId, `Вы уже находитесь в игре: \`${session}\`\n` + messages.team_select.text, {
        reply_markup: {
          inline_keyboard: messages.team_select.keyboard
        }
      });
    } else {
      bot.sendMessage(chatId, 'Такой игры не существует');
    }
  });
});

bot.on('callback_query', (callbackQuery) => {
  const action = callbackQuery.data;
  const msg = callbackQuery.message;
  const chatId = msg.chat.id;
  const sessionCode = players.get(chatId);
  const game = sessions.get(sessionCode);

  const teamPlayers = () => {
    let players = [[], []]
    game.teams[0].forEach(element => {
      players[0].push(game.name(element))
    });
    game.teams[1].forEach(element => {
      players[1].push(game.name(element))
    });
    return players
  }
  let teams
  function teamListMsg() {
    return `Комманда 👻: ${teams[0].toString()}\nКомманда 👽: ${teams[1].toString()}`
  }
  function readyListMsg() {
    let ready = []
    game.ready.forEach((value) => {
      ready.push(game.name(value))
    })
    return `\nГотовы: ${ready.toString()}`
  }

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
      if (!game.teams[0].includes(chatId) && !game.teams[1].includes(chatId)) {
        game.teams[0].push(chatId);
        teams = teamPlayers();
        bot.editMessageText(teamListMsg(), {
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
      if (!game.teams[0].includes(chatId) && !game.teams[1].includes(chatId)) {
        game.teams[1].push(chatId);
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
      if (game.teams[0].includes(chatId)) { delete game.teams[0][game.teams[0].indexOf(chatId)] }
      if (game.teams[1].includes(chatId)) { delete game.teams[1][game.teams[1].indexOf(chatId)] }
      teams = teamPlayers();
      bot.editMessageText(
        messages.team_select.text + '\n' + teamListMsg(), {
        chat_id: chatId,
        message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: messages.team_select.keyboard
        }
      });
      break;
    case 'team_refresh':
      teams = teamPlayers();
      bot.editMessageText(
        messages.team_ready.text + '\n' + teamListMsg() + readyListMsg(), {
        chat_id: chatId,
        message_id: msg.message_id,
        reply_markup: {
          inline_keyboard: messages.team_ready.creatorKeyboard
        }
      });
      break;
    case 'team_ready':
      teams = teamPlayers();
      if (game.fairPlay()) {
        game.ready.add(chatId);
        if (chatId === game.creator) {
          bot.editMessageText(
            messages.team_ready.text + '\n' + teamListMsg() + readyListMsg(), {
            chat_id: chatId,
            message_id: msg.message_id,
            reply_markup: {
              inline_keyboard: messages.team_ready.creatorKeyboard
            }
          });
        } else {
          bot.editMessageText(
            messages.team_ready.text + '\n' + teamListMsg() + readyListMsg(), {
            chat_id: chatId,
            message_id: msg.message_id,
          });
        }
      } else {
        bot.editMessageText(
          'Команды должны быть примерно равны и иметь минимум по 2 игрока' + '\n' + teamListMsg(), {
          chat_id: chatId,
          message_id: msg.message_id,
          reply_markup: {
            inline_keyboard: messages.team_ready.keyboard
          }
        });
      }
      break;
    case 'game_start':
      teams = teamPlayers();
      if (game.fairPlay()) {
        bot.editMessageText(
          'Состав команд' + '\n' + teamListMsg() + readyListMsg(), {
          chat_id: chatId,
          message_id: msg.message_id,
        });
        game.players.forEach((name, id) => {
          bot.sendMessage(id, messages.game_start.text, {
            reply_markup: {
              inline_keyboard: messages.game_start.keyboard
            }
          });
        });
      }
      break;
  }
});
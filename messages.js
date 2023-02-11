const messages =  {
    start: {
      text: `Добро пожаловать в игру: 
*Опасные слова*
      
/new - начать новую игру

/join [token] - присоединится к существующей

/leave - покинуть игру

/rules - правила игры`,
    },
    rules_main: {
      text: `ПРАВИЛА ИГРЫ
      
Игроки делятся на 2 команды.
Один из игроков назначается ~ведущим~, который первым будет объяснять слова
Каждая команда получает слово, которое должна будет объяснить другая команда.
Командам необходимо составить список слов ловушек для слова противников. Количество слов-ловушек бдует указано в примечании.
Команды по очереди объясняют свои слова. Отстающая команда всегда ходит первой.
Когда наступает очередь команды противников ходить, сделайте следующее:
1. ~Ведущий~ нажимает передать ход
2. ~Ведущий~ другой команды получает загаданное слово. Ему дается 3 секунды на ознакомление, после этого запускается таймер.
3. Объясняющий игрок старается объяснить своей команде секретное слово. Остановите его
в одной из следующих ситуаций:
 • Если объясняющий игрок произнесет слово-ловушку или любую его форму.
 • Если объясняющий игрок нарушит одно из правил объяснения.
 • Если команда противников выскажет свою 5-ю догадку.
 • Если отведенное время истечет.
4. Если слово успешно отгадано  - комманда получает очки.
После хода обеих команд назначаются следующие ~ведущие~ и комманды снова получают слова
Дополнительные условия:
В некоторых случаях на ~ведущих~ могут действовать дополнительные ограничение. Они будут известны перед началом раунда.`,
      keyboard: [
        [{ text: 'Правила объяснения', callback_data: 'rules_words'}]
      ]
    },
    rules_words: {
        text: `РАЗРЕШЕННЫЕ ПОДСКАЗКИ
• Нельзя произносить любую из форм секретного слова. Само секретное слово,
по сути, тоже является словом-ловушкой и подчиняется всем связанным с ними правилам.
• Нельзя давать примеры секретного слова. Как породы для слова «собака»,
• Нельзя использовать имена собственные («Россия», «Ирония судьбы», «Путин»). Но это зависит от контекста.
• Подсказки могут указывать на смысл слова, но не на то, как это слово звучит
или пишется. Запрещены подсказки вроде «это рифмуется с...» или «звучит как...».
Не говорите, с какой буквы начинается слово, не используйте созвучные слова.
• Вы можете намекать на распространенные фразы, содержащие секретное слово,
если они указывают на смысл слова, а не на то, как оно пишется. Например, объясняя
слово «осень», намекнуть на пословицу «цыплят по осени считают».
• Нельзя использовать аббревиатуры для имен собственных, такие как США
и ФБР. Однако такие аббревиатуры, как DVD, приемлемы. Это не сокращение имени
собственного, даже несмотря на то, что буквы в аббревиатуре заглавные. Обратите внимание,
что, произнеся слово «ООН», можно попасть в ловушку, если команда противников записала
слово «организация».
• Не ссылайтесь на известные произведения, упоминая части их названий. Например,
«я думаю об игре, где кто-то может играть с престолами» ▬ запрещенная подсказка.
• Нельзя подсказывать, опираясь на неизвестную другой команде информацию.
«Это место, где мы раньше тусовались в торговом центре» ▬ такая подсказка разрешается
только в том случае, если все остальные игроки тусовались там вместе с вами.
• Не используйте подсказки, которые основаны на объектах, находящихся в вашей
комнате. Не ссылайтесь на что-то, происходящее «прямо сейчас».
• Подсказки должны основываться на словах, которые могут быть записаны.
Не используйте для объяснения жесты, интонации или мелодии.

ДОГАДКИ
• Догадка верна, если она содержит секретное слово. «Перья» или «птичье перо» являются
верными догадками для секретного слова «перо».
• Но назвать однокоренное слово для верной догадки недостаточно. Например, если секретное
слово «яд» – слов «ядовитый» или «противоядие» недостаточно для верной догадки,
(но достаточно для того, чтобы угодить в ловушку).
• Нельзя задавать объясняющему игроку вопросы.
• Нельзя советоваться с членами вашей команды. Если вы скажете: «Я думаю, что это
гоблин, можно я скажу "гоблин"?» – это будет считаться догадкой.`,
        keyboard: [
            [{ text: 'Обратно', callback_data: 'rules_main'}]
          ]
    },
    team_select: {
        text: 'Выберите команду',
        keyboard: [
            [
                {text: 'Команда 👻', callback_data: 'team1'},
                {text: 'Команда 👽', callback_data: 'team2'}
            ]
        ]
    },
    team_ready: {
        keyboard: [
            [{ text: 'Готов', callback_data: 'team_ready'}]
          ]
    }
  };

  module.exports = { messages };
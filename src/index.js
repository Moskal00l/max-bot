import { Bot, Keyboard } from "@maxhub/max-bot-api";
import { getEvent, registration } from "./api/requests.js";

const BOT_TOKEN =
 process.env.TOKEN;

const convertToDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const bot = new Bot(BOT_TOKEN);

// Список команд в чате
bot.api.setMyCommands([
  {
    name: 'help',
    description: 'Помощь в использование Мини-Приложения.',
  },
]);


// Обработчик для команды '/help'
bot.command("help", async (ctx) => {
  const chat_id = ctx.update.message.recipient.chat_id;
  console.log(ctx.update.message.recipient.chat_id);

  try {
  const image = await ctx.api.uploadImage({url: 'https://upload.wikimedia.org/wikipedia/commons/4/43/BOThelp.png'}); 
  await bot.api.sendMessageToChat(chat_id, '📋 **Основные возможности**\n' +
    'Бот позволяет создавать и управлять мероприятиями, приглашать участников и отмечать посещаемость.\n' + '\n' +

    '🚀 **Создание мероприятия**\n' +
    '>- Нажмите кнопку "+"\n' +
    '>- Заполните информацию:\n' +
    '>- Название события\n' +
    '>- Описание - подробная информация о мероприятии\n' +
    '>- Место проведения - адрес или локация\n' +
    '>- Дата и время - когда состоится событие\n' +
    '>- Ссылка на чат - для общения участников\n' + ' \n  ' +

    '\n👥 **Роли участников**\n' +
    '**В системе предусмотрено 3 типа ролей:**\n' +
    '>👤 Участник - обычный участник мероприятия\n' +
    '>🛠 Администратор - помогает организатору управлять мероприятием\n' +
    '>👑Создатель - организатор мероприятия (вы)\n' + ' \n ' +

    '\n🔧 **Управление мероприятием**\n' +
    '>Для организатора (создателя):\n' +
    '>Просмотр участников:\n' +
    '>Откройте меню мероприятия\n' +
    '>Видите всех, кто присоединился к событию\n' +  ' \n ' +

    '\n**Назначение администратора:**\n' +
    '>Откройте список участников\n' +
    '>Найдите нужного человека\n' +
    '>Нажмите на синюю кнопку с иконкой человечка рядом с его именем\n' + ' \n ' +

    '\n**Для администраторов:**\n' +
    '>Просматривают список участников\n' +
    '>Помогают отмечать посещаемость\n' + ' \n ' +

    '\n📲 **Приглашение участников**\n' +
    '>Как пригласить людей:\n' +
    '>Организатор получает специальную ссылку-приглашение\n' +
    '>Отправляет ее желающим присоединиться\n' +
    '>Участники переходят по ссылке и автоматически добавляются в мероприятие\n' + ' \n ' +

    '\n📊 **Отслеживание посещаемости**\n' +
    '**Сканирование QR-кодов:**\n' +
    '>✅ Организатор и администраторы могут сканировать QR-коды участников\n' +
    '>📱 Участники показывают свой QR-код при входе на мероприятие\n' +
    '>🔍 После сканирования система автоматически отмечает присутствие',

    {format: 'markdown', attachments: [image.toJson()]});
  } catch (err) {
    console.log(err);
    await ctx.reply('К сожалению, случились технические-шоколадки. Попробуйте позже.')
  }
});

// Обработчик входа пользователя по ссылке события
bot.on("bot_started", async (ctx) => {
  if (!ctx.update.payload) return;
  console.log(ctx.update.payload);
  const event_id = ctx.update.payload;
  const chat_id = ctx.update.chat_id;
  const avatar = ctx.update.user.avatar_url;



  let event = null;
  try {
    const response = await getEvent(event_id);
    event = response.data.event;
    if (event.status === "422") console.log("event_id error");
  } catch (err) {
    ctx.reply('К сожалению, данная ссылка недействительна.\nПопросите у организатора другую ссылку.')
    console.log("response error");
    return;
  }
  
  const keyboard_registration = Keyboard.inlineKeyboard([
    [Keyboard.button.callback("Зарегистрироваться", "register:" + event_id + ' ' + avatar + ' ' + event.creator + ' ' + event.title)],
  ]);


  try {
    await bot.api.sendMessageToChat(
      chat_id,
      "**Добро пожаловать**!🤗\n" +
      'Вас пригласили на мероприятие "' +
      event.title +
      '"\n' +
      "📝: " +
      event.description +
      "\n" +
      "🏠: " +
      event.location +
      "\n" +
      "📅: " +
      convertToDate(event.datetime),
      { format: "markdown", attachments: [keyboard_registration] }
    );
  } catch (err) {
    console.log(err);
    return;
  }
});

// bot.on("message_callback", async (ctx) => {
//   const data = ctx.update.callback.payload.split(" ");
//   let id_chat = ctx.update.message.recipient.chat_id;
//   console.log(id_chat);
//   let user = ctx.update.callback.user;
//   let user_id = user.user_id;
//   let first_name = user.first_name;
//   let last_name = user.last_name;
//   let avatar = data[1];
//   let id_event = data[0];
//   let flag;
//   try {
//     let url = BASE_URL.replace("{id}", id_event);

//     flag = await requestPost(
//       url,
//       BOT_TOKEN,
//       user_id,
//       first_name,
//       last_name,
//       avatar
//     );
//   } catch (err) {
//     console.log(err);
//     ctx.reply("Добро пожаловть! К сожалению, данная ссылка не действительна.");
//     return;
//   }
//   if (flag) {
//     await bot.api.sendMessageToChat(
//       id_chat,
//       "**Вы успешно зарегистрированы!**",
//       { format: "markdown" }
//     );
//   }
// });

// // Обработчик кнопки "Регистрация"
bot.action(/register:(.+)/, async (ctx) => {
  console.log(ctx.update.callback.payload);
  // let user = ctx.update.callback.user;
  // let user_id = user.user_id;
  // let user_name = user.name;
  // let first_name = user.first_name;
  // let last_name = user.last_name;
  const id_chat = ctx.update.message.recipient.chat_id;
  const data = ctx.update.callback.payload.slice(9).split(' ');
  const avatar = data[1]; 
  const user = { user_id: ctx.update.callback.user.user_id,
     first_name: ctx.update.callback.user.first_name,
     last_name: ctx.update.callback.user.last_name,
     avatar: avatar
    };
  
  const event_title = data[3];
  const message_id = ctx.update.message.body.mid;
  const message_text = ctx.update.message.body.text;

// нет аватара в ctx
  const event_id = data[0];
  const creator_id = data[2];
  console.log(creator_id);
  try {

    const response = await registration(event_id, user);
    console.log(response.status);
    if (response.status != 201) {

      await bot.api.sendMessageToChat(id_chat,
      "**Вы не зарегистрировались ❌**\nПопробуйте позже.",
      { format: "markdown" });
      
      return;
    };


  } catch (err) {
  ctx.reply("К сожалению, произошла ошибка. Попробуйте ещё раз или позже.");
  return;

}

  const keyboard_app = Keyboard.inlineKeyboard([
  [Keyboard.button.link(" Открыть приложение", 'https://max.ru/t159_hakaton_bot?startapp')],
  ]);
  
  await bot.api.editMessage(message_id, {text: message_text, attachments: []});

  await bot.api.sendMessageToChat(id_chat,
      "**Вы зарегистрированы ✅**",
      { format: "markdown",
        attachments: [keyboard_app]
       });
  
  await bot.api.sendMessageToUser(creator_id, 'С радостью сообщаем 🪄:\n\n' + '✅' + user.first_name + ' ' + user.last_name 
    + 'стал участником вашего мероприятия "' + event_title + '"!' ,
      { format: "markdown" });


});

bot.start();

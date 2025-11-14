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

// Обработчик для команды '/start'
bot.command("start", (ctx) => ctx.reply("Добро пожаловать!"));

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

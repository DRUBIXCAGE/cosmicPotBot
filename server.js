const { Telegraf } = require('telegraf');
const { getFullNumerology } = require('./numberEngine');

const bot = new Telegraf(process.env.BOT_TOKEN);

// START
bot.start((ctx) => {
  ctx.reply(`
🧿 Welcome to CosmicPot

Send your DOB in format:
DD-MM-YYYY

Example: 27-10-1997
  `);
});

// HANDLE INPUT
bot.on('text', (ctx) => {
  const dob = ctx.message.text;

  if (!dob.match(/^\d{2}-\d{2}-\d{4}$/)) {
    return ctx.reply("❌ Invalid format. Use DD-MM-YYYY");
  }

  const data = getFullNumerology(dob);

  ctx.reply(`
🧿 Your Cosmic Profile

🔢 Birth: ${data.birth}
🌌 Destiny: ${data.destiny}
🧠 Attitude: ${data.attitude}
🔮 Maturity: ${data.maturity}

⏳ Year: ${data.personalYear}
📅 Month: ${data.personalMonth}
📆 Day: ${data.personalDay}

✨ Type GUIDE for deeper insight
  `);
});

// GUIDE FLOW
bot.hears(/guide/i, (ctx) => {
  ctx.reply(`
🔮 Deeper guidance unlocked

📿 For full reading:
👉 https://wa.me/91XXXXXXXXXX
  `);
});

// START BOT
bot.launch();

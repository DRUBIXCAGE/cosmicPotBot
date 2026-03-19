const { Telegraf } = require('telegraf');
const { getFullNumerology } = require('./numberEngine');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN);

// 🧿 START COMMAND
bot.on('text', (ctx) => {
  const text = ctx.message.text.trim().toLowerCase();

  // GUIDE FIRST
  if (text === "guide") {
    return ctx.reply(`
🔮 Cosmic Guidance Activated

✨ You are on a path shaped by your numbers.
Trust your intuition and align your actions.

💞 For full personal reading:
👉 https://wa.me/91XXXXXXXXXX
    `);
  }

  // DOB CHECK
  if (!text.match(/^\d{2}-\d{2}-\d{4}$/)) {
    return ctx.reply("❌ Send DOB in format: DD-MM-YYYY");
  }

  const data = getFullNumerology(text);

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

// 🚀 START BOT
bot.launch();

// 🧿 KEEP RENDER ALIVE (IMPORTANT)
const app = express();

app.get('/', (req, res) => {
  res.send('CosmicPot Bot is running 🧿');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

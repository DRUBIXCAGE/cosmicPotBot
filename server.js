const { Telegraf } = require('telegraf');
const { getFullNumerology } = require('./numberEngine');
const express = require('express');

const bot = new Telegraf(process.env.BOT_TOKEN);

// 🧿 START COMMAND
bot.start((ctx) => {
  ctx.reply(`
🧿 Welcome to CosmicPot

Send your DOB in format:
DD-MM-YYYY

Example: 27-10-1997
  `);
});

// 🧿 HANDLE ALL TEXT
bot.on('text', (ctx) => {
  const text = ctx.message.text.trim();

  // 🔮 GUIDE FLOW (FIRST PRIORITY)
  if (text.toLowerCase() === "guide") {
    return ctx.reply(`
🔮 Cosmic Guidance Activated

✨ You are on a path shaped by your numbers.
Trust your intuition and align your actions.

📿 For full personal reading:
👉 https://wa.me/91XXXXXXXXXX
    `);
  }

  // ❌ INVALID FORMAT CHECK
  if (!text.match(/^\d{2}-\d{2}-\d{4}$/)) {
    return ctx.reply("❌ Invalid format. Use DD-MM-YYYY");
  }

  // 🔢 CALCULATE NUMBERS
  const data = getFullNumerology(text);

  // 🧿 RESPONSE
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

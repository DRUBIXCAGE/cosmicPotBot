const { Telegraf } = require('telegraf');
const express = require('express');
const { getFullNumerology } = require('./numberEngine');

const bot = new Telegraf(process.env.BOT_TOKEN);

// 🧿 START MENU WITH BUTTONS
bot.start((ctx) => {
  ctx.reply("🧿 Welcome to CosmicPot\n\nChoose your path:", {
    reply_markup: {
      keyboard: [
        ["🔢 Core Numbers", "🌌 Time Energy"],
        ["🔮 Get Guidance", "💎 Premium Reading"]
      ],
      resize_keyboard: true
    }
  });
});

// 🧿 BUTTON HANDLERS
bot.hears("🔢 Core Numbers", (ctx) => {
  ctx.reply("📅 Send your DOB (DD-MM-YYYY) to unlock your numbers 🔢");
});

bot.hears("🌌 Time Energy", (ctx) => {
  ctx.reply("⏳ Send your DOB to see current time energies");
});

bot.hears("🔮 Get Guidance", (ctx) => {
  ctx.reply(`
🔮 Cosmic Guidance

✨ Your path is shaped by deeper forces.
Align your actions with your inner voice.

👉 Type GUIDE or send DOB
  `);
});

bot.hears("💎 Premium Reading", (ctx) => {
  ctx.reply(`
💎 Unlock Full Reading

💖 Love | 💼 Career | 💰 Money | 📿 Remedies

👉 https://wa.me/91XXXXXXXXXX
  `);
});

// 🧿 MAIN TEXT HANDLER (NO CONFLICT)
bot.on('text', (ctx) => {
  const text = ctx.message.text.trim().toLowerCase();

  // 🔮 GUIDE HANDLER
  if (text === "guide") {
    return ctx.reply(`
🔮 Cosmic Guidance Activated

✨ You are on a path shaped by your numbers.
Trust your intuition and align your actions.

💞 For full personal reading:
👉 https://wa.me/91XXXXXXXXXX
    `);
  }

  // ❌ INVALID FORMAT
  if (!text.match(/^\d{2}-\d{2}-\d{4}$/)) {
    return ctx.reply("❌ Send DOB in format: DD-MM-YYYY");
  }

  // 🔢 CALCULATE NUMBERS
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

// 🧿 START BOT
bot.launch();

// 🧿 KEEP RENDER ALIVE (PORT FIX)
const app = express();

app.get('/', (req, res) => {
  res.send('CosmicPot Bot is running 🧿');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

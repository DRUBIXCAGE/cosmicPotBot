const { Telegraf } = require('telegraf');
const express = require('express');
const { getFullNumerology } = require('./numberEngine');
const dataSet = require('./data.json');

const bot = new Telegraf(process.env.BOT_TOKEN);

// 🧿 START MENU
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

// 🧿 BUTTONS
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

// 🧿 MAIN LOGIC
bot.on('text', (ctx) => {
  const text = ctx.message.text.trim().toLowerCase();

  // GUIDE
  if (text === "guide") {
    return ctx.reply(`
🔮 Cosmic Guidance Activated

✨ You are on a path shaped by your numbers.
Trust your intuition and align your actions.

💞 For full personal reading:
👉 https://wa.me/91XXXXXXXXXX
    `);
  }

  // DOB VALIDATION
  if (!text.match(/^\d{2}-\d{2}-\d{4}$/)) {
    return ctx.reply("❌ Send DOB in format: DD-MM-YYYY");
  }

  const result = getFullNumerology(text);
  const destinyData = dataSet[result.destiny];

  ctx.reply(`
🧿 Your Cosmic Profile

🔢 Birth: ${result.birth}
🌌 Destiny: ${result.destiny}

✨ ${destinyData?.title || ""}

🧠 Traits:
${destinyData?.traits || "N/A"}

💪 Strengths:
${destinyData?.strengths || "N/A"}

⚠️ Weakness:
${destinyData?.weakness || "N/A"}

📿 Remedies:
${destinyData?.remedies?.join("\n") || "N/A"}

✨ Type GUIDE for deeper insight
  `);
});

// 🧿 START BOT
bot.launch();

// 🧿 KEEP RENDER ALIVE
const app = express();

app.get('/', (req, res) => {
  res.send('CosmicPot Bot is running 🧿');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

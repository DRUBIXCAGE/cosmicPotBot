const { Telegraf } = require('telegraf');
const express = require('express');
const { getFullNumerology } = require('./numberEngine');
const numerologyData = require('./numerologyData.json');

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

// 🧿 MAIN HANDLER
bot.on('text', (ctx) => {
  const text = ctx.message.text.trim();

  // 🔮 GUIDE COMMAND
  if (text.toLowerCase() === "guide") {
    return ctx.reply(`
🔮 Cosmic Guidance Activated

✨ Your journey is guided by unseen forces.
Trust your intuition and align your actions.

💞 For full personal reading:
👉 https://wa.me/91XXXXXXXXXX
    `);
  }

  // ❌ INVALID FORMAT
  if (!text.match(/^\d{2}-\d{2}-\d{4}$/)) {
    return ctx.reply("❌ Send DOB in format: DD-MM-YYYY");
  }

  // 🧠 GET NUMBERS
  const result = getFullNumerology(text);

  // 📦 FETCH DATA
  const destinyData = numerologyData[result.destiny] || {};
  const birthData = numerologyData[result.birth] || {};

  // 🧿 RESPONSE
  ctx.reply(`
🧿 Your Cosmic Profile

🔢 Birth Number: ${result.birth}
🌌 Destiny Number: ${result.destiny}

✨ ${destinyData.title || ""}

🧠 Traits:
${destinyData.traits || "N/A"}

💪 Strengths:
${destinyData.strengths || "N/A"}

⚠️ Weakness:
${destinyData.weakness || "N/A"}

📿 Remedies:
${destinyData.remedies ? destinyData.remedies.join(", ") : "N/A"}

⏳ Personal Energy

📅 Year: ${result.personalYear}
📆 Month: ${result.personalMonth}
📍 Day: ${result.personalDay}

✨ Type GUIDE for deeper insight
  `);
});

// 🚀 START BOT
bot.launch();

// 🌐 KEEP SERVER ALIVE (Render Fix)
const app = express();

app.get('/', (req, res) => {
  res.send('🧿 CosmicPot Bot is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

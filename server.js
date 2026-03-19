const { Telegraf } = require('telegraf');
const express = require('express');
const { getFullNumerology } = require('./numberEngine');
const numerologyData = require('./numerologyData.json');

const bot = new Telegraf(process.env.BOT_TOKEN);

// 🧿 START
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

  // 🔮 GUIDE
  if (text.toLowerCase() === "guide") {
    return ctx.reply(`
🔮 Cosmic Guidance Activated

✨ Your numbers show a deeper path waiting to unfold.
Trust your intuition and act with clarity.

💞 Get your FULL PERSONAL REPORT:
👉 https://wa.me/91XXXXXXXXXX

⚡ Limited personalized reading available
    `);
  }

  // ❌ INVALID FORMAT
  if (!text.match(/^\d{2}-\d{2}-\d{4}$/)) {
    return ctx.reply("❌ Send DOB in format: DD-MM-YYYY");
  }

  // 🧠 CALCULATE
  const result = getFullNumerology(text);

  // 📦 FETCH DATA
  const birthData = numerologyData[result.birth] || {};
  const destinyData = numerologyData[result.destiny] || {};

  // 🧿 RESPONSE (COMBINED LOGIC)
  ctx.reply(`
🧿 Your Cosmic Profile

🔢 Birth Number: ${result.birth}
🌌 Destiny Number: ${result.destiny}

✨ Personality (Birth Energy):
${birthData.traits || "N/A"}

✨ Life Path (Destiny Energy):
${destinyData.traits || "N/A"}

🧠 Combined Insight:
You act as ${birthData.title || "a unique personality"} 
while your life path leads you towards ${destinyData.title || "a higher purpose"}.

💪 Strength Blend:
${birthData.strengths || ""} + ${destinyData.strengths || ""}

⚠️ Challenge:
Balance between ${birthData.weakness || ""} 
and ${destinyData.weakness || ""}

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

// 🌐 KEEP RENDER ALIVE
const app = express();

app.get('/', (req, res) => {
  res.send('🧿 CosmicPot Bot is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

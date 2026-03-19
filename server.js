const { Telegraf } = require('telegraf');
const express = require('express');
const { getFullNumerology } = require('./numberEngine');
const data = require('./numerologyData.json');

const bot = new Telegraf(process.env.BOT_TOKEN);

// 🧿 MENU FUNCTION
function showMenu(ctx) {
  return ctx.reply("🧿 Choose your next step:", {
    reply_markup: {
      keyboard: [
        ["🔢 Core Numbers", "🌌 Time Energy"],
        ["🔮 Get Guidance", "💎 Premium Reading"]
      ],
      resize_keyboard: true
    }
  });
}

// 🧿 START
bot.start((ctx) => {
  ctx.reply(`
🧿 Welcome to CosmicPot

Send your DOB in format:
DD-MM-YYYY
  `);

  showMenu(ctx);
});

// 🧿 BUTTON HANDLERS
bot.hears("🔢 Core Numbers", (ctx) => {
  ctx.reply("📩 Send your DOB to calculate your core numbers");
});

bot.hears("🌌 Time Energy", (ctx) => {
  ctx.reply("📩 Send your DOB to check your current energy");
});

bot.hears("🔮 Get Guidance", (ctx) => {
  ctx.reply(`
🔮 Cosmic Guidance

👉 https://wa.me/91XXXXXXXXXX
  `);

  showMenu(ctx);
});

bot.hears("💎 Premium Reading", (ctx) => {
  ctx.reply(`
💎 Premium Reading

Unlock full life analysis + remedies

👉 https://wa.me/91XXXXXXXXXX
  `);

  showMenu(ctx);
});

// 🧿 MAIN TEXT HANDLER
bot.on('text', (ctx) => {
  const text = ctx.message.text.trim();

  // GUIDE COMMAND
  if (text.toLowerCase() === "guide") {
    ctx.reply(`
🔮 Cosmic Guidance Activated

✨ You are on a path shaped by your numbers.
Trust your intuition and align your actions.

👉 https://wa.me/91XXXXXXXXXX
    `);

    return showMenu(ctx);
  }

  // DOB VALIDATION
  if (!text.match(/^\d{2}-\d{2}-\d{4}$/)) {
    ctx.reply("❌ Send DOB in format: DD-MM-YYYY");
    return showMenu(ctx);
  }

  const result = getFullNumerology(text);

  const birthData = data[result.birth] || {};
  const destinyData = data[result.destiny] || {};

  ctx.reply(`
🧿 Your Cosmic Profile

🔢 Birth Number: ${result.birth}
🌌 Destiny Number: ${result.destiny}

✨ Personality (Birth Energy):
${birthData.traits || "N/A"}

✨ Life Path (Destiny Energy):
${destinyData.traits || "N/A"}

🧠 Combined Insight:
You act as ${birthData.title || "your core self"}
while your life path leads you towards ${destinyData.title || "growth"}.

💪 Strength Blend:
${birthData.strengths || ""} + ${destinyData.strengths || ""}

⚠️ Challenge:
${birthData.weakness || ""} + ${destinyData.weakness || ""}

📿 Remedies:
${destinyData.remedies ? destinyData.remedies.join(", ") : "N/A"}

⏳ Personal Energy

📅 Year: ${result.personalYear}
📆 Month: ${result.personalMonth}
📍 Day: ${result.personalDay}

✨ Tap "🔮 Get Guidance" for deeper insight
  `);

  showMenu(ctx);
});

// 🧿 LAUNCH BOT
bot.launch();

// 🧿 KEEP RENDER ALIVE
const app = express();

app.get('/', (req, res) => {
  res.send('CosmicPot Bot Running 🧿');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const { Telegraf } = require('telegraf');
const express = require('express');
const { getFullNumerology } = require('./numberEngine');
const data = require('./numerologyData.json');

const bot = new Telegraf(process.env.BOT_TOKEN);

// MENU
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

// START
bot.start((ctx) => {
  ctx.reply("🧿 Welcome to CosmicPot\nSend DOB: DD-MM-YYYY");
  showMenu(ctx);
});

// BUTTONS
bot.hears("🔢 Core Numbers", (ctx) => ctx.reply("Send DOB"));
bot.hears("🌌 Time Energy", (ctx) => ctx.reply("Send DOB"));
bot.hears("🔮 Get Guidance", (ctx) => {
  ctx.reply("👉 https://wa.me/91XXXXXXXXXX");
  showMenu(ctx);
});
bot.hears("💎 Premium Reading", (ctx) => {
  ctx.reply("👉 https://wa.me/91XXXXXXXXXX");
  showMenu(ctx);
});

// MAIN
bot.on('text', (ctx) => {
  const text = ctx.message.text.trim();

  if (!text.match(/^\d{2}-\d{2}-\d{4}$/)) {
    ctx.reply("❌ Send DOB in DD-MM-YYYY");
    return showMenu(ctx);
  }

  const r = getFullNumerology(text);
  const d = data[r.destiny] || {};

  ctx.reply(`
🧿 Cosmic Profile

🔢 Birth: ${r.birth}
🌌 Destiny: ${r.destiny}

🪐 Planet: ${d.planet}
🎨 Lucky Colors: ${d.luckyColors?.join(", ")}
⚠️ Avoid: ${d.avoidColors?.join(", ")}

🖼️ Wallpaper: ${d.wallpaper}

🤝 Friends: ${d.friends}
⚔️ Foes: ${d.foes}

⚡ Actions: ${d.luckyActions?.join(", ")}

📿 Remedies: ${d.remedies?.join(", ")}

⏳ Energy:
Year: ${r.personalYear}
Month: ${r.personalMonth}
Day: ${r.personalDay}
  `);

  showMenu(ctx);
});

// RUN
bot.launch();

// KEEP ALIVE
const app = express();
app.get('/', (req, res) => res.send("Running"));
app.listen(process.env.PORT || 3000);

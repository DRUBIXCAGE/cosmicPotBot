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
  ctx.reply(`🧿 Welcome to CosmicPot

Send your DOB in format:
DD-MM-YYYY`);
  showMenu(ctx);
});

// BUTTONS
bot.hears("🔢 Core Numbers", (ctx) => {
  ctx.reply("📩 Send your DOB (DD-MM-YYYY)");
});

bot.hears("🌌 Time Energy", (ctx) => {
  ctx.reply("📩 Send your DOB to check your energy");
});

bot.hears("🔮 Get Guidance", (ctx) => {
  ctx.reply(`🔮 Cosmic Guidance

👉 https://wa.me/91XXXXXXXXXX`);
  showMenu(ctx);
});

bot.hears("💎 Premium Reading", (ctx) => {
  ctx.reply(`💎 Premium Reading

👉 https://wa.me/91XXXXXXXXXX`);
  showMenu(ctx);
});

// MAIN
bot.on('text', (ctx) => {
  const text = ctx.message.text.trim();

  if (!text.match(/^\d{2}-\d{2}-\d{4}$/)) {
    ctx.reply("❌ Send DOB in format: DD-MM-YYYY");
    return showMenu(ctx);
  }

  const result = getFullNumerology(text);

  const birthData = data[result.birth] || {};
  const destinyData = data[result.destiny] || {};

  ctx.reply(`
🧿 Cosmic Profile Revealed

🔢 Birth Number: ${result.birth}
🌌 Destiny Number: ${result.destiny}

━━━━━━━━━━━━━━━

✨ Your Core Personality

You carry the vibration of *${birthData.title}*.  
This makes you naturally ${birthData.traits}.

In real life:
• ${birthData.strengths}

⚠️ Challenge:
${birthData.weakness}

---

🌌 Your Life Path

You are evolving into:
👉 ${destinyData.title}

Your journey pushes you toward:
• ${destinyData.traits}

---

🧠 Combined Insight

You act like ${birthData.title}  
But life is shaping you into ${destinyData.title}

---

🪐 Alignment

Planet: ${birthData.planet}  
Lucky Color: ${birthData.colors}  
Avoid: ${birthData.avoid}

---

🤝 Compatibility

Friends: ${birthData.friends}  
Foes: ${birthData.foes}

---

⚡ Action

${birthData.action}

📿 Remedy:
${destinyData.remedies?.join(", ")}

---

⏳ Energy

Year: ${result.personalYear}  
Month: ${result.personalMonth}  
Day: ${result.personalDay}

---

💎 Full Reading:
https://wa.me/91XXXXXXXXXX

━━━━━━━━━━━━━━━
✨ Tap "🔮 Get Guidance"
  `);

  showMenu(ctx);
});

// LAUNCH
bot.launch();

// KEEP ALIVE
const app = express();

app.get('/', (req, res) => {
  res.send('CosmicPot Running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);

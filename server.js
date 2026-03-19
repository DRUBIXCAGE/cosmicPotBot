const { Telegraf } = require('telegraf');
const express = require('express');
const { getFullNumerology } = require('./numberEngine');
const data = require('./numerologyData.json');

const bot = new Telegraf(process.env.BOT_TOKEN);

// 🧿 MENU
function showMenu(ctx) {
  return ctx.reply("🧿 Choose your next step:", {
    reply_markup: {
      keyboard: [
        ["🔢 Core Numbers", "💘 Love Match"],
        ["🌌 Time Energy", "🔮 Get Guidance"],
        ["💎 Premium Reading"]
      ],
      resize_keyboard: true
    }
  });
}

// 🧿 START
bot.start((ctx) => {
  ctx.reply(`🧿 Welcome to CosmicPot

Send your DOB in format:
DD-MM-YYYY`);
  showMenu(ctx);
});

// 🧿 BUTTONS
bot.hears("🔢 Core Numbers", (ctx) => {
  ctx.reply("📩 Send your DOB (DD-MM-YYYY)");
});

bot.hears("🌌 Time Energy", (ctx) => {
  ctx.reply("📩 Send your DOB to check your energy");
});

bot.hears("🔮 Get Guidance", (ctx) => {
  ctx.reply(`🔮 Cosmic Guidance

👉 https://wa.me/917895424239`);
  showMenu(ctx);
});

bot.hears("💎 Premium Reading", (ctx) => {
  ctx.reply(`💎 Premium Reading

👉 https://wa.me/917895424239`);
  showMenu(ctx);
});

// 🧿 LOVE MATCH MODE
let loveMode = {};

bot.hears("💘 Love Match", (ctx) => {
  loveMode[ctx.chat.id] = true;
  ctx.reply("💘 Send your DOB (DD-MM-YYYY)");
});

// 🧿 MAIN HANDLER
bot.on('text', (ctx) => {
  const text = ctx.message.text.trim();

  // 💘 LOVE MATCH FLOW (STEP 1)
  if (loveMode[ctx.chat.id] === true) {
    if (!text.match(/^\d{2}-\d{2}-\d{4}$/)) {
      return ctx.reply("❌ Send DOB in DD-MM-YYYY");
    }

    loveMode[ctx.chat.id] = text;
    return ctx.reply("💘 Now send your partner's DOB");
  }

  // 💘 LOVE MATCH FLOW (STEP 2)
  if (typeof loveMode[ctx.chat.id] === "string") {
    if (!text.match(/^\d{2}-\d{2}-\d{4}$/)) {
      return ctx.reply("❌ Send DOB in DD-MM-YYYY");
    }

    const dob1 = loveMode[ctx.chat.id];
    const dob2 = text;
    delete loveMode[ctx.chat.id];

    const r1 = getFullNumerology(dob1);
    const r2 = getFullNumerology(dob2);

    const score = (r1.destiny + r2.destiny) % 9 || 9;

    ctx.reply(`
💘 Love Compatibility Result

🔢 You: ${r1.destiny}
🔢 Partner: ${r2.destiny}

✨ Score: ${score}/9

${
  score >= 7
    ? "🔥 Strong emotional and spiritual bond"
    : score >= 4
    ? "⚖️ Balanced but requires effort"
    : "⚡ Challenging connection with karmic lessons"
}

🔮 This connection has deeper hidden layers...

👉 Full compatibility reading:
https://wa.me/917895424239
`);

    showMenu(ctx);
    return;
  }

  // 🧿 DOB VALIDATION
  if (!text.match(/^\d{2}-\d{2}-\d{4}$/)) {
    ctx.reply("❌ Send DOB in format: DD-MM-YYYY");
    return showMenu(ctx);
  }

  const result = getFullNumerology(text);
  const d = data[result.birth] || {};

  // 🧿 MAIN RESPONSE
  ctx.reply(`
🧿 Numerology Report

🔢 Number: ${result.birth} (Moolank ${result.birth})
🪐 Ruling Planet: ${d.planet}

📅 Birth Dates: ${d.dates}

━━━━━━━━━━━━━━━

✨ Personal Characteristics

🔹 Nature:
${d.nature}

🔹 Personality:
${d.personality}

🔹 Core Qualities:
${d.qualities}

🌟 Famous Personalities:
${d.famous}

━━━━━━━━━━━━━━━

💼 Professional & Health Profile

💼 Career:
${d.career}

🎨 Lucky Colors:
${d.colors}

🔢 Lucky Numbers:
${d.luckyNumbers}

⚕️ Health:
${d.health}

📆 Significant Years:
${d.years}

━━━━━━━━━━━━━━━

❤️ Relationships

🤝 Compatible Numbers:
${d.compatible}

⚠️ Challenges:
${d.relationshipIssues}

━━━━━━━━━━━━━━━

📿 Remedies (Upay)

🌅 Daily Ritual:
${d.dailyRitual}

🧘 Manifestation:
${d.manifestation}

✋ Mudra:
${d.mudra}

🗓️ Practice:
${d.specialPractice}

⚙️ Lifestyle:
${d.lifestyle}

📌 Priority Dates:
${d.priorityDates}

🖼️ Wallpapers:
${d.wallpapers}

━━━━━━━━━━━━━━━

🌺 Navratri Remedies

${d.navratri}

━━━━━━━━━━━━━━━

🔮 Insight

This number is ruled by ${d.planet}.  
Your life revolves around ${d.coreTheme}.

⚠️ Important:

Your numbers show deeper patterns affecting:
• Career  
• Relationships  
• Financial flow  

---

💎 Full Personal Reading:

📲 Telegram:
https://t.me/drubixCage

💬 WhatsApp:
https://wa.me/917895424239

━━━━━━━━━━━━━━━
✨ Tap "🔮 Get Guidance"
`);

  // 📤 SHARE LOOP
  ctx.reply(`
📤 Share with friends:

https://t.me/drubixCage
`);

  showMenu(ctx);
});

// 🧿 START BOT
bot.launch();

// 🧿 KEEP ALIVE FOR RENDER
const app = express();

app.get('/', (req, res) => {
  res.send('CosmicPot Running 🧿');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);

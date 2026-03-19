const { Telegraf } = require('telegraf');
const express = require('express');
const { getFullNumerology } = require('./numberEngine');
const data = require('./numerologyData.json');

const bot = new Telegraf(process.env.BOT_TOKEN);

// 🧠 MEMORY
let userData = {};
let userMode = {};
let loveMode = {};

// 🧿 NORMALIZE DOB
function normalizeDOB(input) {
  const cleaned = input.replace(/[\/\s]/g, "-");
  const parts = cleaned.split("-");
  if (parts.length !== 3) return null;

  let [d, m, y] = parts;

  if (y.length === 2) y = "19" + y;
  if (d.length === 1) d = "0" + d;
  if (m.length === 1) m = "0" + m;

  const final = `${d}-${m}-${y}`;
  if (!final.match(/^\d{2}-\d{2}-\d{4}$/)) return null;

  return final;
}

// 🧿 MENU
function showMenu(ctx) {
  return ctx.reply("🧿 Choose your next step:", {
    reply_markup: {
      keyboard: [
        ["🔢 Core Energy", "💘 Love Match"],
        ["🌌 Time Energy", "🔮 Get Guidance"],
        ["💎 Premium Reading"]
      ],
      resize_keyboard: true
    }
  });
}

// 🧿 START
bot.start((ctx) => {
  ctx.reply("🧿 Welcome to CosmicPot\nSend your DOB (DD-MM-YYYY)");
  showMenu(ctx);
});

// 🧿 BUTTONS
function handleDOBPrompt(ctx, mode) {
  userMode[ctx.chat.id] = mode;
  const user = userData[ctx.chat.id];

  if (user?.dob) {
    return ctx.reply(`
📌 Your saved DOB: ${user.dob}

1️⃣ Use this DOB  
2️⃣ Enter new DOB
`);
  }

  ctx.reply("📩 Send your DOB");
}

bot.hears("🔢 Core Energy", (ctx) => handleDOBPrompt(ctx, "core"));
bot.hears("🌌 Time Energy", (ctx) => handleDOBPrompt(ctx, "time"));
bot.hears("🔮 Get Guidance", (ctx) => handleDOBPrompt(ctx, "guide"));

bot.hears("💎 Premium Reading", (ctx) => {
  ctx.reply(`💎 Premium Reading

👉 https://wa.me/917895424239`);
  showMenu(ctx);
});

// 💘 LOVE MATCH
bot.hears("💘 Love Match", (ctx) => {
  loveMode[ctx.chat.id] = true;
  ctx.reply("💘 Send your DOB");
});

// 🧿 MAIN HANDLER
bot.on('text', (ctx) => {
  let text = ctx.message.text.trim();

  // USE SAVED DOB
  if (text === "1") {
    const user = userData[ctx.chat.id];
    if (!user?.dob) return ctx.reply("❌ No saved DOB");
    text = user.dob;
  }

  if (text === "2") {
    return ctx.reply("📩 Send new DOB");
  }

  // 💘 LOVE MATCH STEP 1
  if (loveMode[ctx.chat.id] === true) {
    const dob = normalizeDOB(text);
    if (!dob) return ctx.reply("❌ Invalid DOB");

    loveMode[ctx.chat.id] = dob;
    return ctx.reply("💘 Now send partner DOB");
  }

  // 💘 LOVE MATCH STEP 2
  if (typeof loveMode[ctx.chat.id] === "string") {
    const dob2 = normalizeDOB(text);
    if (!dob2) return ctx.reply("❌ Invalid DOB");

    const dob1 = loveMode[ctx.chat.id];
    delete loveMode[ctx.chat.id];

    const r1 = getFullNumerology(dob1);
    const r2 = getFullNumerology(dob2);

    const score = (r1.destiny + r2.destiny) % 9 || 9;

    ctx.reply(`
💘 Love Compatibility

You: ${r1.destiny}
Partner: ${r2.destiny}

Score: ${score}/9

${
  score >= 7
    ? "🔥 Strong bond"
    : score >= 4
    ? "⚖️ Balanced"
    : "⚡ Challenging"
}

👉 https://wa.me/917895424239
`);

    return showMenu(ctx);
  }

  // 🧿 NORMAL DOB FLOW
  const dob = normalizeDOB(text);
  if (!dob) {
    ctx.reply("❌ Send DOB like 27-10-1997");
    return showMenu(ctx);
  }

  // SAVE DOB
  userData[ctx.chat.id] = {
    ...userData[ctx.chat.id],
    dob
  };

  const mode = userMode[ctx.chat.id] || "core";
  const result = getFullNumerology(dob);
  const d = data[result.birth] || {};

  // 🔢 CORE
  if (mode === "core") {
    ctx.reply(`
🔢 Core Energy

Birth: ${result.birth}
Destiny: ${result.destiny}

You are ${d.title}
Traits: ${d.traits}
`);
    return showMenu(ctx);
  }

  // 🌌 TIME
  if (mode === "time") {
    ctx.reply(`
🌌 Time Energy

Year: ${result.personalYear}
Month: ${result.personalMonth}
Day: ${result.personalDay}
`);
    return showMenu(ctx);
  }

  // 🔮 GUIDE
  if (mode === "guide") {
    ctx.reply(`
🔮 Guidance

Planet: ${d.planet}

Focus: ${d.action}

Remedy: ${d.remedies?.join(", ")}

👉 https://wa.me/917895424239
`);
    return showMenu(ctx);
  }
});

// 🧿 START BOT
bot.launch();

// 🧿 KEEP ALIVE
const app = express();
app.get('/', (req, res) => res.send('Running'));
app.listen(process.env.PORT || 3000);

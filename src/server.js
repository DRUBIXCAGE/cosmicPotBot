const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const { getFullNumerology } = require('./numberEngine');

// ✅ Load numerology data
const numerologyData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'numerologyData.json'), 'utf-8')
);

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: {
    interval: 300,
    autoStart: true,
    params: { timeout: 10 }
  }
});

// ✅ Store user state
const userState = {};

// =========================
// HELPERS
// =========================

function isDOB(text) {
  return /^(\d{1,2})[-\/ ](\d{1,2})[-\/ ](\d{2,4})$/.test(text);
}

function formatDOB(text) {
  const match = text.match(/^(\d{1,2})[-\/ ](\d{1,2})[-\/ ](\d{2,4})$/);
  if (!match) return null;

  let [_, d, m, y] = match;
  if (y.length === 2) y = "19" + y;

  return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
}

function sendMenu(chatId) {
  bot.sendMessage(chatId, "✨ Choose what you want to explore:", {
    reply_markup: {
      keyboard: [
        ["🔢 Core Energy", "🌌 Time Energy"],
        ["💞 Love Match", "🔮 Guidance"]
      ],
      resize_keyboard: true
    }
  });
}

// =========================
// 🔮 FINAL RESPONSE ENGINE
// =========================

function generateReading(dob, result) {
  try {
    const birthData = numerologyData[result.birth];
    const destinyData = numerologyData[result.destiny];

    if (!birthData) {
      return "⚠️ Unable to read your birth energy.";
    }

    return `🔮 *Your Cosmic Blueprint*

You were not born randomly.

Your date *${dob}* carries a pattern...  
and that pattern is quietly shaping your life.

━━━━━━━━━━━━━━━

✨ *Birth Energy (${result.birth})*  
🌟 Planet: ${birthData.planet}

🧠 *Personality*  
${birthData.personality}

✨ *Strengths*  
${birthData.qualities.join(', ')}

⚠️ *Challenges*  
${birthData.relationshipIssues.join(', ')}

🎯 *Core Theme*  
${birthData.coreTheme}

━━━━━━━━━━━━━━━

🌌 *Destiny Path (${result.destiny})*  
${destinyData ? destinyData.coreTheme : "Still unfolding..."}

This is not who you are…  
this is who you are becoming.

━━━━━━━━━━━━━━━

⚡ *Daily Alignment*  
${birthData.dailyRitual}

🎨 Colors: ${birthData.colors.join(', ')}  
🔢 Numbers: ${birthData.luckyNumbers.join(', ')}

━━━━━━━━━━━━━━━

🧿 You’re not confused.  
You’re just beginning to understand yourself.

✨ Choose what to explore next 👇`;

  } catch (err) {
    console.error("Reading error:", err);
    return "⚠️ Error generating reading.";
  }
}

// =========================
// START COMMAND
// =========================

bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
`🔮 Welcome to CosmicPot

Some people come here casually...

But some arrive because something inside them  
has been quietly asking questions.

📩 Send your Date of Birth  
(DD-MM-YYYY or DD/MM/YYYY)

Example: 27-10-1997`
  );
});

// =========================
// MAIN HANDLER
// =========================

bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (!text) return;

  console.log("User:", text);

  try {
    if (text.startsWith('/start')) return;

    // =========================
    // DOB INPUT
    // =========================
    if (isDOB(text)) {
      const dob = formatDOB(text);

      if (!dob) {
        await bot.sendMessage(chatId, "⚠️ Invalid date format.");
        return;
      }

      userState[chatId] = { dob };

      const result = getFullNumerology(dob);

      if (!result || !result.birth) {
        await bot.sendMessage(chatId, "⚠️ Unable to calculate numerology.");
        return;
      }

      const reply = generateReading(dob, result);

      await bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });

      sendMenu(chatId);
      return;
    }

    // =========================
    // CORE ENERGY
    // =========================
    if (text === "🔢 Core Energy") {
      const user = userState[chatId];

      if (!user?.dob) {
        await bot.sendMessage(chatId, "📩 Please send your DOB first.");
        return;
      }

      const result = getFullNumerology(user.dob);
      const reply = generateReading(user.dob, result);

      await bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });

      sendMenu(chatId);
      return;
    }

    // =========================
    // TIME ENERGY
    // =========================
    if (text === "🌌 Time Energy") {
      const user = userState[chatId];

      if (!user?.dob) {
        await bot.sendMessage(chatId, "📩 Please send your DOB first.");
        return;
      }

      const result = getFullNumerology(user.dob);

      await bot.sendMessage(chatId,
`🌌 *Your Time Energy*

Year: ${result.personalYear || "-"}  
Month: ${result.personalMonth || "-"}  
Day: ${result.personalDay || "-"}

You are in a phase that is shaping your next decisions.`,
        { parse_mode: "Markdown" }
      );

      sendMenu(chatId);
      return;
    }

    // =========================
    // LOVE
    // =========================
    if (text === "💞 Love Match") {
      await bot.sendMessage(chatId,
`💞 Send both DOBs like:

27-10-1997 & 14-02-1998`
      );
      return;
    }

    // =========================
    // GUIDANCE
    // =========================
    if (text === "🔮 Guidance") {
      await bot.sendMessage(chatId,
`🔮 For deeper guidance:

👉 WhatsApp: https://wa.me/917895424239  
👉 Telegram: https://t.me/dRubixCage`
      );
      return;
    }

    // =========================
    // DEFAULT
    // =========================
    await bot.sendMessage(chatId,
"📩 Send your Date of Birth (DD-MM-YYYY)"
    );

  } catch (err) {
    console.error("Main handler error:", err);
    bot.sendMessage(chatId, "⚠️ Something went wrong. Try again.");
  }
});

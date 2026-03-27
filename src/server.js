const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const { getFullNumerology } = require('./numberEngine');

// ✅ Load data correctly from src folder
const numerologyData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'numerologyData.json'), 'utf-8')
);

// ✅ BOT TOKEN
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// ✅ In-memory user state
const userState = {};

// ✅ MENU
function sendMenu(chatId) {
  bot.sendMessage(chatId, "✨ What do you want to explore next?", {
    reply_markup: {
      keyboard: [
        ["🔢 Core Energy", "💞 Love Match"],
        ["🌌 Time Energy", "🔮 Get Guidance"],
        ["💎 Premium Reading"]
      ],
      resize_keyboard: true
    }
  });
}

// ✅ FORMAT RESPONSE (EMOTIONAL + DEEP)
function generateCoreReading(dob, result) {
  const birthData = numerologyData[result.birth] || {};
  const destinyData = numerologyData[result.destiny] || {};

  return `🔮 *Your Cosmic Blueprint is unfolding...*

You were not born randomly.

Your date *${dob}* carries a pattern...  
and that pattern is speaking.

━━━━━━━━━━━━━━━

✨ *Your Birth Energy (${result.birth})*  
${birthData.title || "Unknown Energy"}

You naturally carry traits like:  
${birthData.traits || "..."}

But what makes you powerful is:  
${birthData.strengths || "..."}

⚠️ Deep inside, your challenge has always been:  
${birthData.weakness || "..."}

━━━━━━━━━━━━━━━

🌌 *Your Destiny Path (${result.destiny})*  
${destinyData.title || "Unknown Path"}

This is not who you are…  
this is who you are becoming.

You are meant to grow into:  
${destinyData.traits || "..."}

And life keeps pushing you toward:  
${destinyData.strengths || "..."}

━━━━━━━━━━━━━━━

🧿 *Hidden Truth About You*

There are moments in your life where you feel:  
"Why do I feel different from others?"

That’s not confusion.  
That’s alignment trying to happen.

━━━━━━━━━━━━━━━

⚡ *What You Should Do Right Now*

${(birthData.remedies || []).join('\n')}

━━━━━━━━━━━━━━━

If this felt *a little too accurate...*

👉 WhatsApp: https://wa.me/917895424239  
👉 Telegram: https://t.me/drubixCage

Some answers require going deeper than numbers.`;
}

// ✅ MESSAGE HANDLER
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (!text) return;

  // =========================
  // START
  // =========================
  if (text === '/start') {
    bot.sendMessage(chatId,
`🔮 Welcome to CosmicPot

Some people come here casually...

But some arrive because something inside them  
has been quietly asking questions.

If you're here, you're probably the second one.

📩 Send your Date of Birth  
(DD-MM-YYYY or DD/MM/YYYY)`
    );
    return;
  }

  // =========================
  // HANDLE OPTION 1 / 2
  // =========================
  if (text === "1" && userState[chatId]?.dob) {
    const dob = userState[chatId].dob;
    const result = getFullNumerology(dob);

    bot.sendMessage(chatId, generateCoreReading(dob, result), {
      parse_mode: "Markdown"
    });

    sendMenu(chatId);
    return;
  }

  if (text === "2") {
    delete userState[chatId];
    bot.sendMessage(chatId, "📅 Send your new DOB");
    return;
  }

  // =========================
  // HANDLE DOB INPUT (ALL FORMATS)
  // =========================
  const dobMatch = text.match(/^(\d{1,2})[-\/ ](\d{1,2})[-\/ ](\d{2,4})$/);

  if (dobMatch) {
    let [_, d, m, y] = dobMatch;

    if (y.length === 2) y = "19" + y;

    const dob = `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;

    userState[chatId] = { dob };

    bot.sendMessage(chatId,
`📌 I remember your DOB: *${dob}*

Do you want to go deeper with this  
or explore something new?

1️⃣ Use this DOB  
2️⃣ Enter new DOB`,
      { parse_mode: "Markdown" }
    );

    return;
  }

  // =========================
  // CORE ENERGY
  // =========================
  if (text.includes("Core Energy")) {
    if (!userState[chatId]?.dob) {
      bot.sendMessage(chatId, "📩 Send your DOB first");
      return;
    }

    const dob = userState[chatId].dob;
    const result = getFullNumerology(dob);

    bot.sendMessage(chatId, generateCoreReading(dob, result), {
      parse_mode: "Markdown"
    });

    sendMenu(chatId);
    return;
  }

  // =========================
  // LOVE MATCH
  // =========================
  if (text.includes("Love")) {
    userState[chatId].loveMode = true;
    bot.sendMessage(chatId, "💞 Send your DOB first");
    return;
  }

  // =========================
  // TIME ENERGY
  // =========================
  if (text.includes("Time")) {
    if (!userState[chatId]?.dob) {
      bot.sendMessage(chatId, "📩 Send your DOB first");
      return;
    }

    const result = getFullNumerology(userState[chatId].dob);

    bot.sendMessage(chatId,
`🌌 Your current time energy:

Year: ${result.personalYear}  
Month: ${result.personalMonth}  
Day: ${result.personalDay}

You're in a cycle that's shaping your next move.`
    );

    sendMenu(chatId);
    return;
  }

  // =========================
  // GUIDANCE
  // =========================
  if (text.includes("Guidance")) {
    bot.sendMessage(chatId,
`🔮 Sometimes one insight can change everything.

👉 WhatsApp: https://wa.me/917895424239  
👉 Telegram: https://t.me/drubixCage`
    );
    return;
  }

});

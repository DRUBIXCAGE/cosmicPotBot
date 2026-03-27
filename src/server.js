const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const { getFullNumerology } = require('./numberEngine');

// ✅ Load numerology data
const numerologyData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'numerologyData.json'), 'utf-8')
);

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// ✅ Store user state
const userState = {};

// =========================
// HELPERS
// =========================

// Validate DOB
function isDOB(text) {
  return /^(\d{1,2})[-\/ ](\d{1,2})[-\/ ](\d{2,4})$/.test(text);
}

// Format DOB
function formatDOB(text) {
  const match = text.match(/^(\d{1,2})[-\/ ](\d{1,2})[-\/ ](\d{2,4})$/);
  if (!match) return null;

  let [_, d, m, y] = match;
  if (y.length === 2) y = "19" + y;

  return `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;
}

// Menu
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

// Safe reading generator
function generateReading(dob, result) {
  try {
    const data = numerologyData[result.birth];

    if (!data) return "⚠️ Unable to read your numerology data.";

    return `🔮 *Your Cosmic Reading*

📅 DOB: *${dob}*  
🔢 Birth Number: *${result.birth}*

━━━━━━━━━━━━━━━

🌟 *Planet*  
${data.planet}

🧠 *Personality*  
${data.personality}

✨ *Strengths*  
${data.qualities.join(', ')}

⚠️ *Challenges*  
${data.relationshipIssues.join(', ')}

🎯 *Life Theme*  
${data.coreTheme}

━━━━━━━━━━━━━━━

⚡ *Do this daily*  
${data.dailyRitual}

🎨 Colors: ${data.colors.join(', ')}  
🔢 Numbers: ${data.luckyNumbers.join(', ')}

━━━━━━━━━━━━━━━

✨ Choose next option below 👇`;

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

Send your Date of Birth  
(DD-MM-YYYY or DD/MM/YYYY)

Example: 27-10-1997`
  );
});

// =========================
// MAIN HANDLER (STRICT FLOW)
// =========================
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (!text) return;

  console.log("User:", text);

  try {

    // Ignore /start duplicate
    if (text.startsWith('/start')) return;

    // =========================
    // 1. DOB INPUT (TOP PRIORITY)
    // =========================
    if (isDOB(text)) {
      const dob = formatDOB(text);

      if (!dob) {
        bot.sendMessage(chatId, "⚠️ Invalid date format.");
        return;
      }

      userState[chatId] = { dob };

      const result = getFullNumerology(dob);

      const reply = generateReading(dob, result);

      await bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });

      sendMenu(chatId);
      return;
    }

    // =========================
    // 2. CORE ENERGY
    // =========================
    if (text === "🔢 Core Energy") {
      const user = userState[chatId];

      if (!user || !user.dob) {
        bot.sendMessage(chatId, "📩 Please send your DOB first.");
        return;
      }

      const result = getFullNumerology(user.dob);
      const reply = generateReading(user.dob, result);

      await bot.sendMessage(chatId, reply, { parse_mode: "Markdown" });

      sendMenu(chatId);
      return;
    }

    // =========================
    // 3. TIME ENERGY
    // =========================
    if (text === "🌌 Time Energy") {
      const user = userState[chatId];

      if (!user || !user.dob) {
        bot.sendMessage(chatId, "📩 Please send your DOB first.");
        return;
      }

      const result = getFullNumerology(user.dob);

      await bot.sendMessage(chatId,
`🌌 *Time Energy*

Year: ${result.personalYear}
Month: ${result.personalMonth}
Day: ${result.personalDay}`,
        { parse_mode: "Markdown" }
      );

      sendMenu(chatId);
      return;
    }

    // =========================
    // 4. LOVE
    // =========================
    if (text === "💞 Love Match") {
      bot.sendMessage(chatId,
"💞 Send both DOBs like:\n27-10-1997 & 14-02-1998"
      );
      return;
    }

    // =========================
    // 5. GUIDANCE
    // =========================
    if (text === "🔮 Guidance") {
      bot.sendMessage(chatId,
`🔮 For deeper guidance:

👉 WhatsApp: https://wa.me/917895424239  
👉 Telegram: https://t.me/drubixCage`
      );
      return;
    }

    // =========================
    // DEFAULT RESPONSE
    // =========================
    bot.sendMessage(chatId,
"📩 Send your Date of Birth (DD-MM-YYYY)"
    );

  } catch (err) {
    console.error("Main handler error:", err);
    bot.sendMessage(chatId, "⚠️ Something went wrong. Try again.");
  }
});

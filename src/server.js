const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

const { getFullNumerology } = require('./numberEngine');

// ✅ Load correct data
const numerologyData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'numerologyData.json'), 'utf-8')
);

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// ✅ Store user state
const userState = {};

// 🌌 MENU
function sendMenu(chatId) {
  bot.sendMessage(chatId, "✨ What do you want to explore next?", {
    reply_markup: {
      keyboard: [
        ["🔢 Core Energy", "🌌 Time Energy"],
        ["💞 Love Match", "🔮 Guidance"]
      ],
      resize_keyboard: true
    }
  });
}

// 🔮 CLEAN RESPONSE (DATA-DRIVEN)
function generateReading(dob, result) {
  const data = numerologyData[result.birth];

  if (!data) return "⚠️ No data found.";

  return `🔮 *Your Cosmic Blueprint*

Your birth date *${dob}* is not random.

It carries a vibration… and that vibration shapes who you are.

━━━━━━━━━━━━━━━

🔢 *Birth Number: ${result.birth}*  
🌟 Planet: ${data.planet}

🧠 *Personality*  
${data.personality}

✨ *Core Strength*  
${data.qualities.join(', ')}

⚠️ *Life Challenge*  
${data.relationshipIssues.join(', ')}

🎯 *Your Core Theme*  
${data.coreTheme}

━━━━━━━━━━━━━━━

🧿 *A message for you*

You are not here to fit in.  
You are here to *express your pattern fully*.

The more you align with it…  
the less confusion you will feel.

━━━━━━━━━━━━━━━

⚡ *Your Ritual*  
${data.dailyRitual}

🎨 *Lucky Colors*  
${data.colors.join(', ')}

🔢 *Lucky Numbers*  
${data.luckyNumbers.join(', ')}

━━━━━━━━━━━━━━━

✨ Want to go deeper? Choose below 👇`;
}

// ✅ MESSAGE HANDLER
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();

  if (!text) return;

  console.log("User:", text);

  // =========================
  // START
  // =========================
  if (text === '/start') {
    bot.sendMessage(chatId,
`🔮 Welcome to CosmicPot

Some people come here out of curiosity...

But some arrive because something inside them  
has been quietly asking questions.

If you're here, you're probably the second one.

📩 Send your Date of Birth  
(DD-MM-YYYY or DD/MM/YYYY)`
    );
    return;
  }

  // =========================
  // DOB INPUT
  // =========================
  const dobMatch = text.match(/^(\d{1,2})[-\/ ](\d{1,2})[-\/ ](\d{2,4})$/);

  if (dobMatch) {
    let [_, d, m, y] = dobMatch;

    if (y.length === 2) y = "19" + y;

    const dob = `${d.padStart(2, '0')}-${m.padStart(2, '0')}-${y}`;

    userState[chatId] = { dob };

    const result = getFullNumerology(dob);

    const response = generateReading(dob, result);

    bot.sendMessage(chatId, response, { parse_mode: "Markdown" });

    sendMenu(chatId);
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

    bot.sendMessage(chatId, generateReading(dob, result), {
      parse_mode: "Markdown"
    });

    sendMenu(chatId);
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
`🌌 *Your Time Energy*

Year: ${result.personalYear}  
Month: ${result.personalMonth}  
Day: ${result.personalDay}

You are currently in a cycle of transformation.`,
      { parse_mode: "Markdown" }
    );

    sendMenu(chatId);
    return;
  }

  // =========================
  // LOVE MATCH
  // =========================
  if (text.includes("Love")) {
    bot.sendMessage(chatId, "💞 Love matching coming soon...");
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

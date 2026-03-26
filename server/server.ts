import express from "express";
import TelegramBot from "node-telegram-bot-api";
import path from "path";
import fs from "fs";
import multer from "multer";
import cors from "cors";

const upload = multer({ dest: "uploads/" });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Map to store bot instances: token -> bot
const bots = new Map<string, TelegramBot>();

// Store messages and chats per bot: token -> data
const botData = new Map<string, { messages: any[]; chats: any[]; lastError?: string }>();

// Health check
app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Memegram Backend Running" });
});

// API to check bot status
app.get("/api/bot/status", (req, res) => {
  const token = req.query.token as string;
  if (!token) return res.json({ initialized: false });
  const bot = bots.get(token);
  const data = botData.get(token);
  res.json({
    initialized: !!bot && bot.isPolling(),
    error: data?.lastError || null,
  });
});

// API to initialize bot
app.post("/api/bot/init", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Token required" });

  try {
    const existingBot = bots.get(token);
    if (existingBot && existingBot.isPolling()) {
      const me = await existingBot.getMe();
      return res.json({
        success: true,
        bot: { id: me.id, first_name: me.first_name, username: me.username },
      });
    }

    if (existingBot) {
      try {
        await existingBot.stopPolling();
      } catch (e) {
        console.error("Error stopping existing bot:", e);
      }
      bots.delete(token);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    const bot = new TelegramBot(token, { polling: false });
    const me = await bot.getMe();

    try {
      await bot.deleteWebHook({ drop_pending_updates: true });
    } catch (err) {
      console.warn(`[${me.username}] Webhook clear error:`, err);
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      bot.startPolling();
    } catch (pollError: any) {
      if (pollError.message.includes("409 Conflict")) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        bot.startPolling();
      } else {
        throw pollError;
      }
    }

    bots.set(token, bot);

    if (!botData.has(token)) {
      botData.set(token, { messages: [], chats: [] });
    }

    const data = botData.get(token)!;
    data.lastError = undefined;

    bot.on("message", async (msg) => {
      let chatExists = data.chats.find((c) => c.id === msg.chat.id);
      if (!chatExists) {
        let photoUrl = null;
        if (msg.from) {
          try {
            const photos = await bot.getUserProfilePhotos(msg.from.id, { limit: 1 });
            if (photos.total_count > 0) {
              const fileId = photos.photos[0][0].file_id;
              const file = await bot.getFile(fileId);
              photoUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
            }
          } catch (e) {
            console.error("Error fetching profile photo:", e);
          }
        }

        chatExists = {
          id: msg.chat.id,
          first_name: msg.chat.first_name || msg.chat.title || "Unknown",
          username: msg.chat.username,
          photoUrl: photoUrl,
          blocked: false,
        };
        data.chats.push(chatExists);
      }

      if (chatExists.blocked) return;

      const message = {
        id: msg.message_id.toString(),
        chatId: msg.chat.id,
        from: {
          id: msg.from?.id,
          first_name: msg.from?.first_name || "Unknown",
          username: msg.from?.username,
        },
        type: msg.photo
          ? "photo"
          : msg.video
          ? "video"
          : msg.document
          ? "document"
          : "text",
        content: msg.text ||
          (msg.photo
            ? msg.photo[msg.photo.length - 1].file_id
            : msg.video?.file_id || msg.document?.file_id || ""),
        caption: msg.caption,
        timestamp: msg.date * 1000,
      };

      if (message.type !== "text") {
        try {
          const file = await bot.getFile(message.content);
          (message as any).mediaUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
        } catch (e) {
          console.error("Error getting media URL:", e);
        }
      }

      data.messages.push(message);
    });

    bot.on("polling_error", async (error: any) => {
      if (!error.message.includes("409 Conflict")) {
        console.error(`Polling error for bot ${me.username}:`, error.message);
      }

      const data = botData.get(token);
      if (data) data.lastError = error.message;

      if (error.message.includes("409 Conflict")) {
        const currentBot = bots.get(token);
        if (currentBot === bot) {
          try {
            await bot.stopPolling();
          } catch (e) {
            console.error("Error stopping polling on 409:", e);
          }
        } else {
          try {
            await bot.stopPolling();
          } catch (e) {}
        }
      }
    });

    res.json({
      success: true,
      bot: { id: me.id, first_name: me.first_name, username: me.username },
    });
  } catch (error) {
    console.error("Bot init error:", error);
    res.status(500).json({ error: "Failed to init bot" });
  }
});

app.post("/api/bot/block", (req, res) => {
  const { token, chatId, blocked } = req.body;
  const data = botData.get(token);
  if (!data) return res.status(404).json({ error: "Bot not found" });

  const chat = data.chats.find((c) => c.id === chatId);
  if (chat) {
    chat.blocked = blocked;
    res.json({ success: true });
  } else {
    res.status(404).json({ error: "Chat not found" });
  }
});

app.get("/api/bot/updates", (req, res) => {
  const token = req.query.token as string;
  const data = botData.get(token);
  if (!data) return res.json({ messages: [], chats: [] });
  res.json(data);
});

app.post("/api/bot/send", async (req, res) => {
  const { token, chatId, text } = req.body;
  const bot = bots.get(token);
  const data = botData.get(token);
  if (!bot || !data || !chatId || !text)
    return res.status(400).json({ error: "Missing params" });

  try {
    const msg = await bot.sendMessage(chatId, text);
    const message = {
      id: msg.message_id.toString(),
      chatId: msg.chat.id,
      from: {
        id: msg.from?.id,
        first_name: msg.from?.first_name || "Bot",
        username: msg.from?.username,
      },
      type: "text",
      content: msg.text || "",
      timestamp: msg.date * 1000,
    };
    data.messages.push(message);
    res.json({ success: true, message });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
});

app.post("/api/bot/sendMedia", upload.single("file"), async (req, res) => {
  const { token, chatId, type, caption } = req.body;
  const bot = bots.get(token);
  const data = botData.get(token);

  if (!bot || !data || !chatId)
    return res.status(400).json({ error: "Missing params" });

  try {
    let msg: any;
    const filePath = req.file?.path;

    if (!filePath) return res.status(400).json({ error: "File required" });

    if (type === "photo") {
      msg = await bot.sendPhoto(chatId, filePath, { caption });
    } else if (type === "video") {
      msg = await bot.sendVideo(chatId, filePath, { caption });
    } else if (type === "document") {
      msg = await bot.sendDocument(chatId, filePath, { caption });
    } else {
      return res.status(400).json({ error: "Invalid type" });
    }

    fs.unlinkSync(filePath);

    const message = {
      id: msg.message_id.toString(),
      chatId: msg.chat.id,
      from: {
        id: msg.from?.id,
        first_name: msg.from?.first_name || "Bot",
        username: msg.from?.username,
      },
      type: type,
      content:
        type === "photo"
          ? msg.photo[msg.photo.length - 1].file_id
          : msg.video?.file_id || msg.document?.file_id,
      caption: msg.caption,
      timestamp: msg.date * 1000,
    };

    try {
      const file = await bot.getFile(message.content);
      (message as any).mediaUrl = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
    } catch (e) {
      console.error("Error getting sent media URL:", e);
    }

    data.messages.push(message);
    res.json({ success: true, message });
  } catch (error) {
    console.error("Error sending media:", error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Failed to send media" });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Memegram backend running on port ${PORT}`);
});

const shutdown = async () => {
  console.log("Shutting down...");
  for (const [token, bot] of bots.entries()) {
    try {
      await bot.stopPolling();
    } catch (e) {}
  }
  server.close(() => process.exit(0));
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

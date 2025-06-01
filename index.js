// index.js

const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const BOTPRESS_URL = process.env.BOTPRESS_URL;      // Botpress API URL
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;  // 360dialog WhatsApp API token

app.post('/webhook', async (req, res) => {
  const message = req.body; // WhatsApp se aane wala message

  try {
    // Botpress API ko message bhejna
    const botpressResponse = await axios.post(`${BOTPRESS_URL}/api/v1/bots/<bot_id>/converse`, {
      type: 'text',
      text: message.text.body,
      userId: message.from,
    });

    const replyText = botpressResponse.data.responses[0].text;

    // WhatsApp API ko reply bhejna
    await axios.post('https://waba.360dialog.io/v1/messages', {
      to: message.from,
      type: 'text',
      text: { body: replyText },
    }, {
      headers: {
        'D360-API-KEY': WHATSAPP_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    res.sendStatus(200);

  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Middleware running on port ${PORT}`);
});

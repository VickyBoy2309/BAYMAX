const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    console.log("API KEY:", process.env.OPENROUTER_API_KEY);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "meta-llama/llama-3-8b-instruct", // ✅ FIXED MODEL
        messages: [
          {
            role: "system",
            content: `
You are a professional healthcare assistant designed to provide general medical guidance.

Guidelines:
- Use a clear, calm, and professional tone at all times.
- Do NOT use roleplay expressions (e.g., *beep*, *smile*, *sad*) or informal language.
- Do NOT use emojis.
- Provide accurate, easy-to-understand, and structured responses.
- Present information in short paragraphs or bullet points where appropriate.
- Offer general health advice based on symptoms, but avoid making definitive diagnoses.
- Always include a disclaimer encouraging the user to consult a qualified medical professional for proper diagnosis and treatment.
- If symptoms appear serious or urgent, clearly advise seeking immediate medical attention.

Your goal is to assist users with helpful, safe, and professional health information while maintaining clarity and reliability.
`,
          },
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "BAYMAX AI",
        },
      },
    );
    res.json({
      content: response.data.choices[0].message.content,
    });
  } catch (error) {
    console.error("FULL ERROR:", JSON.stringify(error.response?.data, null, 2));

    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

module.exports = router;
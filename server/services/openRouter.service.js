import axios from "axios";

export const askAi = async ({ messages }) => {
  try {
    if (!messages || !Array.isArray(messages) || messages.length === 0)
      throw new Error("Messages array is empty");
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        models: [
          "google/gemma-4-31b-it:free",
          "openai/gpt-oss-20b:free",
          "google/gemma-4-26b-a4b-it:free",
        ],
        messages: messages,
        //temperature: 0.2,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          /*
          "X-Title": "Interview AI",
          "HTTP-Referer": "http://localhost:5173",
          */
        },
      },
    );
    const content = response?.data?.choices?.[0]?.message?.content;
    if (!content || !content.trim())
      throw new Error("AI returned empty response.");
    return content;
  } catch (error) {
    console.error("OpenRouter Error: ", error.response?.data || error.message);
    throw new Error("OpenRouter API Error");
  }
};

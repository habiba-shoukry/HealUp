exports.chatWithBot = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "mistralai/Mistral-7B-Instruct-v0.2:featherless-ai",

          messages: [
            {
              role: "system",
              content: `
                You are HealUp. HealUp is a friendly virtual health and fitness companion that helps users improve their lifestyle.

                Always answer in short clear sentences.
                Maximum 2 to 3 sentences.
                Do not use bullet points.
                Do not use stars or special characters.
                Write responses as normal sentences.
                Be friendly and supportive.
                Never give medical diagnoses.

                Only mention HealUp app pages if the user asks where something is located or how to navigate the app.
                If the user asks for advice such as workouts, habits, or motivation, just answer the question without mentioning any pages.

                HealUp App Pages:
                Dashboard. Shows the user's avatar, health stats, and HP Energy and Discipline bars.
                Program and Avatar page. Allows users to customize their avatar including face, hair, skin and hair color.
                Challenges page. Shows daily and weekly challenges where users earn rewards and maintain streaks.
                Goals and Progress page. Shows rewards, XP, and progress tracking.
                Activity and Food Log page. Allows users to log activities and food and see charts.
                Notifications page. Shows notifications and health reports.
                When guiding users inside the app, refer to the page name only. Do not mention URLs or routes.
                `
            },
            {
              role: "user",
              content: message
            }
          ],

          max_tokens: 90,
          temperature: 0.4,
          frequency_penalty: 0.2,
          stream: false
        })
      }
    );

    const data = await response.json();

    const reply = data.choices[0].message.content;

    res.json({ reply });

  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({ error: "Chatbot failed" });
  }
};
import { RequestHandler } from "express";
import { Together } from "together-ai";
require("dotenv").config();

const together = new Together({
  apiKey: process.env.TOGETHER_AI_API_KEY,
});

export const generateScript: RequestHandler = async (req, res) => {
  const { points } = req.body;

  if (!points || !Array.isArray(points)) {
    res.status(400).json({ message: "Please provide some points." });
    return;
  }

  try {
    const prompt = `
      You are a professional scriptwriter. Create an engaging YouTube video script based on the following points:

      TOPIC POINTS:
      ${points.map((point, index) => `${index + 1}. ${point}`).join('\n')}

      SCRIPT GUIDELINES:
      - Develop a compelling narrative around these points
      - Ensure smooth transitions between ideas
      - Use an engaging, conversational tone
      - Include relevant examples or explanations
      - Structure the script with:
        a) Strong, attention-grabbing introduction
        b) Clear exploration of each point
        c) Memorable conclusion with a call-to-action

      Script Length: Aim for 5-7 minutes of spoken content
      Target Audience: General YouTube viewers seeking informative content

      BEGIN SCRIPT:
      `;

    const response = await together.completions.create({
      model: "meta-llama/Llama-2-70b-hf",
      prompt,
      max_tokens: 600,
      temperature: 0.8,  
      top_p: 0.9,
    });
    console.log(response)
    const content = response.choices?.[0]?.text?.trim();

    if (!content) {
      res.status(500).json({ message: "Failed to generate script." });
      return;
    }

    res.status(200).json({ message: "Script generated successfully", content });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred:", error);
    }
    res.status(500).json({ message: "Error generating content." });
  }
};

import { RequestHandler } from "express";
import { Together } from "together-ai";
require("dotenv").config();

const together = new Together({
  apiKey: process.env.TOGETHER_AI_API_KEY,
});

export const generateDescription = async (req:any, res:any) => {
  const { script } = req.body;

  if (!script || typeof script !== "string" || script.trim().length < 50) {
    return res.status(400).json({ message: "Please provide a valid script." });
  }

  try {
      const prompt = `
    TASK: Generate a YouTube Video Description for a Fitness Content Video

    SCRIPT OVERVIEW:
    """
    ${script}
    """

    OUTPUT FORMAT (STRICT REQUIREMENTS):
    ---BEGIN DESCRIPTION---
    [VIDEO TITLE]

    [PRIMARY DESCRIPTION PARAGRAPH]

    [KEY INSIGHTS/BULLET POINTS]
    - Insight 1
    - Insight 2
    - Insight 3

    [CALL TO ACTION PARAGRAPH]

    [RELEVANT HASHTAGS]
    ---END DESCRIPTION---

    SPECIFIC GUIDELINES:
    - Total length: 200-300 words
    - Use an engaging, conversational tone
    - Focus on the core messages from the script
    - Include 3-5 SEO-friendly keywords naturally
    - Aim to motivate and provide value to viewers
    - Ensure clear, structured format for easy parsing
    `;

    const response = await together.completions.create({
      model: "meta-llama/Llama-2-70b-hf",
      prompt: prompt,
      max_tokens: 500,
      temperature: 0.7,
      top_p: 0.9,
    });
    console.log(response);

    const rawDescription = response.choices?.[0]?.text?.trim() || '';
    const cleanedDescription = cleanDescription(rawDescription);

    if (!cleanedDescription) {
      return res.status(500).json({ 
        message: "Failed to generate a meaningful description." 
      });
    }

    res.status(200).json({
      message: "YouTube description generated successfully.",
      description: cleanedDescription,
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    res.status(500).json({
      message: "Error generating description using Together AI.",
      error,
    });
  }
};


function cleanDescription(content: string): string {
  content = content.replace(/```[\s\S]*?```/g, '');
  content = content.replace(/Note:.*$/gm, '');
  content = content.replace(/\s+/g, ' ').trim();
  if (!content.includes('\n')) {
    content = splitIntoParagraphs(content);
  }
  return content;
}

function splitIntoParagraphs(text: string): string {
  const sentences = text.split('. ');
  const paragraphs:any[] = [];
  let currentParagraph = '';

  sentences.forEach((sentence, index) => {
    currentParagraph += sentence + '. ';
    if ((index + 1) % 3 === 0 || index === sentences.length - 1) {
      paragraphs.push(currentParagraph.trim());
      currentParagraph = '';
    }
  });

  return paragraphs.join('\n\n');
}

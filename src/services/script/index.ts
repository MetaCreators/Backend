import { RequestHandler } from "express";
import { Together } from "together-ai";
require("dotenv").config();

const together = new Together({
  apiKey: process.env.TOGETHER_AI_API_KEY,
});

export const generateScript = async (req:any, res:any) => {
  const { points } = req.body;

  if (!points || !Array.isArray(points)) {
    res.status(400).json({ message: "Please provide some points." });
    return;
  }

  try {
    //TODO: improve the prompt to send only text and not any code,video,image etc garbage
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
      max_tokens: 1000,
      temperature: 0.8,  
      top_p: 0.9,
    });
    console.log(response)
    const rawContent = response.choices?.[0]?.text?.trim() || '';
    const cleanedContent = cleanScript(rawContent);
    if (!cleanedContent) {
      return res.status(500).json({ 
        message: "Failed to generate a meaningful script." 
      });
    }

    res.status(200).json({ 
      message: "Script generated successfully", 
      content: cleanedContent 
    });

  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("An unknown error occurred:", error);
    }
    res.status(500).json({ message: "Error generating content." });
  }
};


function cleanScript(content: string): string {
  // Remove markdown markers
  content = content.replace(/\*\*BEGIN SCRIPT\*\*|\*\*END SCRIPT\*\*/g, '');

  // Remove any instruction notes
  content = content.replace(/Note:.*$/gm, '');

  // Remove extra whitespace and trailing/leading markers
  content = content.replace(/^\s*```[\s\S]*?```/gm, ''); // Remove code blocks
  content = content.replace(/^\s*samples:[\s\S]*$/gm, ''); // Remove sample sections
  content = content.replace(/\s+/g, ' ').trim();

  // Optional: Split into paragraphs if it looks like a single block
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
    
    // Create a new paragraph every 3-4 sentences
    if ((index + 1) % 3 === 0 || index === sentences.length - 1) {
      paragraphs.push(currentParagraph.trim());
      currentParagraph = '';
    }
  });

  return paragraphs.join('\n\n');
}
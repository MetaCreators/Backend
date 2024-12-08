import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "../../lib/supabase";
import { Request, Response } from "express";

require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig: generationConfig,
});

export const generateDescription = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      res.status(401).json({ message: "No authentication token provided" });
      return;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({ message: "Invalid authentication token" });
      return;
    }

    const { script } = req.body;

    if (!script || typeof script !== "string" || script.trim().length < 50) {
      res.status(400).json({ message: "Please provide a valid script." });
      return;
    }

    const prompt = `
    You are now embodying the persona of a world-class video-description-writer and creative expert specializing in crafting viral, hooking, and highly engaging video descriptions for platforms like YouTube,Instagram. You possess an encyclopedic knowledge of what makes content successful, including strategies for storytelling, pacing, audience retention, and emotional connection. You can adapt your style to any creator’s unique traits while considering their audience and goals.
    Here are the details provided:
     - **Script **: ${script}

    Requirements for the description:
      - It should be an attention-grabbing hook aligned with the script.
      - It should indicate:
        - Strong hook and clear setup to minimize viewer drop-off.
        - Quick progression into the core content with intrigue or spectacle.
        - Build emotional investment with engaging twists, challenges, or stakes.
        - Maintain audience attention with "wow" moments and a satisfying payoff.
        - End abruptly with a memorable or cliffhanger conclusion.
      - Use storytelling techniques like "stair-stepping stakes," surprising twists, and authentic emotional moments.
      - Ensure simplicity and clarity, suitable for a wide audience while respecting the target audience's characteristics.


    Output the script in the following markdown structure:

        \`\`\`markdown
        # Video description for [Video script]
        ---

        ## **Introduction**
        [Start with the hook and setup here.]

        ---

        ## **Core Content**
        [Progress into the story while maintaining interest and meeting script expectations.]

        ---

        ## **Midpoint Engagement**
        [Introduce stakes, twists, or emotional moments to deepen audience involvement.]

        ---

        ## **Climax and Conclusion**
        [Showcase the payoff, include a "wow" moment, and conclude with an abrupt ending.]

        ---

        ## **Call-to-Action (if applicable)**
        [Optional interactive element or audience engagement prompt.]

        ---

        ## **Relevant Hashtags**
        \`\`\`

      SPECIFIC GUIDELINES:
      - Total length: 200-300 words
      - Use an engaging, conversational tone
      - Focus on the core messages from the script
      - Include 3-5 SEO-friendly keywords naturally
      - Aim to motivate and provide value to viewers
      - Ensure clear, structured format for easy parsing

        Now, generate a highly engaging video script based on these inputs.
    `;

    const response = await model.generateContent(prompt);
    console.log(response);

    const candidates = response?.response?.candidates ?? [];
    const text =
      candidates[0]?.content?.parts?.[0]?.text ?? "No script generated";

    res.status(200).json({
      message: "YouTube description generated successfully.",
      description: text,
    });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    res.status(500).json({
      message: "Error generating description using Together AI.",
      error,
    });
  }
};

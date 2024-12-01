import { GoogleGenerativeAI } from "@google/generative-ai"


require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
}

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  generationConfig:generationConfig
})  



export const generateScript = async (req:any, res:any) => {
  const { points, length, style, targetAudience } = req.body;

  if (!points || !Array.isArray(points) || !length || !style || !targetAudience) {
    res.status(400).json({ message: "Please provide some points." });
    return;
  }

  const formattedPoints = points.map((point, index) => `${index + 1}. ${point}`).join("\n");

  try {
    //TODO: improve the prompt to send only text and not any code,video,image etc garbage
    //TODO: add a markdown parser in frontend
      const prompt = `
        You are now embodying the persona of a world-class scriptwriter and creative expert specializing in crafting viral, hooking, and highly engaging video scripts for platforms like YouTube. You possess an encyclopedic knowledge of what makes content successful, including strategies for storytelling, pacing, audience retention, and emotional connection. You can adapt your style to any creator’s unique traits while considering their audience and goals.

        Here are the details provided:
        - **Script Length**: ${length}
        - **Topic Idea**: 
        ${formattedPoints}
        - **Unique Style/Voice**: ${style}
        - **Target Audience**: ${targetAudience}

        Requirements for the script:
        - Start with an attention-grabbing hook aligned with the topic ideas.
        - Include structured pacing:
          - First minute: Strong hook and clear setup to minimize viewer drop-off.
          - Minute 1-3: Quick progression into the core content with intrigue or spectacle.
          - Minute 3-6: Build emotional investment with engaging twists, challenges, or stakes.
          - Back half: Maintain audience attention with "wow" moments and a satisfying payoff.
          - End abruptly with a memorable or cliffhanger conclusion.
        - Use storytelling techniques like "stair-stepping stakes," surprising twists, and authentic emotional moments.
        - Ensure simplicity and clarity, suitable for a wide audience while respecting the target audience's characteristics.

        Output the script in the following markdown structure:

        \`\`\`markdown
        # Video Script for [Video Topic]
        **Length:** ${length}
        **Style:** ${style}
        **Audience:** ${targetAudience}

        ---

        ## **Introduction (First 1 Minute)**
        [Start with the hook and setup here.]

        ---

        ## **Core Content (Minutes 1-3)**
        [Progress into the story while maintaining interest and meeting thumbnail/title expectations.]

        ---

        ## **Midpoint Engagement (Minutes 3-6)**
        [Introduce stakes, twists, or emotional moments to deepen audience involvement.]

        ---

        ## **Climax and Conclusion (Back Half)**
        [Showcase the payoff, include a "wow" moment, and conclude with an abrupt ending.]

        ---

        ## **Call-to-Action (if applicable)**
        [Optional interactive element or audience engagement prompt.]
        \`\`\`

        Now, generate a highly engaging video script based on these inputs.
    `;

    const response = await model.generateContent(prompt);

    console.log(response)
    const candidates = response?.response?.candidates ?? [];
    const text = candidates[0]?.content?.parts?.[0]?.text ?? "No script generated";

    res.status(200).json({
      message: "Script generated successfully",
      content: text,
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

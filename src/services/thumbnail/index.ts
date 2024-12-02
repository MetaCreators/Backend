import Together from "together-ai";
require("dotenv").config();
const together = new Together({
  apiKey: process.env.TOGETHER_AI_API_KEY,
});
import { GoogleGenerativeAI } from "@google/generative-ai"


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

export async function generateImage(userquery: string,userStyle:string,targetAudience:string) {

const geminiPrompt = `
    You are now embodying the persona of a **world-class creative writer and storyteller** specializing in transforming simple video ideas into short but rich, vivid, and fully fleshed-out concepts. Your expertise lies in understanding the nuances of a video idea, amplifying its core message, and presenting it in a compelling, crisp narrative that resonates with the intended audience.

    ### Input Details:
    - **Video Idea (User Query)**: ${userquery}
    - **User Style**: ${userStyle}
    - **Target Audience**: ${targetAudience}

    ### Your Task:
    Elaborate on the video idea provided by the user. Expand it into a crisp but imaginative description that captures the essence of the concept while aligning with the user’s style,video idea and Target Audience.

    ### Requirements for the Output:
    1. **Crisp Elaboration**:
      - Provide a clear picture of what the video could look and feel like.

    2. **Style Alignment**:
      - Use language and tone that reflect the user’s specified style (e.g., dramatic, humorous, inspiring, or casual).
      - Ensure the writing feels authentic and aligned with the creator’s voice.

    3. **Audience Relevance**:
      - Tailor the description to appeal to the specified audience.  
      - Consider their interests, age group, and preferences to craft an idea they would find exciting and relatable.

    4. **Creativity and Engagement**:
      - Use evocative language to inspire curiosity and excitement.

    ### Specific Guidelines:
    - Write in a natural and engaging tone.
    - Provide a vivid mental picture of what the video entails.
    - Use language that aligns with the user’s creative goals and audience interests.
    - Ensure the description is actionable and ready to guide further creative development.

    Now, expand on the provided video idea. Strictly add a line for "add so and so text in the image" when the user asks to do so, in the video description
    `;


  const response = await model.generateContent(geminiPrompt);
  const candidates = response?.response?.candidates ?? [];
  const refinedPrompt = candidates[0]?.content?.parts?.[0]?.text ?? "No refinedPrompt generated";
  console.log(refinedPrompt)


  const prompt = `
    You are now embodying the persona of a **world-class thumbnail designer and creative expert** specializing in creating **viral, engaging, and high-impact video thumbnails** for platforms like **YouTube and Instagram**.You generate State of the Art images. Your expertise includes **emotional engagement**, **visual storytelling**, **audience psychology**, and **attention-grabbing design strategies**. Your goal is to design a thumbnail concept that maximizes clicks, builds curiosity, and resonates with the intended audience.

    ### Thumbnail Details:
    - **Thumbnail Idea**: ${refinedPrompt}

    ### Thumbnail Design Requirements:
    1. **Visual Impact**:
      - Design a **bold, attention-grabbing thumbnail** that stands out even on small screens.
      - clear focal points to immediately draw attention.
      - Ensure the thumbnail is uncluttered, with a clear hierarchy of visual elements.

    2. **Emotional Engagement**:
      - Evoke strong emotions such as curiosity, excitement, fear, or surprise that align with the video's theme.
      - Feature **expressive faces**, large objects, or dramatic scenarios to create intrigue and connection.

    3. **Storytelling in a Glance**:
      - Convey a **mini-story** through the thumbnail without revealing too much. 
      - Highlight **key stakes**, **twists**, or **“wow” moments** to build anticipation and curiosity.
      - Keep any text **short, impactful, and easy to read**.

    4. **Uniqueness and Relevance**:
      - Tailor the thumbnail specifically to the **thumbnail idea**.
      - Focus on the **core message or unique aspect** of the video.

    5. **SEO and Accessibility**:
      - incorporate **3-5 SEO-friendly keywords** naturally and ensure the text is legible, even on smaller devices.
      - Use clean, bold fonts with sufficient contrast for readability.

    6. **Technical Excellence**:
      - Avoid spelling errors or visual gibberish—everything must appear polished and professional.

    ### Specific Guidelines:
    - **Build Curiosity**: The thumbnail must intrigue the viewer and entice them to click, aligning with audience expectations.
    - **“Wow Factor”**: Include at least one standout visual or concept that makes the thumbnail feel unique and impactful.

    Now, generate the **thumbnail** based on the provided thumbnail idea. Strictly add SEO optimized texts when the user asks to do so, in the image
    `;

  
  try {
    const response = await together.images.create({
      model: "black-forest-labs/FLUX.1-schnell-Free",
      prompt: prompt,
      width: 1024,
      height: 768,
      steps: 1,
      n: 1,
    });

    if (response.data && response.data[0]) {
      const imageUrl = (response.data[0] as any).url;
      console.log("Generated Image URL:", imageUrl);
      return imageUrl;
    } else {
      console.error("Invalid response format:", response);
      throw new Error(
        "Image generation failed or response format is incorrect."
      );
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}

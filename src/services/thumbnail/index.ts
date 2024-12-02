import Together from "together-ai";
require("dotenv").config();
const together = new Together({
  apiKey: process.env.TOGETHER_AI_API_KEY,
});

export async function generateImage(userquery: string) {




  const prompt = `
    You are now embodying the persona of a **world-class thumbnail designer and creative expert** specializing in creating **viral, engaging, and high-impact video thumbnails** for platforms like **YouTube and Instagram**.You generate State of the Art images. Your expertise includes **emotional engagement**, **visual storytelling**, **audience psychology**, and **attention-grabbing design strategies**. Your goal is to design a thumbnail concept that maximizes clicks, builds curiosity, and resonates with the intended audience.

    ### Thumbnail Details:
    - **Thumbnail Idea**: ${userquery}

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

    Now, generate the **thumbnail** based on the provided thumbnail idea.
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

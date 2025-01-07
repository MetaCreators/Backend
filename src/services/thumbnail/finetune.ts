import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function finetune(username:string) {

    const training = await replicate.trainings.create(
        "ostris",
        "flux-dev-lora-trainer",
        "e440909d3512c31646ee2e0c7d6f6f4923224863a6a10c494606e79fb5844497",
        {
            
            destination:  `adityaraj-007/${username}`,
            input: {
                steps: 1500,
                lora_rank: 16,
                optimizer: "adamw8bit",
                batch_size: 1,
                resolution: "512,768,1024",
                autocaption: true,
                //TODO: Fix input_images to accept zip file as input
                input_images: "https://",
                trigger_word: username,
                learning_rate: 0.0004,
                wandb_project: "flux_train_replicate",
                autocaption_prefix: `photo of ${username}`,
                wandb_save_interval: 100,
                caption_dropout_rate: 0.05,
                cache_latents_to_disk: false,
                wandb_sample_interval: 100
            }
        }
    );

    console.log(training);
    
}

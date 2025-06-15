import fs from "fs";
import path from "path";
import ModelClient, { isUnexpected } from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";

// Load the GitHub token from environment variables
const token = process.env["GITHUB_TOKEN"];
if (!token) {
  throw new Error("GITHUB_TOKEN environment variable is not set or is empty.");
}
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1"; // Ensure this model supports image input

// Path to your image file (change "example.jpg" to your actual image file)
const imagePath = path.join(process.cwd(), "example.jpg");

// Read and encode the image as base64
let imageBase64;
try {
  imageBase64 = fs.readFileSync(imagePath, { encoding: "base64" });
} catch (err) {
  console.error("Could not read image file:", err.message);
  process.exit(1);
}

export async function main() {
  const client = ModelClient(
    endpoint,
    new AzureKeyCredential(token),
  );

  const response = await client.path("/chat/completions").post({
    body: {
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        {
          role: "user",
          content: [
            { type: "text", text: "What is in this image?" },
            { type: "image_url", image_url: `data:image/jpeg;base64,${imageBase64}` }
          ]
        }
      ],
      temperature: 1.0,
      top_p: 1.0,
      model: model
    }
  });

  if (isUnexpected(response)) {
    throw response.body.error;
  }

  console.log(response.body.choices[0].message.content);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
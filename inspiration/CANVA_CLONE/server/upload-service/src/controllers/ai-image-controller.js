const axios = require("axios");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");
const Media = require("../models/media");

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const STABILITY_ENGINE_ID = "stable-diffusion-v1-6";
const STABILITY_API_HOST = "https://api.stability.ai";

const generateImageFromAIAndUploadToDB = async (req, res) => {
  const prompt = req.body.prompt;
  const userId = req.user.userId;

  console.log(prompt, userId);

  try {
    const response = await axios.post(
      `${STABILITY_API_HOST}/v1/generation/${STABILITY_ENGINE_ID}/text-to-image`,
      {
        text_prompts: [
          {
            text: prompt,
          },
        ],
        height: 1024,
        width: 1024,
        steps: 30,
        samples: 1,
        cfg_scale: 7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${STABILITY_API_KEY}`,
        },
      }
    );

    const generatedImage = response.data.artifacts[0];

    if (!generatedImage) {
      throw new Error("No image generated from stablity AI");
    }

    const imageBuffer = Buffer.from(generatedImage.base64, "base64");

    const file = {
      buffer: imageBuffer,
      originalName: `ai-generated-${Date.now()}.png`,
      mimetype: "image/png",
      size: imageBuffer.length,
      width: 1024,
      height: 1024,
    };

    const cloudinaryResult = await uploadMediaToCloudinary(file);

    const newlyCreatedMedia = new Media({
      userId,
      name: `AI Generated ${prompt.substring(0, 50)}${
        prompt.length > 50 ? "..." : ""
      }}`,
      cloudinaryId: cloudinaryResult.public_id,
      url: cloudinaryResult.secure_url,
      mimeType: "image/png",
      size: imageBuffer.length,
      width: 1024,
      height: 1024,
    });

    await newlyCreatedMedia.save();

    return res.status(201).json({
      success: true,
      data: newlyCreatedMedia,
      prompt,
      seed: generatedImage.seed,
      message: "AI image generated and uploaded to DB successfully",
    });
  } catch (e) {
    console.log(e.message);

    res.status(500).json({
      success: false,
      message: "Fetch from AI and upload to DB failed! Please try again",
    });
  }
};

module.exports = { generateImageFromAIAndUploadToDB };

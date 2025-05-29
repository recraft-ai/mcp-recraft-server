import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { ImageStyle, ImageSubStyle, TransformModel } from "../api"
import { imageDataToBlob } from "../utils"
import z from "zod"
import { RecraftServer } from "../RecraftServer"
import { PARAMETERS } from "../utils/parameters"
import { downloadImage } from "../utils/download"

export const imageToImageTool = {
  name: "image_to_image",
  description: "Generate an image using Recraft AI from an input image and a text prompt.\n" +
    "You can specify the reference input image, style, model, and number of images to generate.\n" +
    "You don't need to change default parameters if you don't have any specific requirements.\n" +
    "You can use styles to refine the image generation, and also to generate raster or vector images.\n" +
    "Generated images will be saved to local storage, paths to them and their previews will be returned in the response.",
  inputSchema: {
    type: "object",
    properties: {
      imageURI: PARAMETERS.imageURI,
      prompt: PARAMETERS.promptSimple,
      strength: {
        type: "number",
        minimum: 0.0,
        maximum: 1.0,
        description: "Strength of the image to image transformation, where 0 means almost similar to reference input image, 1 means almost no reference."
      },
      style: PARAMETERS.imageStyle,
      substyle: PARAMETERS.imageSubStyle,
      styleID: PARAMETERS.imageStyleID,
      model: PARAMETERS.transformModel,
      numberOfImages: PARAMETERS.numberOfImages,
    },
    required: ["imageURI", "prompt", "strength"]
  }
}

export const imageToImageHandler = async (server: RecraftServer, args: Record<string, unknown>): Promise<CallToolResult> => {
  try {
    const { imageURI, prompt, strength, style, substyle, styleID, model, numberOfImages } = z.object({
      imageURI: z.string(),
      prompt: z.string(),
      strength: z.number(),
      style: z.nativeEnum(ImageStyle).optional(),
      substyle: z.nativeEnum(ImageSubStyle).optional(),
      styleID: z.string().optional(),
      model: z.nativeEnum(TransformModel).optional(),
      numberOfImages: z.number().optional()
    }).parse(args)

    const imageData = await downloadImage(imageURI)

    const result = await server.api.imageApi.imageToImage({
      image: await imageDataToBlob(imageData),
      prompt: prompt,
      strength: strength,
      style: style,
      substyle: substyle,
      styleId: styleID,
      model: model,
      responseFormat: 'url',
      n: numberOfImages,
    })

    return await server.transformGenerateImageResponseToCallToolResult(result)
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error generating image: ${error}`
        }
      ],
      isError: true
    }
  }
}
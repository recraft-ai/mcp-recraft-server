import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { ImageStyle, ImageSubStyle, TransformModel } from "../api"
import { downloadImage, imageDataToBlob } from "../utils"
import z from "zod"
import { RecraftServer } from "src/RecraftServer"

export const imageToImageTool = {
  name: "image_to_image",
  description: "Generate an image from an image and a text prompt",
  inputSchema: {
    type: "object",
    properties: {
      imageURI: {
        type: "string",
        description: "Image to use as a base for the generation. This can be a URL (starting with http:// or https://) or a file path (starting with file://)."
      },
      prompt: {
        type: "string",
        description: "Text prompt of the image you want to generate"
      },
      strength: {
        type: "number",
        minimum: 0.0,
        maximum: 1.0,
        description: "Strength of the image to image transformation, where 0 means almost similar to reference image, 1 means almost no reference."
      },
      style: {
        type: "string",
        enum: Object.values(ImageStyle),
        description: "Visual style to apply"
      },
      substyle: {
        type: "string",
        enum: Object.values(ImageSubStyle),
        description: "Visual substyle to apply, can be specified only with style"
      },
      styleID: {
        type: "string",
        description: "ID of the style to apply, mutually exclusive with style"
      },
      model: {
        type: "string",
        enum: [TransformModel.Recraftv3, TransformModel.Recraftv2],
        description: "Model version to use"
      },
      numberOfImages: {
        type: "integer",
        minimum: 1,
        maximum: 6,
        description: "Number of images to generate"
      }
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
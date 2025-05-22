import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { ImageSize, ImageStyle, ImageSubStyle, TransformModel } from "../api"
import z from "zod"
import { RecraftServer } from "src/RecraftServer"

export const generateImageTool = {
  name: "generate_image",
  description: "Generate an image from a text prompt",
  inputSchema: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description: "Text prompt of the image you want to generate"
      },
      size: {
        type: "string",
        enum: Object.values(ImageSize),
        description: "Image dimensions"
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
    required: ["prompt"]
  }
}

export const generateImageHandler = async (server: RecraftServer, args: Record<string, unknown>): Promise<CallToolResult> => {
  try {
    const { prompt, size, style, styleID, substyle, model, numberOfImages } = z.object({
      prompt: z.string(),
      size: z.nativeEnum(ImageSize).optional(),
      style: z.nativeEnum(ImageStyle).optional(),
      substyle: z.nativeEnum(ImageSubStyle).optional(),
      styleID: z.string().optional(),
      model: z.nativeEnum(TransformModel).optional(),
      numberOfImages: z.number().min(1).max(6).optional()
    }).parse(args)

    const result = await server.api.imageApi.generateImage({
      generateImageRequest: {
        prompt: prompt,
        size: size,
        style: style,
        substyle: substyle,
        styleId: styleID,
        model: model,
        responseFormat: 'url',
        n: numberOfImages,
      }
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

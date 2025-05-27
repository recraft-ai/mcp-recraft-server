import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { ImageStyle, ImageSubStyle } from "../api"
import { downloadImage, imageDataToBlob } from "../utils"
import z from "zod"
import { RecraftServer } from "../RecraftServer"

export const replaceBackgroundTool = {
  name: "replace_background",
  description: "Generate an image from an image with background replaced based on the image and prompt",
  inputSchema: {
    type: "object",
    properties: {
      imageURI: {
        type: "string",
        description: "Image in which the background will be replaced. This can be a URL (starting with http:// or https://) or a file path (starting with file://)."
      },
      prompt: {
        type: "string",
        description: "Text prompt of the background areas that will be changed"
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
      numberOfImages: {
        type: "integer",
        minimum: 1,
        maximum: 6,
        description: "Number of images to generate"
      }
    },
    required: ["imageURI", "prompt"]
  }
}

export const replaceBackgroundHandler = async (server: RecraftServer, args: Record<string, unknown>): Promise<CallToolResult> => {
  try {
    const { imageURI, prompt, style, substyle, styleID, numberOfImages } = z.object({
      imageURI: z.string(),
      prompt: z.string(),
      style: z.nativeEnum(ImageStyle).optional(),
      substyle: z.nativeEnum(ImageSubStyle).optional(),
      styleID: z.string().optional(),
      numberOfImages: z.number().optional()
    }).parse(args)

    const imageData = await downloadImage(imageURI)

    const result = await server.api.imageApi.replaceBackground({
      image: await imageDataToBlob(imageData),
      prompt: prompt,
      style: style,
      substyle: substyle,
      styleId: styleID,
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
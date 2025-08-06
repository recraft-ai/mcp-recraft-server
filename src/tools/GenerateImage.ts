import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { ImageSize, ImageStyle, ImageSubStyle, TransformModel } from "../api"
import z from "zod"
import { RecraftServer } from "../RecraftServer"
import { PARAMETERS } from "../utils/parameters"

export const generateImageTool = {
  name: "generate_image",
  description: "Generate an image using Recraft from a text prompt.\n" +
      "You can specify the image size, style, model, and number of images to generate.\n" +
      "You don't need to change default parameters if you don't have any specific requirements.\n" +
      "You can use styles to refine the image generation, and also to generate raster or vector images.\n" +
      "Local paths or URLs to generated images and their previews will be returned in the response.",
  inputSchema: {
    type: "object",
    properties: {
      prompt: PARAMETERS.promptSimple,
      size: PARAMETERS.imageSize,
      style: PARAMETERS.imageStyle,
      substyle: PARAMETERS.imageSubStyle,
      styleID: PARAMETERS.imageStyleID,
      model: PARAMETERS.transformModel,
      numberOfImages: PARAMETERS.numberOfImages,
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
        style: styleID ? undefined : style,
        substyle: styleID ? undefined : substyle,
        styleId: styleID,
        model: model,
        responseFormat: 'url',
        n: numberOfImages,
        expire: server.isLocalResultsStorage,
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

import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { ImageStyle, ImageSubStyle } from "../api"
import { imageDataToBlob } from "../utils"
import z from "zod"
import { RecraftServer } from "../RecraftServer"
import { PARAMETERS, STYLE_PRESERVATION_WARNING } from "../utils/parameters"
import { downloadImage } from "../utils/download"

export const replaceBackgroundTool = {
  name: "replace_background",
  description: "Generate an image using Recraft from an input image with its detected background replaced based on the prompt.\n" +
    "You can specify the input image, style, model, and number of images to generate.\n" +
    "You should provide the same style/substyle/styleID settings as were used for input image generation (if exists) if there are no specific requirements to change the style.\n" +
    "Other parameters are recommended to keep default if you don't have any specific requirements on them.\n" +
    "You can use styles to refine the image background generation, and also to generate raster or vector images.\n" +
    "Local paths or URLs to generated images and their previews will be returned in the response.",
  inputSchema: {
    type: "object",
    properties: {
      imageURI: PARAMETERS.imageURI,
      prompt: {
        type: "string",
        description: "Text prompt of the background areas that will be changed.\n" +
          "Its length should be from 1 to 1024 characters."
      },
      style: {
        ...PARAMETERS.imageStyle,
        description: PARAMETERS.imageStyle.description + "\n" + STYLE_PRESERVATION_WARNING,
      },
      substyle: {
        ...PARAMETERS.imageSubStyle,
        description: PARAMETERS.imageSubStyle.description + "\n" + STYLE_PRESERVATION_WARNING,
      },
      styleID: {
        ...PARAMETERS.imageStyleID,
        description: PARAMETERS.imageStyleID.description + "\n" + STYLE_PRESERVATION_WARNING,
      },
      numberOfImages: PARAMETERS.numberOfImages,
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
      style: styleID ? undefined : style,
      substyle: styleID ? undefined : substyle,
      styleId: styleID,
      responseFormat: 'url',
      n: numberOfImages,
      expire: server.isLocalResultsStorage,
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
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { ImageStyle } from "../api"
import { downloadImage, imageDataToBlob } from "../utils"
import z from "zod"
import { RecraftServer } from "src/RecraftServer"

export const createStyleTool = {
  name: "create_style",
  description: "Create a style from the set of style reference images.",
  inputSchema: {
    type: "object",
    properties: {
      style: {
        type: "string",
        enum: Object.values(ImageStyle),
        description: "Basic visual style in which the style will be created."
      },
      imageURIs: {
        type: "array",
        items: {
          type: "string",
        },
        description: "Array of images to use as a style references. Each item can be a URL (starting with http:// or https://) or a file path (starting with file://). The length should be from 1 to 5."
      },
    },
    required: ["style", "imageURIs"]
  }
}

export const createStyleHandler = async (server: RecraftServer, args: Record<string, unknown>): Promise<CallToolResult> => {
  try {
    const { style, imageURIs } = z.object({
      style: z.nativeEnum(ImageStyle),
      imageURIs: z.array(z.string()).nonempty(),
    }).parse(args)


    const blobPromises = imageURIs.map(async (imageURI) => await downloadImage(imageURI).then(imageDataToBlob))
    const blobs = await Promise.all(blobPromises)

    const result = await server.api.styleApi.createStyle({
      style: style,
      images: blobs,
    })

    return {
      content: [
        {
          type: 'text',
          text: `A new style with style_id ${result.id} created.\nYou can use this style in the image generation tools.`
        }
      ],
      isError: false
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error creating style: ${error}`
        }
      ],
      isError: true
    }
  }
}
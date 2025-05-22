import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { downloadImage, imageDataToBlob } from "../utils"
import z from "zod"
import { RecraftServer } from "src/RecraftServer"

export const removeBackgroundTool = {
  name: "remove_background",
  description: "Remove background in the given image. This operation takes an input image and returns the same image with detected background removed.",
  inputSchema: {
    type: "object",
    properties: {
      imageURI: {
        type: "string",
        description: "Image from which background should be removed. This can be a URL (starting with http:// or https://) or a file path (starting with file://)."
      },
    },
    required: ["imageURI"]
  }
}

export const removeBackgroundHandler = async (server: RecraftServer, args: Record<string, unknown>): Promise<CallToolResult> => {
  try {
    const { imageURI } = z.object({
      imageURI: z.string(),
    }).parse(args)

    const imageData = await downloadImage(imageURI)

    const result = await server.api.imageApi.removeBackground({
      image: await imageDataToBlob(imageData),
      responseFormat: 'url',
    })

    return await server.transformSingleImageOperationToCallToolResult(result.image, 'Removed background.')
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Remove Background error: ${error}`
        }
      ],
      isError: true
    }
  }
}

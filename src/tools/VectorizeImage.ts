import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { downloadImage, imageDataToBlob } from "../utils"
import z from "zod"
import { RecraftServer } from "../RecraftServer"

export const vectorizeImageTool = {
  name: "vectorize_image",
  description: "Vectorize a given image. This operation takes an input image and returns vector SVG image, close to it.",
  inputSchema: {
    type: "object",
    properties: {
      imageURI: {
        type: "string",
        description: "Image to to vectorize. This can be a URL (starting with http:// or https://) or a file path (starting with file://)."
      },
    },
    required: ["imageURI"]
  }
}

export const vectorizeImageHandler = async (server: RecraftServer, args: Record<string, unknown>): Promise<CallToolResult> => {
  try {
    const { imageURI } = z.object({
      imageURI: z.string(),
    }).parse(args)

    const imageData = await downloadImage(imageURI)

    const result = await server.api.imageApi.vectorizeImage({
      image: await imageDataToBlob(imageData),
      responseFormat: 'url',
    })

    return await server.transformSingleImageOperationToCallToolResult(result.image, 'Vectorized given image.')
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Vectorization error: ${error}`
        }
      ],
      isError: true
    }
  }
}

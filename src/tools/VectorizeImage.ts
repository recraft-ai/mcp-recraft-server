import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { imageDataToBlob } from "../utils"
import z from "zod"
import { RecraftServer } from "../RecraftServer"
import { PARAMETERS } from "../utils/parameters"
import { downloadImage } from "../utils/download"

export const vectorizeImageTool = {
  name: "vectorize_image",
  description: "Vectorize an input image using Recraft AI.\n" +
   "This operation takes an input image and returns a vector SVG image, close to it.\n" +
   "Resulting image will be saved to local storage, path to it and its preview will be returned in the response.",
  inputSchema: {
    type: "object",
    properties: {
      imageURI: PARAMETERS.imageURI,
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

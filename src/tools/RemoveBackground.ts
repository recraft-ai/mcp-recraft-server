import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { imageDataToBlob } from "../utils"
import z from "zod"
import { RecraftServer } from "../RecraftServer"
import { PARAMETERS } from "../utils/parameters"
import { downloadImage } from "../utils/download"

export const removeBackgroundTool = {
  name: "remove_background",
  description: "Remove background in the input image using Recraft.\n" +
    "This operation takes an input image and returns the same image with detected background removed. Raster image will be always returned.\n" +
    "Local path or URL to resulting image and its preview will be returned in the response.",
  inputSchema: {
    type: "object",
    properties: {
      imageURI: PARAMETERS.imageURI,
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
      expire: server.isLocalResultsStorage,
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

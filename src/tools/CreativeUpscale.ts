import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { downloadImage, imageDataToBlob } from "../utils"
import z from "zod"
import { RecraftServer } from "src/RecraftServer"

export const creativeUpscaleTool = {
  name: "creative_upscale",
  description: "Creative upscale of the given image. This operation takes an input image and returns an upscaled image, boosting resolution with a focus on refining small details and faces.",
  inputSchema: {
    type: "object",
    properties: {
      imageURI: {
        type: "string",
        description: "Image that will be upscaled. This can be a URL (starting with http:// or https://) or a file path (starting with file://)."
      },
    },
    required: ["imageURI"]
  }
}

export const creativeUpscaleHandler = async (server: RecraftServer, args: Record<string, unknown>): Promise<CallToolResult> => {
  try {
    const { imageURI } = z.object({
      imageURI: z.string(),
    }).parse(args)

    const imageData = await downloadImage(imageURI)

    const result = await server.api.imageApi.creativeUpscale({
      image: await imageDataToBlob(imageData),
      responseFormat: 'url',
    })

    return await server.transformSingleImageOperationToCallToolResult(result.image, 'Creative upscale completed.')
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Creative upscale error: ${error}`
        }
      ],
      isError: true
    }
  }
}

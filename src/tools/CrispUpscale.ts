import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { downloadImage, imageDataToBlob } from "../utils"
import z from "zod"
import { RecraftServer } from "src/RecraftServer"

export const crispUpscaleTool = {
  name: "crisp_upscale",
  description: "Crisp upscale of the given image. This operation takes an input image and returns an upscaled image, making the image sharper and cleaner.",
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

export const crispUpscaleHandler = async (server: RecraftServer, args: Record<string, unknown>): Promise<CallToolResult> => {
  try {
    const { imageURI } = z.object({
      imageURI: z.string(),
    }).parse(args)

    const imageData = await downloadImage(imageURI)

    const result = await server.api.imageApi.crispUpscale({
      image: await imageDataToBlob(imageData),
      responseFormat: 'url',
    })

    return await server.transformSingleImageOperationToCallToolResult(result.image, 'Crisp upscale completed.')
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Crisp upscale error: ${error}`
        }
      ],
      isError: true
    }
  }
}

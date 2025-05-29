import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { imageDataToBlob } from "../utils"
import z from "zod"
import { RecraftServer } from "../RecraftServer"
import { PARAMETERS } from "../utils/parameters"
import { downloadImage } from "../utils/download"

export const creativeUpscaleTool = {
  name: "creative_upscale",
  description: "Creative upscale of the input image using Recraft AI.\n" +
    "This operation takes an input image and returns an upscaled image, boosting resolution with a focus on refining small details and faces.\n" +
    "This version of upscale is expensive and slower than crisp upscale.\n" +
    "Resulting image will be saved to local storage, path to it and its preview will be returned in the response.",
  inputSchema: {
    type: "object",
    properties: {
      imageURI: PARAMETERS.imageURI,
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

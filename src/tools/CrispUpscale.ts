import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { imageDataToBlob } from "../utils"
import z from "zod"
import { RecraftServer } from "../RecraftServer"
import { PARAMETERS } from "../utils/parameters"
import { downloadImage } from "../utils/download"

export const crispUpscaleTool = {
  name: "crisp_upscale",
  description: "Crisp upscale of the input image using Recraft AI.\n" +
    "This operation takes an input image and returns an upscaled image, making the image sharper and cleaner.\n" +
    "This version of upscale is much cheaper and faster than creative upscale.\n" +
    "Resulting image will be saved to local storage, path to it and its preview will be returned in the response.",
  inputSchema: {
    type: "object",
    properties: {
      imageURI: PARAMETERS.imageURI,
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

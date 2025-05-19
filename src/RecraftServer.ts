import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { GenerateImageResponse, Image } from "./api"
import { RecraftApi } from "./RecraftApi"
import { existsSync, mkdirSync } from "fs"
import { downloadImagesAndMakePreviews } from "./utils"

export class RecraftServer {
  api: RecraftApi
  imageStorageDirectory: string

  constructor(api: RecraftApi, imageStorageDirectory: string) {
    this.api = api
    this.imageStorageDirectory = imageStorageDirectory

    if (!existsSync(this.imageStorageDirectory)) {
      mkdirSync(this.imageStorageDirectory, { recursive: true })
    }
  }

  transformGenerateImageResponseToCallToolResult = async (result: GenerateImageResponse): Promise<CallToolResult> => {
    const {downloadedImages: images, previews} = await downloadImagesAndMakePreviews(this.imageStorageDirectory, result.data)

    const ending = `${images.length === 1 ? '' : 's'}`
    const message = `Generated ${images.length} image${ending}.\n` +
     `Original image${ending} ${images.length === 1 ? 'is' : 'are'} saved to:\n${images.map(({path}) => `- file://${path}`).join('\n')}` +
     `\nBelow you can see preview${ending} of generated image${ending}.` +
     `\n${previews.length < images.length ? `Note: last ${images.length - previews.length} images are not shown due to message limit, but you can still find them by given paths.` : ''}`

    const content = []
    content.push({
      type: 'text',
      text: message,
    })
    content.push(...previews)
  
    return {
      content: content,
      isError: false
    } as CallToolResult
  }

  transformSingleImageOperationToCallToolResult = async (image: Image, message: string): Promise<CallToolResult> => {
    const {downloadedImages, previews} = await downloadImagesAndMakePreviews(this.imageStorageDirectory, [image])

    const imageData = downloadedImages[0]

    const totalMessage = message + '\n' +
      `Resulting image is saved to:\n- file://${imageData.path}\n` +
      (previews.length == 0 ? 
        `Note: preview image is not shown due to message limit, but you can find the resulting image by local path.` :
        `Below you can see preview image of the result.`
      )

    const content = []
    content.push({
      type: 'text',
      text: totalMessage,
    })
    content.push(...previews)
  
    return {
      content: content,
      isError: false
    } as CallToolResult
  }
}

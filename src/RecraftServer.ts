import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { GenerateImageResponse, Image } from "./api"
import { RecraftApi } from "./RecraftApi"
import { existsSync, mkdirSync } from "fs"
import { downloadImagesAndMakePreviews } from "./utils/response"

export class RecraftServer {
  api: RecraftApi
  private imageStorageDirectory: string | undefined
  private initialized: boolean = false

  constructor(api: RecraftApi, imageStorageDirectory: string | undefined) {
    this.api = api
    this.imageStorageDirectory = imageStorageDirectory
  }

  get isLocalResultsStorage(): boolean {
    return !!this.imageStorageDirectory
  }

  initializeIfNeeded = () => {
    if (this.initialized) {
      return
    }
    this.initialized = true

    if (this.imageStorageDirectory && !existsSync(this.imageStorageDirectory)) {
      mkdirSync(this.imageStorageDirectory, { recursive: true })
    }
  }

  transformGenerateImageResponseToCallToolResult = async (result: GenerateImageResponse): Promise<CallToolResult> => {
    const {downloadedImages: images, previews} = await downloadImagesAndMakePreviews(this.imageStorageDirectory, result.data)

    const pathOrUrlDesc = this.isLocalResultsStorage ? 'path' : 'URL'

    const ending = `${images.length === 1 ? '' : 's'}`
    const message = `Generated ${images.length} image${ending}.\n` +
     `Original image${ending} ${images.length === 1 ? 'is' : 'are'} saved to:\n${images.map(({pathOrUrl}) => `- ${pathOrUrl}`).join('\n')}` +
     `\nBelow you can see lower quality preview${ending} of generated image${ending}.` +
     `${previews.length < images.length ? `\nNote: last ${images.length - previews.length} images are not shown due to message limit, but you can still find them by given ${pathOrUrlDesc}s.` : ''}`

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

    const pathOrUrlDesc = this.isLocalResultsStorage ? 'local path' : 'URL'

    const totalMessage = message + '\n' +
      `Resulting image is saved to:\n- ${imageData.pathOrUrl}\n` +
      (previews.length == 0 ? 
        `Note: preview image is not shown due to message limit, but you can find the resulting image by ${pathOrUrlDesc}.` :
        `Below you can see the lower quality preview image of the result.`
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

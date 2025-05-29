import { ImageData } from "."
import { Image } from "../api"
import { downloadImage } from "./download"
import { compressImage, getImageSize, rasterizeSvg } from "./render"
import { uploadImage } from "./upload"

const MESSAGE_LIMIT = Math.round(1048576 * 0.95)
const MIN_SIDE_LENGTH = 128

export const downloadImagesAndMakePreviews = async (imageStorageDirectory: string, images: Image[]) => {
  const imagePromises = images.map(async (imageData) => {
    if (!imageData?.url) {
      return null
    }

    const imageUrl = imageData.url
    const id = imageData.imageId
    const image = await downloadImage(imageUrl)
    const path = await uploadImage(imageStorageDirectory, id, image)

    const imageSize = await getImageSize(image)

    let previewData: ImageData
    if (image.mimeType === 'image/svg+xml') {
      previewData = await rasterizeSvg(image.data)
    } else {
      previewData = await compressImage(image)
    }

    return {...image, url: imageUrl, id, path, previewData, ...imageSize}
  })

  const downloadedImages = (await Promise.all(imagePromises)).filter((image) => image !== null)

  const minSideSize = Math.min(...downloadedImages.map(image => Math.min(image.width, image.height)))
  
  const calculateTotalLength = (images: {previewData: ImageData}[]) => images.map(image => image.previewData.data.length).reduce((a, b) => a + b, 0)

  let scale = 1.0
  while (calculateTotalLength(downloadedImages) > MESSAGE_LIMIT && scale * 0.5 * minSideSize >= MIN_SIDE_LENGTH - 1e-6) {
    scale *= 0.5
    const scalePromises = downloadedImages.map(async (image) => {
      if (image.mimeType === 'image/svg+xml') {
        image.previewData = await rasterizeSvg(image.data, scale)
      } else {
        image.previewData = await compressImage(image, scale)
      }
    })
    await Promise.all(scalePromises)
  }

  let totalLength = 0
  let previews = []
  for (const {previewData} of downloadedImages) {
    if (totalLength + previewData.data.length > MESSAGE_LIMIT) {
      break
    }
    totalLength += previewData.data.length
    previews.push({
      type: 'image',
      ...previewData,
    })
  }

  return {
    downloadedImages, 
    previews,
  }
}

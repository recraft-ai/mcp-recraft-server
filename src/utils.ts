import { readFile, writeFile } from "fs/promises"
import path, { extname } from "path"
import sharp from "sharp"
import { fileURLToPath } from "url"
import mime from 'mime-types'
import { Image } from "./api"

const MESSAGE_LIMIT = Math.round(1048576 * 0.95)
const MIN_SIDE_LENGTH = 128

export type ImageData = {
  data: string
  mimeType: string
}

export const downloadImage = async (imageUrl: string): Promise<ImageData> => {
  const url = new URL(imageUrl)

  let buffer: Buffer
  let mimeType: string

  if (url.protocol === 'file:') {
    const filePath = fileURLToPath(imageUrl)
    buffer = await readFile(filePath)
    mimeType = mime.lookup(extname(filePath)) || 'image/png'
  } else {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }
  
    const arrayBuffer = await response.arrayBuffer()
    buffer = Buffer.from(arrayBuffer)
    mimeType = response.headers.get('content-type') || 'image/png'
  }

  if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp', "image/svg+xml"].includes(mimeType)) {
    throw new Error(`Unsupported image type: ${mimeType}`)
  }

  if (mimeType === 'image/svg+xml') {
    return {
      data: buffer.toString('utf-8'),
      mimeType,
    }
  }

  return {
    data: buffer.toString('base64'),
    mimeType,
  }
}

export const downloadImages = async (imageUrls: string[]): Promise<ImageData[]> => {
  const imagePromises = imageUrls.map(downloadImage)
  const images = await Promise.all(imagePromises)
  return images
}

export const imageDataToBlob = async (image: ImageData): Promise<Blob> => {
  let { data, mimeType } = image

  if (mimeType === 'image/svg+xml') {
    const rasterized = await rasterizeSvg(data)
    data = rasterized.data
    mimeType = rasterized.mimeType
  }

  const buffer = Buffer.from(data, 'base64')
  return new Blob([buffer])
}

export const uploadImage = async (directory: string, name: string, image: ImageData): Promise<string> => {
  const { data, mimeType } = image
  if (mimeType === 'image/svg+xml') {
    const filePath = path.join(directory, `${name}.svg`)
    await writeFile(filePath, data, 'utf-8')
    return filePath
  } else {
    const filePath = path.join(directory, `${name}.${mime.extension(mimeType) || 'png'}`)
    const buffer = Buffer.from(data, 'base64')
    await writeFile(filePath, buffer)
    return filePath
  }
}

export const rasterizeSvg = async (svg: string, scale?: number): Promise<ImageData> => {
  const svgBuffer = Buffer.from(svg, 'utf-8')

  const { width } = await sharp(svgBuffer).metadata()

  let img = sharp(svgBuffer).webp({quality: 95})
  if (width) img = img.resize({ width: Math.ceil(width * (scale ?? 1.0)) })

  const rasterizedBuffer = await img.toBuffer()

  return {
    data: rasterizedBuffer.toString("base64"),
    mimeType: 'image/webp',
  }
}

export const getImageSize = async (image: ImageData): Promise<{ width: number; height: number }> => {
  const buffer = Buffer.from(image.data, (image.mimeType == 'image/svg+xml' ? 'utf-8' : 'base64'))
  const { width, height } = await sharp(buffer).metadata()
  return { width: width ?? 0, height: height ?? 0 }
}

export const compressImage = async (image: ImageData, scale?: number): Promise<ImageData> => {
  const { data, mimeType } = image
  const buffer = Buffer.from(data, 'base64')

  const { width } = await sharp(buffer).metadata()

  let img = sharp(buffer).webp({quality: 95})
  if (width) img = img.resize({ width: Math.ceil(width * (scale ?? 1.0)) })

  const compressedBuffer = await img.toBuffer()

  return {
    data: compressedBuffer.toString('base64'),
    mimeType: 'image/webp',
  }
}

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
    previews
  }
}

export const nn = <T>(value: T | null | undefined): T => {
  if (value === null || value === undefined) {
    throw new Error("Value is null or undefined")
  }
  return value
}

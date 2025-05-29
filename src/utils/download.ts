import { fileURLToPath } from "url"
import { readFile } from "fs/promises"
import mime from 'mime-types'
import { extname } from "path"
import { ImageData } from "."

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

import { Image } from "../api"
import { compressImage, getImageSize, rasterizeSvg } from "./render"
import { downloadImage } from "./download"
import { uploadImage } from "./upload"

export type ImageData = {
  data: string
  mimeType: string
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

export const nn = <T>(value: T | null | undefined): T => {
  if (value === null || value === undefined) {
    throw new Error("Value is null or undefined")
  }
  return value
}

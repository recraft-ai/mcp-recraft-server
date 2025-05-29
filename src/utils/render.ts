import sharp from "sharp"
import { ImageData } from "."

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

export const compressImage = async (image: ImageData, scale?: number): Promise<ImageData> => {
  const { data } = image
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

export const getImageSize = async (image: ImageData): Promise<{ width: number; height: number }> => {
  const buffer = Buffer.from(image.data, (image.mimeType == 'image/svg+xml' ? 'utf-8' : 'base64'))
  const { width, height } = await sharp(buffer).metadata()
  return { width: width ?? 0, height: height ?? 0 }
}

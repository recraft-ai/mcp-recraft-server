import { writeFile } from "fs/promises"
import path from "path"
import mime from 'mime-types'
import { ImageData } from "."

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

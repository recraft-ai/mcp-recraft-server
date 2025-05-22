import "dotenv/config"
import { Configuration } from './api'
import { createRecraftApi } from "./RecraftApi"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { generateImageHandler, generateImageTool } from "./tools/GenerateImage"
import { imageToImageHandler, imageToImageTool } from "./tools/ImageToImage"
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { CallToolRequestSchema, ListToolsRequestSchema, Tool } from "@modelcontextprotocol/sdk/types.js"
import { RecraftServer } from "./RecraftServer"
import path from "path"
import os from "os"
import { createStyleHandler, createStyleTool } from "./tools/CreateStyle"
import { vectorizeImageHandler, vectorizeImageTool } from "./tools/VectorizeImage"
import { removeBackgroundHandler, removeBackgroundTool } from "./tools/RemoveBackground"
import { replaceBackgroundHandler, replaceBackgroundTool } from "./tools/ReplaceBackground"
import { crispUpscaleHandler, crispUpscaleTool } from "./tools/CrispUpscale"
import { creativeUpscaleHandler, creativeUpscaleTool } from "./tools/CreativeUpscale"
import { getUserHandler, getUserTool } from "./tools/GetUser"

const server = new Server(
  {
    name: 'mcp-recraft-server',
    version: '1.0.0',
  }, 
  {
    capabilities: {
      tools: {},
    }
  },
)

if (!process.env.IMAGE_STORAGE_DIRECTORY) {
  process.env.IMAGE_STORAGE_DIRECTORY = path.join(os.homedir(), ".mcp-recraft-server")
}

const apiConfig = new Configuration({
  basePath: process.env.RECRAFT_API_URL,
  accessToken: process.env.RECRAFT_API_KEY,
})
const api = createRecraftApi(apiConfig)

const recraftServer = new RecraftServer(api, process.env.IMAGE_STORAGE_DIRECTORY)

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      generateImageTool,
      imageToImageTool,
      createStyleTool,
      vectorizeImageTool,
      removeBackgroundTool,
      replaceBackgroundTool,
      crispUpscaleTool,
      creativeUpscaleTool,
      getUserTool,
    ],
  }
})

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const {params: {name: tool, arguments: args}} = request

  switch (tool) {
    case generateImageTool.name:
      return await generateImageHandler(recraftServer, args ?? {})
    case imageToImageTool.name:
      return await imageToImageHandler(recraftServer, args ?? {})
    case createStyleTool.name:
      return await createStyleHandler(recraftServer, args ?? {})
    case vectorizeImageTool.name:
      return await vectorizeImageHandler(recraftServer, args ?? {})
    case removeBackgroundTool.name:
      return await removeBackgroundHandler(recraftServer, args ?? {})
    case replaceBackgroundTool.name:
      return await replaceBackgroundHandler(recraftServer, args ?? {})
    case crispUpscaleTool.name:
      return await crispUpscaleHandler(recraftServer, args ?? {})
    case creativeUpscaleTool.name:
      return await creativeUpscaleHandler(recraftServer, args ?? {})
    case getUserTool.name:
      return await getUserHandler(recraftServer, args ?? {})
    default:
      return {
        content: [
          {
            type: 'text',
            text: `Unknown tool: ${tool}`
          }
        ],
        isError: true
      }
  }
})

const runServer = async () => {
  try {
    await api.userApi.getCurrentUser()
  } catch (error) {
    console.error('Error fetching user:', error)
    process.exit(1)
  }

  const transport = new StdioServerTransport()
  await server.connect(transport)
  console.error("Recraft MCP Server running on stdio")
}

runServer().catch(console.error)

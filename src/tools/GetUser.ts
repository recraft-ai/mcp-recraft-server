import { CallToolResult } from "@modelcontextprotocol/sdk/types.js"
import { RecraftServer } from "../RecraftServer"

const ALMOST_ZERO_CREDITS = 50

export const getUserTool = {
  name: "get_user",
  description: "Get information about current Recraft API user (their email, name, and credit balance).",
  inputSchema: {
    type: "object",
    properties: {
    },
    required: []
  }
}

export const getUserHandler = async (server: RecraftServer, _args: Record<string, unknown>): Promise<CallToolResult> => {
  try {
    const result = await server.api.userApi.getCurrentUser()

    return {
      content: [
        {
          type: 'text',
          text: `User email: ${result.email}, name: ${result.name}.\nYou have ${result.credits} credits left.` + 
          (
            result.credits >= ALMOST_ZERO_CREDITS ? 
            "" :
            `\nYou are ${result.credits > 0 ? "almost" : ""} out of credits. Please top up your account on https://www.recraft.ai/profile/api.`
          )
        },
      ]
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Get user error: ${error}`
        }
      ],
      isError: true
    }
  }
}

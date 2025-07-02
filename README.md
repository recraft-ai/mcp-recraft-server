<div align="center">
  <h1>
    <img src="images/recraft.svg" width="500px">
    <br/>Recraft AI MCP Server
  </h1>

  <img src="https://badge.mcpx.dev?type=server" title="MCP Server"/>
  <img src="https://img.shields.io/npm/v/@recraft-ai/mcp-recraft-server" alt="npm version"/>
  <img src="https://img.shields.io/npm/dw/@recraft-ai/mcp-recraft-server" alt="npm downloads"/>
  <a href="https://smithery.ai/server/@recraft-ai/mcp-recraft-server">
    <img src="https://smithery.ai/badge/@recraft-ai/mcp-recraft-server" alt="smithery badge">
  </a>
</div>

This is MCP ([Model Context Protocol](https://modelcontextprotocol.io/)) Server integrating MCP Clients with [Recraft AI](https://recraft.ai/)'s raster and vector image operations:

- raster and vector images generation
- raster and vector images editing
- creating custom styles and generating images in them
- vectorization of raster images
- background removal and replacement
- upscaling of raster images

By connecting this MCP Server to your MCP Client you will be able to generate high-quality raster and vector images using Recraft, combining different tools.

# Tools

In this MCP you can use the following tools:

| Tool Name | Description | Parameters | Price |
|-----------|-------------|------------|-------|
| `generate_image` | Generates raster/vector images from prompt | - prompt <br/> - style <br/> - size <br/> - model <br/> - number of images | \$0.04/\$0.08 per raster/vector image |
| `create_style` | Creates a style from the list of images | - list of images <br/> - basic style | \$0.04 |
| `vectorize_image` | Vectorizes raster image | - image | \$0.01 |
| `image_to_image` | Generates raster/vector images from image and prompt | - image <br/> - prompt <br/> - similarity strength <br/> - style <br/> - size <br/> - model <br/> - number of images | \$0.04/\$0.08 per raster/vector image |
| `remove_background` | Removes background in image | - image | \$0.01 |
| `replace_background` | Generates new background in image from prompt | - image <br/> - prompt for background <br/> - style <br/> - size <br/> - model <br/> - number of images | \$0.04/\$0.08 per raster/vector image |
| `crisp_upscale` | Crisp upscale of image | - image | \$0.004 |
| `creative_upscale` | Creative upscale of image | - image | \$0.25 |
| `get_user` | Get information about the user and left balance |  |  |

You can find the detailed explanation of tools, their parameters, and prices in [Recraft AI API docs](https://recraft.ai/docs).

# Setup

### Prerequisites

- First of all, you will need a [Recraft AI API](https://www.recraft.ai/docs) key. To obtain it, register your account on [Recraft AI](https://www.recraft.ai), go to your [profile API page](https://www.recraft.ai/profile/api). Here you can buy API units (credits), and generate an API key.

- You're going to need Node working on your machine so you can run `npx` or `node` commands in your terminal. If you don't have Node, you can install it from [nodejs.org](https://nodejs.org/en/download).

- You will need to have some MCP client installed, for example [Claude Desktop](https://claude.ai/download).

### Smithery

You can find this MCP Server on [Smithery](https://smithery.ai/server/@recraft-ai/mcp-recraft-server). If this MCP is installed from Smithery then all generation results will be stored remotely and URLs to them will be returned. Use Manual setup to store generation results on your local device.

### Manual setup

Modify your `claude_desktop_config.json` file to add the following:

```json
{
  "mcpServers": {
    "recraft": {
      "command": "npx",
      "args": [
        "-y",
        "@recraft-ai/mcp-recraft-server@latest"
      ],
      "env": {
        "RECRAFT_API_KEY": "<YOUR_RECRAFT_API_KEY>",
        "IMAGE_STORAGE_DIRECTORY": "<YOUR_IMAGE_STORAGE_DIRECTORY>",
        "RECRAFT_REMOTE_RESULTS_STORAGE": "<YOUR_REMOTE_RESULTS_STORAGE_INDICATOR>"
      }
    }
  }
}
```

### Manual setup (from source)

Clone this repository:

```bash
git clone https://github.com/recraft-ai/mcp-recraft-server.git
```

In the directory with cloned repository run:

```bash
npm install
npm run build
```

Modify your `claude_desktop_config.json` file to add the following:

```json
{
  "mcpServers": {
    "recraft": {
      "command": "node",
      "args": ["<ABSOLUTE_PATH_TO_CLONED_DIRECTORY>/dist/index.js"],
      "env": {
        "RECRAFT_API_KEY": "<YOUR_RECRAFT_API_KEY>",
        "IMAGE_STORAGE_DIRECTORY": "<YOUR_IMAGE_STORAGE_DIRECTORY>",
        "RECRAFT_REMOTE_RESULTS_STORAGE": "<YOUR_REMOTE_RESULTS_STORAGE_INDICATOR>"
      }
    }
  }
}
```

You can specify these parameters:

- `RECRAFT_API_KEY`: mandatory parameter, your [Recraft AI API](https://www.recraft.ai/profile/api) key.
- `IMAGE_STORAGE_DIRECTORY`: optional parameter, you can specify the directory in which all generated images will be stored. By default this directory is `$HOME_DIR/.mcp-recraft-server`. If `RECRAFT_REMOTE_RESULTS_STORAGE="1"`, the value of this parameter is ignored.
- `RECRAFT_REMOTE_RESULTS_STORAGE`: optional parameter, you can set the value to `"1"`, in this case all generated images will be stored remotely and their URLs will be returned. Also, `IMAGE_STORAGE_DIRECTORY` will be ignored in this case.

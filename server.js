import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;
const apiKey = process.env.BIBLE_API_KEY;

function makeServer() {
  const server = new McpServer({
    name: "bible-mcp",
    version: "1.0.0"
  });

  server.tool(
    "get_bible_verse",
    "Get a Bible verse or passage by reference like John 3:16",
    {
      reference: {
        type: "string",
        description: "Bible reference, for example John 3:16"
      }
    },
    async ({ reference }) => {
      const bibleId = "de4e12af7f28f599-02";
      const url = `https://rest.api.bible/v1/bibles/${bibleId}/search?query=${encodeURIComponent(reference)}`;

      const response = await fetch(url, {
        headers: {
          "api-key": apiKey
        }
      });

      const data = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data)
          }
        ]
      };
    }
  );

  return server;
}

app.post("/mcp", async (req, res) => {
  try {
    const server = makeServer();
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined
    });

    res.on("close", async () => {
      try {
        await transport.close();
        await server.close();
      } catch {}
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: {
          code: -32603,
          message: "Internal server error"
        },
        id: null
      });
    }
  }
});

app.get("/", (req, res) => {
  res.send("Bible MCP server is running");
});

app.listen(port, () => {
  console.log(`MCP server running on port ${port}`);
});

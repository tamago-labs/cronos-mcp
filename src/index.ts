#!/usr/bin/env node

import { validateEnvironment, getAllApiKeys, getAvailableNetworks } from "./config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CronosAnalyticsAgent } from "./agent/analytics";
import { CronosAnalyticsTools, TOOL_COUNT } from "./mcp";

/**
 * Creates an MCP server for Cronos Web3 Analytics
 * Supports both Cronos Mainnet and zkEVM Mainnet
 * Provides comprehensive analytics without requiring private keys
 */
function createCronosMcpServer(agent: CronosAnalyticsAgent) {
    // Create MCP server instance
    const server = new McpServer({
        name: "cronos-mcp",
        version: "0.1.0"
    });

    // Register all analytics tools
    for (const [toolKey, tool] of Object.entries(CronosAnalyticsTools)) {
        server.tool(tool.name, tool.description, tool.schema, async (params: any): Promise<any> => {
            try {
                // Execute the handler with the agent and params
                const result = await tool.handler(agent, params);

                // Format the result as MCP tool response
                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            } catch (error) {
                console.error(`Tool execution error [${tool.name}]:`, error);
                // Handle errors in MCP format
                return {
                    isError: true,
                    content: [
                        {
                            type: "text",
                            text: error instanceof Error
                                ? error.message
                                : "Unknown error occurred",
                        },
                    ],
                };
            }
        });
    }

    console.error(`✅ Registered ${TOOL_COUNT} Cronos analytics tools`);
    return server;
}

async function main() {
    try {
        console.error("🔍 Starting Cronos Analytics MCP Server...");

        // Validate environment before proceeding
        validateEnvironment();

        // Check available networks
        const availableNetworks = getAvailableNetworks();
        
        if (availableNetworks.length === 0) {
            console.error('❌ No API keys found for any network!');
            console.error('💡 Please set CRONOS_EVM_API_KEY and/or CRONOS_ZKEVM_API_KEY');
            process.exit(1);
        }

        // Create Cronos Analytics agent 
        const cronosAgent = new CronosAnalyticsAgent();

        // Create and start MCP server
        const server = createCronosMcpServer(cronosAgent);
        const transport = new StdioServerTransport();
        await server.connect(transport);

        console.error("✅ Cronos Analytics MCP Server is running!");
        console.error("🔧 Available capabilities:");
        console.error("   • Native token balance analytics (CRO/zkCRO)");
        console.error("   • ERC20 token analytics with VVS pricing");
        console.error("   • Advanced wallet analytics & batch queries");
        console.error("   • Transaction & block analysis");
        console.error("   • DeFi protocols (VVS Finance, H2 Finance)");
        console.error("   • VVS Finance DEX integration (top DEX on Cronos)");
        console.error("   • CronosId domain resolution (.cro)");
        console.error("   • Exchange market data");
        console.error(`   • ${availableNetworks.length === 2 ? 'Multi-network' : 'Single-network'} support`);
        
        if (availableNetworks.length === 2) {
            console.error("🌐 Cross-network analytics enabled!");
        } else {
            const hasEvm = availableNetworks.includes('cronos-mainnet');
            const missingNetwork = hasEvm ? 'zkEVM Mainnet' : 'Cronos Mainnet';
            const missingKey = hasEvm ? 'CRONOS_ZKEVM_API_KEY' : 'CRONOS_EVM_API_KEY';
            console.error(`💡 Add ${missingKey} to enable ${missingNetwork} analytics`);
        }

    } catch (error) {
        console.error('❌ Error starting Cronos Analytics MCP server:', error);
        process.exit(1);
    }
}

main();

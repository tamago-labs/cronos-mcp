import { z } from "zod";
import { CronosAnalyticsAgent } from "../../agent/analytics";
import { type McpTool } from "../../types";

export const GetCurrentBlockTool: McpTool = {
    name: "cronos_get_current_block",
    description: "Get the current latest block number and information",
    schema: {
        network: z.enum(['cronos-mainnet', 'cronos-zkevm-mainnet'])
            .optional()
            .describe("Network to query (defaults to configured network)")
    },
    handler: async (agent: CronosAnalyticsAgent, input: Record<string, any>) => {
        try {
            const targetAgent = input.network && input.network !== agent.network 
                ? new CronosAnalyticsAgent(input.network)
                : agent;

            const result = await targetAgent.getCurrentBlock();
            
            return {
                status: "success",
                message: `✅ Current block information retrieved`,
                data: {
                    ...result.data,
                    blockExplorer: `${targetAgent.networkInfo.blockExplorer}/block/${result.data?.blockNumber || 'latest'}`
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to get current block: ${error.message}`);
        }
    }
};

export const GetBlockByTagTool: McpTool = {
    name: "cronos_get_block_by_tag",
    description: "Get block information by block number, 'latest', or 'pending'",
    schema: {
        blockTag: z.string()
            .describe("Block identifier ('latest', 'pending', or block number in hex like '0x1b4')"),
        includeTransactions: z.boolean()
            .optional()
            .describe("Include full transaction details (default: false)"),
        network: z.enum(['cronos-mainnet', 'cronos-zkevm-mainnet'])
            .optional()
            .describe("Network to query (defaults to configured network)")
    },
    handler: async (agent: CronosAnalyticsAgent, input: Record<string, any>) => {
        try {
            const targetAgent = input.network && input.network !== agent.network 
                ? new CronosAnalyticsAgent(input.network)
                : agent;

            const result = await targetAgent.getBlockByTag(input.blockTag, input.includeTransactions || false);
            
            return {
                status: "success",
                message: `✅ Block data retrieved for ${input.blockTag}`,
                data: {
                    ...result.data,
                    blockExplorer: `${targetAgent.networkInfo.blockExplorer}/block/${input.blockTag}`
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to get block data: ${error.message}`);
        }
    }
};

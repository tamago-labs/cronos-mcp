import { z } from "zod";
import { CronosAnalyticsAgent } from "../../agent/analytics";
import { type McpTool } from "../../types";

export const GetTransactionTool: McpTool = {
    name: "cronos_get_transaction",
    description: "Get detailed transaction information by transaction hash",
    schema: {
        transactionHash: z.string()
            .describe("Transaction hash to look up (0x...)")
            .regex(/^0x[a-fA-F0-9]{64}$/, "Must be a valid transaction hash"),
        network: z.enum(['cronos-mainnet', 'cronos-zkevm-mainnet'])
            .optional()
            .describe("Network to query (defaults to configured network)")
    },
    handler: async (agent: CronosAnalyticsAgent, input: Record<string, any>) => {
        try {
            const targetAgent = input.network && input.network !== agent.network 
                ? new CronosAnalyticsAgent(input.network)
                : agent;

            const result = await targetAgent.getTransactionByHash(input.transactionHash);
            
            return {
                status: "success",
                message: `✅ Transaction details retrieved`,
                data: {
                    transactionHash: input.transactionHash,
                    ...result.data,
                    blockExplorer: `${targetAgent.networkInfo.blockExplorer}/tx/${input.transactionHash}`
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to get transaction: ${error.message}`);
        }
    }
};

export const GetTransactionStatusTool: McpTool = {
    name: "cronos_get_transaction_status",
    description: "Get transaction confirmation status and details",
    schema: {
        transactionHash: z.string()
            .describe("Transaction hash to check status (0x...)")
            .regex(/^0x[a-fA-F0-9]{64}$/, "Must be a valid transaction hash"),
        network: z.enum(['cronos-mainnet', 'cronos-zkevm-mainnet'])
            .optional()
            .describe("Network to query (defaults to configured network)")
    },
    handler: async (agent: CronosAnalyticsAgent, input: Record<string, any>) => {
        try {
            const targetAgent = input.network && input.network !== agent.network 
                ? new CronosAnalyticsAgent(input.network)
                : agent;

            const result = await targetAgent.getTransactionStatus(input.transactionHash);
            
            return {
                status: "success",
                message: `✅ Transaction status retrieved`,
                data: {
                    transactionHash: input.transactionHash,
                    ...result.data,
                    blockExplorer: `${targetAgent.networkInfo.blockExplorer}/tx/${input.transactionHash}`,
                    statusSummary: {
                        isConfirmed: result.data?.status === 'confirmed',
                        isPending: result.data?.status === 'pending',
                        hasFailed: result.data?.status === 'failed'
                    }
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to get transaction status: ${error.message}`);
        }
    }
};

import { z } from "zod";
import { CronosAnalyticsAgent } from "../../agent/analytics";
import { type McpTool } from "../../types";

export const ResolveCronosIdTool: McpTool = {
    name: "cronos_resolve_cronosid",
    description: "Resolve a CronosId (like alice.cro) to its wallet address",
    schema: {
        cronosId: z.string()
            .describe("CronosId to resolve (e.g., 'alice.cro')")
            .regex(/^[a-zA-Z0-9_-]+\.cro$/, "Must be a valid CronosId ending with .cro"),
        network: z.enum(['cronos-mainnet', 'cronos-zkevm-mainnet'])
            .optional()
            .describe("Network to query (defaults to configured network)")
    },
    handler: async (agent: CronosAnalyticsAgent, input: Record<string, any>) => {
        try {
            const targetAgent = input.network && input.network !== agent.network 
                ? new CronosAnalyticsAgent(input.network)
                : agent;

            if (!targetAgent.isValidCronosId(input.cronosId)) {
                throw new Error("Invalid CronosId format. Must end with .cro");
            }

            const result = await targetAgent.resolveCronosId(input.cronosId);
            
            return {
                status: "success",
                message: `✅ CronosId resolved: ${input.cronosId}`,
                data: {
                    cronosId: input.cronosId,
                    ...result.data,
                    blockExplorer: result.data?.address 
                        ? `${targetAgent.networkInfo.blockExplorer}/address/${result.data.address}`
                        : undefined
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to resolve CronosId: ${error.message}`);
        }
    }
};

export const ReverseResolveCronosIdTool: McpTool = {
    name: "cronos_reverse_resolve_cronosid",
    description: "Look up the CronosId associated with a wallet address",
    schema: {
        address: z.string()
            .describe("Wallet address to reverse resolve (0x...)")
            .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address"),
        network: z.enum(['cronos-mainnet', 'cronos-zkevm-mainnet'])
            .optional()
            .describe("Network to query (defaults to configured network)")
    },
    handler: async (agent: CronosAnalyticsAgent, input: Record<string, any>) => {
        try {
            const targetAgent = input.network && input.network !== agent.network 
                ? new CronosAnalyticsAgent(input.network)
                : agent;

            const result = await targetAgent.reverseResolveCronosId(input.address);
            
            return {
                status: "success",
                message: `✅ Address reverse resolved: ${input.address}`,
                data: {
                    address: input.address,
                    ...result.data,
                    hasCronosId: !!result.data?.name,
                    blockExplorer: `${targetAgent.networkInfo.blockExplorer}/address/${input.address}`
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to reverse resolve address: ${error.message}`);
        }
    }
};

import { z } from "zod";
import { CronosAnalyticsAgent } from "../../agent/analytics";
import { type McpTool } from "../../types";

export const GetNativeBalanceTool: McpTool = {
    name: "cronos_get_native_balance",
    description: "Get native token balance (CRO/zkCRO) for any address on Cronos networks",
    schema: {
        address: z.string()
            .describe("Wallet address to check balance for (0x...)")
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

            const result = await targetAgent.getNativeTokenBalance(input.address);
            
            return {
                status: "success",
                message: `✅ Native balance retrieved for ${input.address}`,
                data: {
                    address: input.address,
                    ...result.data,
                    blockExplorer: `${targetAgent.networkInfo.blockExplorer}/address/${input.address}`
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to get native balance: ${error.message}`);
        }
    }
};

export const GetERC20BalanceTool: McpTool = {
    name: "cronos_get_erc20_balance",
    description: "Get ERC20 token balance for any address and token contract on Cronos networks",
    schema: {
        address: z.string()
            .describe("Wallet address to check balance for (0x...)")
            .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address"),
        contractAddress: z.string()
            .describe("ERC20 token contract address (0x...)")
            .regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid contract address"),
        network: z.enum(['cronos-mainnet', 'cronos-zkevm-mainnet'])
            .optional()
            .describe("Network to query (defaults to configured network)")
    },
    handler: async (agent: CronosAnalyticsAgent, input: Record<string, any>) => {
        try {
            const targetAgent = input.network && input.network !== agent.network 
                ? new CronosAnalyticsAgent(input.network)
                : agent;

            const result = await targetAgent.getERC20TokenBalance(input.address, input.contractAddress);
            
            return {
                status: "success",
                message: `✅ ERC20 balance retrieved for ${input.address}`,
                data: {
                    address: input.address,
                    contractAddress: input.contractAddress,
                    ...result.data,
                    blockExplorer: `${targetAgent.networkInfo.blockExplorer}/token/${input.contractAddress}?a=${input.address}`
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to get ERC20 balance: ${error.message}`);
        }
    }
};

export const GetWalletOverviewTool: McpTool = {
    name: "cronos_get_wallet_overview",
    description: "Get comprehensive wallet overview including all token balances and portfolio summary",
    schema: {
        address: z.string()
            .describe("Wallet address to analyze (0x...)")
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

            const result = await targetAgent.getWalletOverview(input.address);
            
            return {
                status: "success",
                message: `✅ Wallet overview retrieved for ${input.address}`,
                data: {
                    address: input.address,
                    ...result.data,
                    blockExplorer: `${targetAgent.networkInfo.blockExplorer}/address/${input.address}`,
                    analytics: {
                        totalTokens: result.data?.tokens?.length || 0,
                        hasActivity: result.data?.transactionCount > 0
                    }
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to get wallet overview: ${error.message}`);
        }
    }
};

export const GetNetworkInfoTool: McpTool = {
    name: "cronos_get_network_info",
    description: "Get current network information and statistics",
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

            const result = targetAgent.getNetworkInfo();
            
            return {
                status: "success",
                message: `✅ Network information retrieved`,
                data: {
                    ...result.data,
                    capabilities: [
                        "Native token balance queries",
                        "ERC20 token analytics", 
                        "Transaction analysis",
                        "Contract information",
                        "Exchange data integration"
                    ]
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to get network info: ${error.message}`);
        }
    }
};

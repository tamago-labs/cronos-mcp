import { z } from "zod";
import { CronosAnalyticsAgent } from "../../agent/analytics";
import { VVSAnalytics } from "./vvs_analytics";
import { type McpTool, AddressSchema, NetworkSchema } from "../../types";

export const GetVVSSupplyTool: McpTool = {
    name: "cronos_get_vvs_supply",
    description: "Get VVS token supply information (total, circulating, burned)",
    schema: {
        network: NetworkSchema.optional()
            .describe("Network to query (defaults to configured network)")
    },
    handler: async (agent: CronosAnalyticsAgent, input: Record<string, any>) => {
        try {
            const targetAgent = input.network && input.network !== agent.network 
                ? new CronosAnalyticsAgent(input.network)
                : agent;

            const vvsAnalytics = new VVSAnalytics(targetAgent);
            const result = await vvsAnalytics.getSupplyInfo();
            
            return {
                status: "success",
                message: `✅ VVS supply information retrieved`,
                data: {
                    ...result.data,
                    protocol: "VVS Finance",
                    dex: "Leading DEX on Cronos"
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to get VVS supply info: ${error.message}`);
        }
    }
};

export const GetVVSSummaryTool: McpTool = {
    name: "cronos_get_vvs_summary",
    description: "Get VVS DEX summary with top trading pairs and liquidity data",
    schema: {
        limit: z.number()
            .optional()
            .describe("Limit number of pairs returned (default: 50, max: 1000)") 
            .default(50),
        network: NetworkSchema.optional()
            .describe("Network to query (defaults to configured network)")
    },
    handler: async (agent: CronosAnalyticsAgent, input: Record<string, any>) => {
        try {
            const targetAgent = input.network && input.network !== agent.network 
                ? new CronosAnalyticsAgent(input.network)
                : agent;

            const vvsAnalytics = new VVSAnalytics(targetAgent);
            const result = await vvsAnalytics.getSummary(input.limit || 50);
            
            return {
                status: "success",
                message: `✅ VVS DEX summary retrieved`,
                data: {
                    ...result.data,
                    protocol: "VVS Finance",
                    description: "Top DEX on Cronos network",
                    wcroInfo: {
                        address: "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
                        note: "CRO is represented as WCRO in pairs"
                    }
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to get VVS summary: ${error.message}`);
        }
    }
};

export const GetVVSTokensTool: McpTool = {
    name: "cronos_get_vvs_tokens",
    description: "Get all tokens available on VVS with price information",
    schema: {
        limit: z.number()
            .optional()
            .describe("Limit number of tokens returned (default: 100, max: 1000)") 
            .default(100),
        network: NetworkSchema.optional()
            .describe("Network to query (defaults to configured network)")
    },
    handler: async (agent: CronosAnalyticsAgent, input: Record<string, any>) => {
        try {
            const targetAgent = input.network && input.network !== agent.network 
                ? new CronosAnalyticsAgent(input.network)
                : agent;

            const vvsAnalytics = new VVSAnalytics(targetAgent);
            const result = await vvsAnalytics.getTokens(input.limit || 100);
            
            return {
                status: "success",
                message: `✅ VVS tokens retrieved`,
                data: {
                    ...result.data,
                    protocol: "VVS Finance",
                    wcroInfo: {
                        address: "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
                        note: "Canonical WCRO address used by VVS"
                    }
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to get VVS tokens: ${error.message}`);
        }
    }
};

export const GetVVSTokenInfoTool: McpTool = {
    name: "cronos_get_vvs_token_info",
    description: "Get specific token information from VVS including USD and CRO prices",
    schema: {
        tokenAddress: AddressSchema
            .describe("Token contract address (0x...)"),
        network: NetworkSchema.optional()
            .describe("Network to query (defaults to configured network)")
    },
    handler: async (agent: CronosAnalyticsAgent, input: Record<string, any>) => {
        try {
            const targetAgent = input.network && input.network !== agent.network 
                ? new CronosAnalyticsAgent(input.network)
                : agent;

            const vvsAnalytics = new VVSAnalytics(targetAgent);
            const result = await vvsAnalytics.getTokenInfo(input.tokenAddress);
            
            return {
                status: "success",
                message: `✅ VVS token info retrieved for ${input.tokenAddress}`,
                data: {
                    ...result.data,
                    protocol: "VVS Finance",
                    tokenAddress: input.tokenAddress
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to get VVS token info: ${error.message}`);
        }
    }
};

export const GetVVSPairsTool: McpTool = {
    name: "cronos_get_vvs_pairs",
    description: "Get all trading pairs on VVS with detailed liquidity and volume data",
    schema: {
        limit: z.number()
            .optional()
            .describe("Limit number of pairs returned (default: 100, max: 1000)") 
            .default(100),
        network: NetworkSchema.optional()
            .describe("Network to query (defaults to configured network)")
    },
    handler: async (agent: CronosAnalyticsAgent, input: Record<string, any>) => {
        try {
            const targetAgent = input.network && input.network !== agent.network 
                ? new CronosAnalyticsAgent(input.network)
                : agent;

            const vvsAnalytics = new VVSAnalytics(targetAgent);
            const result = await vvsAnalytics.getPairs(input.limit || 100);
            
            return {
                status: "success",
                message: `✅ VVS trading pairs retrieved`,
                data: {
                    ...result.data,
                    protocol: "VVS Finance",
                    dexInfo: {
                        type: "Automated Market Maker (AMM)",
                        chainName: targetAgent.networkInfo.name,
                        wcroAddress: "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23"
                    }
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to get VVS pairs: ${error.message}`);
        }
    }
};

export const GetVVSTopPairsTool: McpTool = {
    name: "cronos_get_vvs_top_pairs",
    description: "Get top VVS trading pairs by liquidity with analytics",
    schema: {
        limit: z.number()
            .optional()
            .describe("Number of top pairs to return (default: 10, max: 50)")
            .default(10),
        sortBy: z.enum(['liquidity', 'volume'])
            .optional()
            .describe("Sort criteria (default: liquidity)"),
        network: NetworkSchema.optional()
            .describe("Network to query (defaults to configured network)")
    },
    handler: async (agent: CronosAnalyticsAgent, input: Record<string, any>) => {
        try {
            const targetAgent = input.network && input.network !== agent.network 
                ? new CronosAnalyticsAgent(input.network)
                : agent;

            const vvsAnalytics = new VVSAnalytics(targetAgent);
            const result = await vvsAnalytics.getPairs(1000); // Get all pairs first
            
            if (result.status !== 'success' || !result.data?.pairs) {
                throw new Error('Failed to fetch pairs data');
            }

            const sortBy = input.sortBy || 'liquidity';
            const limit = input.limit || 10;
            
            const sortedPairs = result.data.pairs.sort((a: any, b: any) => {
                if (sortBy === 'volume') {
                    return (b.baseVolume + b.quoteVolume) - (a.baseVolume + a.quoteVolume);
                }
                return b.liquidityUSD - a.liquidityUSD;
            }).slice(0, limit);

            const analytics = {
                totalLiquidityInTopPairs: sortedPairs.reduce((sum: number, pair: any) => sum + pair.liquidityUSD, 0),
                totalVolumeInTopPairs: sortedPairs.reduce((sum: number, pair: any) => sum + pair.baseVolume + pair.quoteVolume, 0),
                wcroWallets: sortedPairs.filter((pair: any) => pair.hasWCRO).length,
                stablePairs: sortedPairs.filter((pair: any) => pair.isStablePair).length,
                averageLiquidity: sortedPairs.reduce((sum: number, pair: any) => sum + pair.liquidityUSD, 0) / sortedPairs.length
            };
            
            return {
                status: "success",
                message: `✅ Top ${limit} VVS pairs retrieved (sorted by ${sortBy})`,
                data: {
                    pairs: sortedPairs,
                    analytics,
                    sortBy,
                    limit,
                    protocol: "VVS Finance",
                    updated_at: result.data.updated_at,
                    network: targetAgent.network
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to get top VVS pairs: ${error.message}`);
        }
    }
};

import { z } from "zod";
import { DefiProtocol } from "@crypto.com/developer-platform-client";
import { CronosAnalyticsAgent } from "../../agent/analytics";
import { type McpTool } from "../../types";

export const GetAllFarmsTool: McpTool = {
    name: "cronos_get_all_farms",
    description: "Get all yield farms for DeFi protocols with APR/APY data",
    schema: {
        protocol: z.enum(['h2finance', 'vvsfinance'])
            .describe("DeFi protocol to query"),
        network: z.enum(['cronos-mainnet', 'cronos-zkevm-mainnet'])
            .optional()
            .describe("Network to query (defaults to configured network)")
    },
    handler: async (agent: CronosAnalyticsAgent, input: Record<string, any>) => {
        try {
            const targetAgent = input.network && input.network !== agent.network 
                ? new CronosAnalyticsAgent(input.network)
                : agent;

            const protocol = input.protocol === 'h2finance' ? DefiProtocol.H2 : DefiProtocol.VVS;
            const result = await targetAgent.getAllFarms(protocol);
            
            const farms = Array.isArray(result.data) ? result.data : [];
            const activeFarms = farms.filter((farm: any) => !farm.isFinished);
            
            return {
                status: "success",
                message: `✅ Farm data retrieved for ${input.protocol}`,
                data: {
                    ...result.data,
                    protocol: input.protocol,
                    summary: {
                        totalFarms: farms.length,
                        activeFarms: activeFarms.length,
                        finishedFarms: farms.length - activeFarms.length,
                        averageAPR: activeFarms.length > 0 
                            ? activeFarms.reduce((sum: number, farm: any) => sum + (farm.baseApr || 0), 0) / activeFarms.length
                            : 0
                    }
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to get farms: ${error.message}`);
        }
    }
};

export const GetFarmBySymbolTool: McpTool = {
    name: "cronos_get_farm_by_symbol",
    description: "Get specific farm details by LP symbol",
    schema: {
        protocol: z.enum(['h2finance', 'vvsfinance'])
            .describe("DeFi protocol to query"),
        symbol: z.string()
            .describe("LP symbol to query (e.g., 'zkCRO-MOON', 'CRO-USDC')"),
        network: z.enum(['cronos-mainnet', 'cronos-zkevm-mainnet'])
            .optional()
            .describe("Network to query (defaults to configured network)")
    },
    handler: async (agent: CronosAnalyticsAgent, input: Record<string, any>) => {
        try {
            const targetAgent = input.network && input.network !== agent.network 
                ? new CronosAnalyticsAgent(input.network)
                : agent;

            const protocol = input.protocol === 'h2finance' ? DefiProtocol.H2 : DefiProtocol.VVS;
            const result = await targetAgent.getFarmBySymbol(protocol, input.symbol);
            
            return {
                status: "success",
                message: `✅ Farm details retrieved for ${input.symbol}`,
                data: {
                    ...result.data,
                    protocol: input.protocol,
                    symbol: input.symbol,
                    yieldInfo: {
                        baseAPR: result.data?.baseApr || 0,
                        baseAPY: result.data?.baseApy || 0,
                        lpAPR: result.data?.lpApr || 0,
                        lpAPY: result.data?.lpApy || 0,
                        isActive: !result.data?.isFinished,
                        rewardEndDate: result.data?.rewardEndAt
                    }
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to get farm data: ${error.message}`);
        }
    }
};

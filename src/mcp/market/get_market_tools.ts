import { z } from "zod";
import { CronosAnalyticsAgent } from "../../agent/analytics";
import { type McpTool } from "../../types";

export const GetAllTickersTool: McpTool = {
    name: "cronos_get_all_tickers",
    description: "Get all available trading pairs and market data from Crypto.com Exchange",
    schema: {
        limit: z.number()
            .optional()
            .describe("Limit number of results (default: 50, max: 200)")
            .default(50),
        network: z.enum(['cronos-mainnet', 'cronos-zkevm-mainnet'])
            .optional()
            .describe("Network context (defaults to configured network)")
    },
    handler: async (agent: CronosAnalyticsAgent, input: Record<string, any>) => {
        try {
            const targetAgent = input.network && input.network !== agent.network 
                ? new CronosAnalyticsAgent(input.network)
                : agent;

            const result = await targetAgent.getAllTickers();
            
            // Apply limit if specified
            let tickers = result.data?.result || [];
            if (input.limit && tickers.length > input.limit) {
                tickers = tickers.slice(0, input.limit);
            }
            
            return {
                status: "success",
                message: `✅ Retrieved ${tickers.length} trading pairs`,
                data: {
                    tickers: tickers,
                    count: tickers.length,
                    exchange: "Crypto.com Exchange",
                    network: targetAgent.network,
                    timestamp: Date.now(),
                    summary: {
                        totalPairs: result.data?.result?.length || 0,
                        croBasePairs: tickers.filter((t: any) => t.i && t.i.endsWith('_CRO')).length,
                        usdBasePairs: tickers.filter((t: any) => t.i && (t.i.endsWith('_USD') || t.i.endsWith('_USDT') || t.i.endsWith('_USDC'))).length
                    }
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to get all tickers: ${error.message}`);
        }
    }
};

export const GetTickerTool: McpTool = {
    name: "cronos_get_ticker",
    description: "Get specific trading pair data and market information",
    schema: {
        instrument: z.string()
            .describe("Trading pair instrument name (e.g., 'CRO_USD', 'BTC_CRO')")
            .min(1),
        network: z.enum(['cronos-mainnet', 'cronos-zkevm-mainnet'])
            .optional()
            .describe("Network context (defaults to configured network)")
    },
    handler: async (agent: CronosAnalyticsAgent, input: Record<string, any>) => {
        try {
            const targetAgent = input.network && input.network !== agent.network 
                ? new CronosAnalyticsAgent(input.network)
                : agent;

            const result = await targetAgent.getTickerByInstrument(input.instrument);
            
            return {
                status: "success",
                message: `✅ Ticker data retrieved for ${input.instrument}`,
                data: {
                    instrument: input.instrument,
                    ...result.data,
                    exchange: "Crypto.com Exchange",
                    network: targetAgent.network,
                    timestamp: Date.now(),
                    analysis: {
                        isCROPair: input.instrument.includes('CRO'),
                        isStablePair: input.instrument.includes('USD') || input.instrument.includes('USDT') || input.instrument.includes('USDC'),
                        priceAvailable: !!result.data?.result?.a,
                        volumeAvailable: !!result.data?.result?.v
                    }
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to get ticker for ${input.instrument}: ${error.message}`);
        }
    }
};

export const GetMarketSummaryTool: McpTool = {
    name: "cronos_get_market_summary",
    description: "Get market summary and CRO-related trading data",
    schema: {
        includeCROPairs: z.boolean()
            .optional()
            .describe("Include CRO trading pairs analysis (default: true)"),
        network: z.enum(['cronos-mainnet', 'cronos-zkevm-mainnet'])
            .optional()
            .describe("Network context (defaults to configured network)")
    },
    handler: async (agent: CronosAnalyticsAgent, input: Record<string, any>) => {
        try {
            const targetAgent = input.network && input.network !== agent.network 
                ? new CronosAnalyticsAgent(input.network)
                : agent;

            const includeCRO = input.includeCROPairs !== false;
            
            // Get all tickers for analysis
            const allTickersResult = await targetAgent.getAllTickers();
            const tickers = allTickersResult.data?.result || [];
            
            // Get specific CRO price if available
            let croPrice = null;
            if (includeCRO) {
                try {
                    const croResult = await targetAgent.getTickerByInstrument('CRO_USD');
                    croPrice = croResult.data?.result;
                } catch {
                    // Try alternative CRO pairs
                    try {
                        const croResult = await targetAgent.getTickerByInstrument('CRO_USDT');
                        croPrice = croResult.data?.result;
                    } catch {
                        // CRO price not available
                    }
                }
            }
            
            return {
                status: "success",
                message: `✅ Market summary retrieved`,
                data: {
                    exchange: "Crypto.com Exchange",
                    network: targetAgent.network,
                    timestamp: Date.now(),
                    summary: {
                        totalTradingPairs: tickers.length,
                        croPrice: croPrice,
                        croBasePairs: tickers.filter((t: any) => t.i && t.i.endsWith('_CRO')).length,
                        usdBasePairs: tickers.filter((t: any) => t.i && (t.i.endsWith('_USD') || t.i.endsWith('_USDT') || t.i.endsWith('_USDC'))).length
                    },
                    croPairs: includeCRO ? tickers.filter((t: any) => t.i && (t.i.includes('CRO_') || t.i.includes('_CRO'))) : [],
                    networkInfo: {
                        nativeCurrency: targetAgent.networkInfo.nativeCurrency,
                        blockExplorer: targetAgent.networkInfo.blockExplorer
                    }
                }
            };
        } catch (error: any) {
            throw new Error(`Failed to get market summary: ${error.message}`);
        }
    }
};

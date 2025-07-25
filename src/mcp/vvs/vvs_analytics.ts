import axios from 'axios';
import { CronosAnalyticsAgent } from "../../agent/analytics";
import type { AnalyticsResponse } from '../../types';

const VVS_API_BASE = 'https://api.vvs.finance/info/api';

export class VVSAnalytics {
    private agent: CronosAnalyticsAgent;

    constructor(agent: CronosAnalyticsAgent) {
        this.agent = agent;
    }

    async getSupplyInfo(): Promise<AnalyticsResponse> {
        try {
            const response = await axios.get(`${VVS_API_BASE}/supply`);
            const data = response.data;

            return {
                status: 'success',
                data: {
                    ...data,
                    network: this.agent.network,
                    formatted: {
                        totalSupply: this.formatTokenAmount(data.totalSupply),
                        circulatingSupply: this.formatTokenAmount(data.circulatingSupply),
                        burnedSupply: this.formatTokenAmount(data.burnedSupply),
                        burnRate: ((parseFloat(data.burnedSupply) / parseFloat(data.totalSupply)) * 100).toFixed(2) + '%'
                    }
                },
                network: this.agent.network,
                timestamp: Date.now()
            };
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Failed to get VVS supply info',
                network: this.agent.network
            };
        }
    }

    async getSummary(limit?: number): Promise<AnalyticsResponse> {
        try {
            const response = await axios.get(`${VVS_API_BASE}/summary`);
            const data = response.data;

            let pairs = Object.entries(data.data || {});
            if (limit && pairs.length > limit) {
                pairs = pairs.slice(0, limit);
            }

            const pairAnalysis = pairs.map(([pairId, pairData]: [string, any]) => ({
                pairId,
                ...pairData,
                tokens: pairId.split('_'),
                liquidityUSD: parseFloat(pairData.liquidity || '0'),
                liquidityCRO: parseFloat(pairData.liquidity_CRO || '0'),
                volume24hUSD: parseFloat(pairData.base_volume || '0') + parseFloat(pairData.quote_volume || '0')
            }));

            const totalLiquidityUSD = pairAnalysis.reduce((sum, pair) => sum + pair.liquidityUSD, 0);
            const totalVolume24h = pairAnalysis.reduce((sum, pair) => sum + pair.volume24hUSD, 0);

            return {
                status: 'success',
                data: {
                    updated_at: data.updated_at,
                    pairs: pairAnalysis,
                    network: this.agent.network,
                    summary: {
                        totalPairs: pairAnalysis.length,
                        totalLiquidityUSD: totalLiquidityUSD,
                        totalVolume24hUSD: totalVolume24h,
                        averageLiquidityPerPair: totalLiquidityUSD / pairAnalysis.length,
                        topPairByLiquidity: pairAnalysis.sort((a, b) => b.liquidityUSD - a.liquidityUSD)[0]?.pairId
                    }
                },
                network: this.agent.network,
                timestamp: Date.now()
            };
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Failed to get VVS summary',
                network: this.agent.network
            };
        }
    }

    async getTokens(limit?: number): Promise<AnalyticsResponse> {
        try {
            const response = await axios.get(`${VVS_API_BASE}/tokens`);
            const data = response.data;

            let tokens = Object.entries(data.data || {});
            if (limit && tokens.length > limit) {
                tokens = tokens.slice(0, limit);
            }

            const tokenAnalysis = tokens.map(([address, tokenData]: [string, any]) => ({
                address,
                ...tokenData,
                priceUSD: parseFloat(tokenData.price || '0'),
                priceCRO: parseFloat(tokenData.price_CRO || '0'),
                isWCRO: address.toLowerCase() === '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23'
            }));

            const wcroToken = tokenAnalysis.find(token => token.isWCRO);

            return {
                status: 'success',
                data: {
                    updated_at: data.updated_at,
                    tokens: tokenAnalysis,
                    network: this.agent.network,
                    summary: {
                        totalTokens: tokenAnalysis.length,
                        wcroPrice: wcroToken?.priceUSD || 0,
                        wcroAddress: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
                        tokensWithUSDPrice: tokenAnalysis.filter(t => t.priceUSD > 0).length,
                        tokensWithCROPrice: tokenAnalysis.filter(t => t.priceCRO > 0).length
                    }
                },
                network: this.agent.network,
                timestamp: Date.now()
            };
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Failed to get VVS tokens',
                network: this.agent.network
            };
        }
    }

    async getTokenInfo(tokenAddress: string): Promise<AnalyticsResponse> {
        try {
            const response = await axios.get(`${VVS_API_BASE}/tokens/${tokenAddress}`);
            const data = response.data;

            const isWCRO = tokenAddress.toLowerCase() === '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23';

            return {
                status: 'success',
                data: {
                    ...data.data,
                    address: tokenAddress,
                    updated_at: data.updated_at,
                    network: this.agent.network,
                    priceUSD: parseFloat(data.data?.price || '0'),
                    priceCRO: parseFloat(data.data?.price_CRO || '0'),
                    isWCRO,
                    blockExplorer: `${this.agent.networkInfo.blockExplorer}/token/${tokenAddress}`
                },
                network: this.agent.network,
                timestamp: Date.now()
            };
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Failed to get token info',
                network: this.agent.network
            };
        }
    }

    async getPairs(limit?: number): Promise<AnalyticsResponse> {
        try {
            const response = await axios.get(`${VVS_API_BASE}/pairs`);
            const data = response.data;

            let pairs = Object.entries(data.data || {});
            if (limit && pairs.length > limit) {
                pairs = pairs.slice(0, limit);
            }

            const pairAnalysis = pairs.map(([pairId, pairData]: [string, any]) => ({
                pairId,
                ...pairData,
                tokens: pairId.split('_'),
                liquidityUSD: parseFloat(pairData.liquidity || '0'),
                liquidityCRO: parseFloat(pairData.liquidity_CRO || '0'),
                baseVolume: parseFloat(pairData.base_volume || '0'),
                quoteVolume: parseFloat(pairData.quote_volume || '0'),
                price: parseFloat(pairData.price || '0'),
                hasWCRO: pairId.includes('0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23'),
                isStablePair: this.isStablePair(pairData)
            }));

            const totalLiquidityUSD = pairAnalysis.reduce((sum, pair) => sum + pair.liquidityUSD, 0);
            const wcroWallets = pairAnalysis.filter(pair => pair.hasWCRO);

            return {
                status: 'success',
                data: {
                    updated_at: data.updated_at,
                    pairs: pairAnalysis,
                    network: this.agent.network,
                    summary: {
                        totalPairs: pairAnalysis.length,
                        totalLiquidityUSD: totalLiquidityUSD,
                        wcroPairs: wcroWallets.length,
                        stablePairs: pairAnalysis.filter(p => p.isStablePair).length,
                        topPairsByLiquidity: pairAnalysis
                            .sort((a, b) => b.liquidityUSD - a.liquidityUSD)
                            .slice(0, 5)
                            .map(p => ({ pairId: p.pairId, liquidity: p.liquidityUSD }))
                    }
                },
                network: this.agent.network,
                timestamp: Date.now()
            };
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Failed to get VVS pairs',
                network: this.agent.network
            };
        }
    }

    private formatTokenAmount(amount: string): string {
        const num = parseFloat(amount) / 1e18; // Assuming 18 decimals
        if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`;
        return num.toFixed(2);
    }

    private isStablePair(pairData: any): boolean {
        const stableTokens = ['USDT', 'USDC', 'DAI', 'BUSD'];
        const baseSymbol = pairData.base_symbol?.toUpperCase() || '';
        const quoteSymbol = pairData.quote_symbol?.toUpperCase() || '';
        
        return stableTokens.includes(baseSymbol) || stableTokens.includes(quoteSymbol);
    }
}

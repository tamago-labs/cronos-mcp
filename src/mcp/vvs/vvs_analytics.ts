import axios from 'axios';
import { CronosAnalyticsAgent } from "../../agent/analytics";
import type { AnalyticsResponse } from '../../types';

const VVS_API_BASE = 'https://api.vvs.finance/info/api';

export class VVSAnalytics {
    private agent: CronosAnalyticsAgent;

    constructor(agent: CronosAnalyticsAgent) {
        this.agent = agent;
    }

    // Data validation and sanitization
    private sanitizeNumber(value: any): number {
        if (typeof value === 'string') {
            const num = parseFloat(value);
            // Check for absurd values that indicate data corruption
            if (isNaN(num) || !isFinite(num) || num > 1e15) {
                return 0; // Return 0 for corrupted data
            }
            return num;
        }
        if (typeof value === 'number') {
            if (isNaN(value) || !isFinite(value) || value > 1e15) {
                return 0;
            }
            return value;
        }
        return 0;
    }

    private isValidLiquidityValue(value: number): boolean {
        // Reasonable liquidity should be between $1 and $1B for most pairs
        return value >= 1 && value <= 1e9;
    }

    private isValidPrice(value: number): boolean {
        // Reasonable token prices should be between $0.000001 and $100,000
        return value >= 0.000001 && value <= 100000;
    }

    async getSupplyInfo(): Promise<AnalyticsResponse> {
        try {
            const response = await axios.get(`${VVS_API_BASE}/supply`);
            const data = response.data;

            // Validate supply data
            const totalSupply = this.sanitizeNumber(data.totalSupply);
            const circulatingSupply = this.sanitizeNumber(data.circulatingSupply);
            const burnedSupply = this.sanitizeNumber(data.burnedSupply);

            return {
                status: 'success',
                data: {
                    ...data,
                    network: this.agent.network,
                    raw: {
                        totalSupply,
                        circulatingSupply,
                        burnedSupply
                    },
                    formatted: {
                        totalSupply: this.formatTokenAmount(totalSupply),
                        circulatingSupply: this.formatTokenAmount(circulatingSupply),
                        burnedSupply: this.formatTokenAmount(burnedSupply),
                        burnRate: totalSupply > 0 ? `${((burnedSupply / totalSupply) * 100).toFixed(2)}%` : '0%'
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

    async getPairs(limit?: number): Promise<AnalyticsResponse> {
        try {
            const response = await axios.get(`${VVS_API_BASE}/pairs`);
            const data = response.data;

            let pairs = Object.entries(data.data || {});
            if (limit && pairs.length > limit) {
                pairs = pairs.slice(0, limit);
            }

            const pairAnalysis = pairs.map(([pairId, pairData]: [string, any]) => {
                // Sanitize all numerical values
                let liquidityUSD = this.sanitizeNumber(pairData.liquidity);
                let liquidityCRO = this.sanitizeNumber(pairData.liquidity_CRO);
                let baseVolume = this.sanitizeNumber(pairData.base_volume);
                let quoteVolume = this.sanitizeNumber(pairData.quote_volume);
                let price = this.sanitizeNumber(pairData.price);

                // Additional validation for VVS-specific issues
                if (!this.isValidLiquidityValue(liquidityUSD)) {
                    console.warn(`Invalid liquidity for pair ${pairId}: ${liquidityUSD}, setting to 0`);
                    liquidityUSD = 0;
                }

                if (!this.isValidPrice(price)) {
                    console.warn(`Invalid price for pair ${pairId}: ${price}, setting to 0`);
                    price = 0;
                }

                // Convert from wei if values are too large (common VVS issue)
                if (liquidityUSD > 1e12) {
                    liquidityUSD = liquidityUSD / 1e18; // Convert from wei
                }
                if (liquidityCRO > 1e12) {
                    liquidityCRO = liquidityCRO / 1e18;
                }

                return {
                    pairId,
                    ...pairData,
                    tokens: pairId.split('_'),
                    liquidityUSD,
                    liquidityCRO,
                    baseVolume,
                    quoteVolume,
                    price,
                    hasWCRO: pairId.includes('0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23'),
                    isStablePair: this.isStablePair(pairData),
                    dataQuality: {
                        hasValidLiquidity: liquidityUSD > 0 && this.isValidLiquidityValue(liquidityUSD),
                        hasValidPrice: price > 0 && this.isValidPrice(price),
                        hasVolume: baseVolume > 0 || quoteVolume > 0
                    },
                    formatted: {
                        liquidityUSD: this.formatCurrency(liquidityUSD),
                        liquidityCRO: this.formatTokenAmount(liquidityCRO),
                        baseVolume: this.formatCurrency(baseVolume),
                        quoteVolume: this.formatCurrency(quoteVolume),
                        totalVolume: this.formatCurrency(baseVolume + quoteVolume),
                        price: this.formatPrice(price)
                    }
                };
            });

            // Filter out pairs with invalid data
            const validPairs = pairAnalysis.filter(pair => 
                pair.dataQuality.hasValidLiquidity || pair.dataQuality.hasVolume
            );

            // Sort by valid liquidity
            const sortedPairs = validPairs.sort((a, b) => 
                (b.liquidityUSD || 0) - (a.liquidityUSD || 0)
            );

            const totalLiquidityUSD = sortedPairs.reduce((sum, pair) => sum + (pair.liquidityUSD || 0), 0);
            const totalVolumeUSD = sortedPairs.reduce((sum, pair) => sum + (pair.baseVolume || 0) + (pair.quoteVolume || 0), 0);

            return {
                status: 'success',
                data: {
                    updated_at: data.updated_at,
                    pairs: sortedPairs.slice(0, limit || 50), // Limit results
                    network: this.agent.network,
                    dataQuality: {
                        totalPairs: pairAnalysis.length,
                        validPairs: validPairs.length,
                        invalidPairs: pairAnalysis.length - validPairs.length,
                        dataIssues: pairAnalysis.length - validPairs.length > 0
                    },
                    summary: {
                        totalPairs: validPairs.length,
                        totalLiquidityUSD,
                        totalVolumeUSD,
                        wcroPairs: sortedPairs.filter(pair => pair.hasWCRO).length,
                        stablePairs: sortedPairs.filter(p => p.isStablePair).length,
                        activePairs: sortedPairs.filter(p => p.dataQuality.hasVolume).length,
                        topPairsByLiquidity: sortedPairs
                            .slice(0, 5)
                            .map(p => ({ 
                                pairId: p.pairId, 
                                liquidity: p.liquidityUSD,
                                symbols: `${p.base_symbol}/${p.quote_symbol}`,
                                formatted: {
                                    liquidity: this.formatCurrency(p.liquidityUSD)
                                }
                            })),
                        formatted: {
                            totalLiquidityUSD: this.formatCurrency(totalLiquidityUSD),
                            totalVolumeUSD: this.formatCurrency(totalVolumeUSD),
                            averageLiquidityPerPair: validPairs.length > 0 ? 
                                this.formatCurrency(totalLiquidityUSD / validPairs.length) : '$0'
                        }
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

    async getTokens(limit?: number): Promise<AnalyticsResponse> {
        try {
            const response = await axios.get(`${VVS_API_BASE}/tokens`);
            const data = response.data;

            let tokens = Object.entries(data.data || {});
            if (limit && tokens.length > limit) {
                tokens = tokens.slice(0, limit);
            }

            const tokenAnalysis = tokens.map(([address, tokenData]: [string, any]) => {
                let priceUSD = this.sanitizeNumber(tokenData.price);
                let priceCRO = this.sanitizeNumber(tokenData.price_CRO);
                
                // Validate prices
                if (!this.isValidPrice(priceUSD)) {
                    priceUSD = 0;
                }
                if (!this.isValidPrice(priceCRO)) {
                    priceCRO = 0;
                }

                const isWCRO = address.toLowerCase() === '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23';

                return {
                    address,
                    ...tokenData,
                    priceUSD,
                    priceCRO,
                    isWCRO,
                    dataQuality: {
                        hasValidUSDPrice: priceUSD > 0 && this.isValidPrice(priceUSD),
                        hasValidCROPrice: priceCRO > 0 && this.isValidPrice(priceCRO)
                    },
                    formatted: {
                        priceUSD: this.formatPrice(priceUSD),
                        priceCRO: this.formatPrice(priceCRO),
                        volume24h: tokenData.volume24h ? this.formatCurrency(this.sanitizeNumber(tokenData.volume24h)) : undefined,
                        marketCap: tokenData.marketCap ? this.formatCurrency(this.sanitizeNumber(tokenData.marketCap)) : undefined
                    }
                };
            });

            // Filter valid tokens
            const validTokens = tokenAnalysis.filter(token => 
                token.dataQuality.hasValidUSDPrice || token.dataQuality.hasValidCROPrice
            );

            const wcroToken = validTokens.find(token => token.isWCRO);

            return {
                status: 'success',
                data: {
                    updated_at: data.updated_at,
                    tokens: validTokens,
                    network: this.agent.network,
                    dataQuality: {
                        totalTokens: tokenAnalysis.length,
                        validTokens: validTokens.length,
                        invalidTokens: tokenAnalysis.length - validTokens.length
                    },
                    summary: {
                        totalTokens: validTokens.length,
                        wcroPrice: wcroToken?.priceUSD || 0,
                        wcroAddress: '0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23',
                        tokensWithUSDPrice: validTokens.filter(t => t.dataQuality.hasValidUSDPrice).length,
                        tokensWithCROPrice: validTokens.filter(t => t.dataQuality.hasValidCROPrice).length,
                        formatted: {
                            wcroPrice: this.formatPrice(wcroToken?.priceUSD || 0),
                            averageTokenPrice: validTokens.length > 0 ? 
                                this.formatPrice(validTokens.reduce((sum, t) => sum + t.priceUSD, 0) / validTokens.length) : '$0'
                        }
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

    // Enhanced formatting methods with better validation
    private formatTokenAmount(amount: number | string): string {
        const num = typeof amount === 'string' ? parseFloat(amount) : amount;
        
        if (!isFinite(num) || isNaN(num) || num <= 0) return '0';
        
        // Don't divide by 1e18 if already a reasonable number
        const value = num > 1e15 ? num / 1e18 : num;
        
        if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
        if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
        if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
        if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
        return value.toFixed(2);
    }

    private formatCurrency(amount: number): string {
        if (!isFinite(amount) || isNaN(amount) || amount <= 0) return '$0.00';
        
        if (amount >= 1e12) return `$${(amount / 1e12).toFixed(2)}T`;
        if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
        if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
        if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
        if (amount >= 1) return `$${amount.toFixed(2)}`;
        if (amount >= 0.01) return `$${amount.toFixed(4)}`;
        return `$${amount.toFixed(8)}`;
    }

    private formatPrice(price: number): string {
        if (!isFinite(price) || isNaN(price) || price <= 0) return '$0.00';
        
        if (price >= 1000) return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        if (price >= 1) return `$${price.toFixed(4)}`;
        if (price >= 0.0001) return `$${price.toFixed(6)}`;
        if (price > 0) return `$${price.toFixed(8)}`;
        return '$0.00';
    }

    private isStablePair(pairData: any): boolean {
        const stableTokens = ['USDT', 'USDC', 'DAI', 'BUSD', 'TUSD', 'FRAX'];
        const baseSymbol = pairData.base_symbol?.toUpperCase() || '';
        const quoteSymbol = pairData.quote_symbol?.toUpperCase() || '';
        
        return stableTokens.includes(baseSymbol) || stableTokens.includes(quoteSymbol);
    }
 
}
import { Token, Wallet, Block, Transaction, Exchange, Defi, CronosId } from "@crypto.com/developer-platform-client";
import { DefiProtocol } from "@crypto.com/developer-platform-client";
import { networkInfo, apiKey, initializeClientForNetwork, canSwitchToNetwork, type CronosNetwork } from '../config';
import type { AnalyticsResponse, TokenBalance, TransactionData, NetworkStats } from '../types';

export class CronosAnalyticsAgent {
    public network: CronosNetwork;
    public networkInfo: typeof networkInfo;

    constructor(targetNetwork?: CronosNetwork) {
        this.network = targetNetwork || 'cronos-mainnet';
        this.networkInfo = networkInfo;

        // Initialize client for target network if different
        if (targetNetwork && targetNetwork !== this.network) {
            if (canSwitchToNetwork(targetNetwork)) {
                initializeClientForNetwork(targetNetwork);
                this.network = targetNetwork;
            } else {
                const requiredKey = targetNetwork === 'cronos-mainnet' ? 'CRONOS_EVM_API_KEY' : 'CRONOS_ZKEVM_API_KEY';
                console.warn(`⚠️ Cannot switch to ${targetNetwork}: Missing ${requiredKey}`);
                console.warn(`📍 Continuing with default network: ${this.network}`);
            }
        }

        console.error(`🔍 Cronos Analytics Agent initialized for ${this.network}`);
        console.error(`📍 Network: ${this.networkInfo.name}`);
        console.error(`🔗 Block Explorer: ${this.networkInfo.blockExplorer}`);
    }

    // === BALANCE & TOKEN ANALYTICS ===

    async getNativeTokenBalance(address: string): Promise<AnalyticsResponse> {
        try {
            const result = await Token.getNativeTokenBalance(address);
            return {
                status: 'success',
                data: {
                    ...result.data,
                    network: this.network,
                    currency: this.networkInfo.nativeCurrency
                },
                network: this.network,
                timestamp: Date.now()
            };
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Failed to get native balance',
                network: this.network
            };
        }
    }

    async getERC20TokenBalance(address: string, contractAddress: string): Promise<AnalyticsResponse> {
        try {
            const result = await Token.getERC20TokenBalance(address, contractAddress);
            return {
                status: 'success',
                data: {
                    ...result.data,
                    network: this.network,
                    contractAddress
                },
                network: this.network,
                timestamp: Date.now()
            };
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Failed to get ERC20 balance',
                network: this.network
            };
        }
    }

    async getWalletOverview(address: string): Promise<AnalyticsResponse> {
        try {
            const result = await Wallet.balance(address);
            return {
                status: 'success',
                data: {
                    ...result.data,
                    network: this.network,
                    address
                },
                network: this.network,
                timestamp: Date.now()
            };
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Failed to get wallet overview',
                network: this.network
            };
        }
    }

    // === TRANSACTION ANALYTICS ===

    async getTransactionByHash(transactionHash: string): Promise<AnalyticsResponse> {
        try {
            const result = await Transaction.getTransactionByHash(transactionHash);
            return {
                status: 'success',
                data: {
                    ...result.data,
                    network: this.network,
                    blockExplorer: `${this.networkInfo.blockExplorer}/tx/${transactionHash}`
                },
                network: this.network,
                timestamp: Date.now()
            };
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Failed to get transaction details',
                network: this.network
            };
        }
    }

    async getTransactionStatus(transactionHash: string): Promise<AnalyticsResponse> {
        try {
            const result = await Transaction.getTransactionStatus(transactionHash);
            return {
                status: 'success',
                data: {
                    ...result.data,
                    network: this.network,
                    transactionHash
                },
                network: this.network,
                timestamp: Date.now()
            };
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Failed to get transaction status',
                network: this.network
            };
        }
    }

    // === BLOCK ANALYTICS ===

    async getCurrentBlock(): Promise<AnalyticsResponse> {
        try {
            const result = await Block.getCurrentBlock();
            return {
                status: 'success',
                data: {
                    ...result.data,
                    network: this.network
                },
                network: this.network,
                timestamp: Date.now()
            };
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Failed to get current block',
                network: this.network
            };
        }
    }

    async getBlockByTag(blockTag: string, includeTransactions: boolean = false): Promise<AnalyticsResponse> {
        try {
            const result = await Block.getBlockByTag(blockTag, includeTransactions ? 'true' : 'false');
            return {
                status: 'success',
                data: {
                    ...result.data,
                    network: this.network,
                    blockTag,
                    includeTransactions
                },
                network: this.network,
                timestamp: Date.now()
            };
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Failed to get block data',
                network: this.network
            };
        }
    }

    // === DEFI ANALYTICS ===

    async getWhitelistedTokens(protocol: DefiProtocol): Promise<AnalyticsResponse> {
        try {
            const result = await Defi.getWhitelistedTokens(protocol);
            return {
                status: 'success',
                data: {
                    ...result.data,
                    network: this.network,
                    protocol
                },
                network: this.network,
                timestamp: Date.now()
            };
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Failed to get whitelisted tokens',
                network: this.network
            };
        }
    }

    async getAllFarms(protocol: DefiProtocol): Promise<AnalyticsResponse> {
        try {
            const result = await Defi.getAllFarms(protocol);
            return {
                status: 'success',
                data: {
                    ...result.data,
                    network: this.network,
                    protocol
                },
                network: this.network,
                timestamp: Date.now()
            };
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Failed to get farms',
                network: this.network
            };
        }
    }

    async getFarmBySymbol(protocol: DefiProtocol, symbol: string): Promise<AnalyticsResponse> {
        try {
            const result = await Defi.getFarmBySymbol(protocol, symbol);
            return {
                status: 'success',
                data: {
                    ...result.data,
                    network: this.network,
                    protocol,
                    symbol
                },
                network: this.network,
                timestamp: Date.now()
            };
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Failed to get farm data',
                network: this.network
            };
        }
    }

    // === CRONOS ID ANALYTICS ===

    async resolveCronosId(cronosId: string): Promise<AnalyticsResponse> {
        try {
            const result = await CronosId.forwardResolve(cronosId);
            return {
                status: 'success',
                data: {
                    ...result.data,
                    network: this.network,
                    cronosId
                },
                network: this.network,
                timestamp: Date.now()
            };
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Failed to resolve CronosId',
                network: this.network
            };
        }
    }

    async reverseResolveCronosId(address: string): Promise<AnalyticsResponse> {
        try {
            const result = await CronosId.reverseResolve(address);
            return {
                status: 'success',
                data: {
                    ...result.data,
                    network: this.network,
                    address
                },
                network: this.network,
                timestamp: Date.now()
            };
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Failed to reverse resolve address',
                network: this.network
            };
        }
    }

    // === EXCHANGE & MARKET ANALYTICS ===

    async getAllTickers(): Promise<AnalyticsResponse> {
        try {
            const result = await Exchange.getAllTickers();
            return {
                status: 'success',
                data: {
                    ...result.data,
                    network: this.network,
                    exchangeInfo: 'Crypto.com Exchange data'
                },
                network: this.network,
                timestamp: Date.now()
            };
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Failed to get exchange tickers',
                network: this.network
            };
        }
    }

    async getTickerByInstrument(instrument: string): Promise<AnalyticsResponse> {
        try {
            const result = await Exchange.getTickerByInstrument(instrument);
            return {
                status: 'success',
                data: {
                    ...result.data,
                    network: this.network,
                    instrument
                },
                network: this.network,
                timestamp: Date.now()
            };
        } catch (error: any) {
            return {
                status: 'error',
                message: error.message || 'Failed to get ticker data',
                network: this.network
            };
        }
    }

    // === UTILITY METHODS ===

    getNetworkInfo(): AnalyticsResponse {
        return {
            status: 'success',
            data: {
                network: this.network,
                name: this.networkInfo.name,
                rpcUrl: this.networkInfo.rpcUrl,
                blockExplorer: this.networkInfo.blockExplorer,
                nativeCurrency: this.networkInfo.nativeCurrency,
                hasApiKey: !!apiKey,
                canSwitchNetworks: {
                    'cronos-mainnet': canSwitchToNetwork('cronos-mainnet'),
                    'cronos-zkevm-mainnet': canSwitchToNetwork('cronos-zkevm-mainnet')
                }
            },
            network: this.network,
            timestamp: Date.now()
        };
    }

    // Format large numbers for better readability
    formatBalance(balance: string, decimals: number = 18): string {
        const balanceNum = parseFloat(balance) / Math.pow(10, decimals);
        if (balanceNum >= 1e9) return `${(balanceNum / 1e9).toFixed(2)}B`;
        if (balanceNum >= 1e6) return `${(balanceNum / 1e6).toFixed(2)}M`;
        if (balanceNum >= 1e3) return `${(balanceNum / 1e3).toFixed(2)}K`;
        return balanceNum.toFixed(4);
    }

    // Validate Ethereum address format
    isValidAddress(address: string): boolean {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    // Validate transaction hash format
    isValidTxHash(hash: string): boolean {
        return /^0x[a-fA-F0-9]{64}$/.test(hash);
    }

    // Validate CronosId format
    isValidCronosId(name: string): boolean {
        return CronosId.isCronosId(name);
    }
}

import { CronosEvm, CronosZkEvm, Client } from '@crypto.com/developer-platform-client';

export type CronosNetwork = 'cronos-mainnet' | 'cronos-zkevm-mainnet';

export interface NetworkConfig {
    name: string;
    chain: CronosEvm | CronosZkEvm;
    rpcUrl: string;
    blockExplorer: string;
    nativeCurrency: string;
    apiKeyRequired: boolean;
}

export const NETWORK_CONFIGS: Record<CronosNetwork, NetworkConfig> = {
    'cronos-mainnet': {
        name: 'Cronos Mainnet',
        chain: CronosEvm.Mainnet,
        rpcUrl: 'https://evm.cronos.org',
        blockExplorer: 'https://cronoscan.com',
        nativeCurrency: 'CRO',
        apiKeyRequired: true
    },
    'cronos-zkevm-mainnet': {
        name: 'Cronos zkEVM Mainnet', 
        chain: CronosZkEvm.Mainnet,
        rpcUrl: 'https://mainnet.zkevm.cronos.org',
        blockExplorer: 'https://explorer.zkevm.cronos.org',
        nativeCurrency: 'zkCRO',
        apiKeyRequired: true
    }
};

const getArgs = () =>
    process.argv.reduce((args: any, arg: any) => {
        // long arg
        if (arg.slice(0, 2) === "--") {
            const longArg = arg.split("=");
            const longArgFlag = longArg[0].slice(2);
            const longArgValue = longArg.length > 1 ? longArg[1] : true;
            args[longArgFlag] = longArgValue;
        }
        // flags
        else if (arg[0] === "-") {
            const flags = arg.slice(1).split("");
            flags.forEach((flag: any) => {
                args[flag] = true;
            });
        }
        return args;
    }, {});

const getApiKeys = (): { evmKey: string; zkevmKey: string } => {
    const args = getArgs();
    
    return {
        evmKey: process.env.CRONOS_EVM_API_KEY || args.cronos_evm_api_key || '',
        zkevmKey: process.env.CRONOS_ZKEVM_API_KEY || args.cronos_zkevm_api_key || ''
    };
};

const determineNetwork = (): CronosNetwork => {
    const args = getArgs();
    const { evmKey, zkevmKey } = getApiKeys();
    
    // If network is explicitly specified, use it (for override)
    if (args.network) {
        const network = args.network as CronosNetwork;
        if (network in NETWORK_CONFIGS) {
            return network;
        }
        throw new Error(`Invalid network: ${network}. Must be one of: ${Object.keys(NETWORK_CONFIGS).join(', ')}`);
    }
    
    // Auto-detect network based on available API keys
    if (evmKey && zkevmKey) {
        // Both keys available, default to Cronos Mainnet
        console.error('🔑 Both API keys detected, defaulting to Cronos Mainnet');
        console.error('💡 Use --network=cronos-zkevm-mainnet to use zkEVM instead');
        return 'cronos-mainnet';
    } else if (evmKey) {
        console.error('🔑 Cronos EVM API key detected, using Cronos Mainnet');
        return 'cronos-mainnet';
    } else if (zkevmKey) {
        console.error('🔑 Cronos zkEVM API key detected, using zkEVM Mainnet');
        return 'cronos-zkevm-mainnet';
    } else {
        throw new Error('❌ No API keys provided! Set CRONOS_EVM_API_KEY or CRONOS_ZKEVM_API_KEY');
    }
};

const getApiKeyForNetwork = (network: CronosNetwork): string => {
    const { evmKey, zkevmKey } = getApiKeys();
    return network === 'cronos-mainnet' ? evmKey : zkevmKey;
};

// Initialize configuration
export const network = determineNetwork();
export const networkInfo = NETWORK_CONFIGS[network];
export const apiKey = getApiKeyForNetwork(network);

// Initialize Cronos Client
if (apiKey) {
    Client.init({
        chain: networkInfo.chain,
        apiKey: apiKey
    } as any);
} else {
    console.warn(`⚠️ No API key provided for ${network}. Some features may be limited.`);
}

export function validateEnvironment(): void {
    try {
        const { evmKey, zkevmKey } = getApiKeys();
        const keyType = network === 'cronos-mainnet' ? 'CRONOS_EVM_API_KEY' : 'CRONOS_ZKEVM_API_KEY';
        
        console.error(`✅ Cronos MCP environment configuration valid`);
        console.error(`📍 Active Network: ${networkInfo.name}`);
        console.error(`📍 RPC URL: ${networkInfo.rpcUrl}`);
        console.error(`📍 Block Explorer: ${networkInfo.blockExplorer}`);
        console.error(`📍 Native Currency: ${networkInfo.nativeCurrency}`);
        
        if (apiKey) {
            console.error(`📍 Active API Key (${keyType}): ****${apiKey.slice(-4)}`);
        }
        
        // Show availability of both networks
        console.error(`🌐 Network Availability:`);
        console.error(`   • Cronos Mainnet: ${evmKey ? '✅ Available' : '❌ Missing CRONOS_EVM_API_KEY'}`);
        console.error(`   • zkEVM Mainnet: ${zkevmKey ? '✅ Available' : '❌ Missing CRONOS_ZKEVM_API_KEY'}`);
        
    } catch (error) {
        console.error('❌ Invalid environment configuration:', error);
        throw error;
    }
}

// Helper function to create client for different network
export function initializeClientForNetwork(targetNetwork: CronosNetwork): void {
    const config = NETWORK_CONFIGS[targetNetwork];
    const key = getApiKeyForNetwork(targetNetwork);
    
    if (key) {
        Client.init({
            chain: config.chain,
            apiKey: key
        } as any);
        console.error(`🔄 Switched to ${config.name} with API key ****${key.slice(-4)}`);
    } else {
        const requiredKey = targetNetwork === 'cronos-mainnet' ? 'CRONOS_EVM_API_KEY' : 'CRONOS_ZKEVM_API_KEY';
        throw new Error(`Missing ${requiredKey} for ${config.name}`);
    }
}

// Helper to get all available API keys for validation
export function getAllApiKeys(): Record<CronosNetwork, string> {
    const { evmKey, zkevmKey } = getApiKeys();
    return {
        'cronos-mainnet': evmKey,
        'cronos-zkevm-mainnet': zkevmKey
    };
}

// Helper to check if network switching is possible
export function canSwitchToNetwork(targetNetwork: CronosNetwork): boolean {
    return !!getApiKeyForNetwork(targetNetwork);
}

// Helper to get available networks
export function getAvailableNetworks(): CronosNetwork[] {
    const { evmKey, zkevmKey } = getApiKeys();
    const available: CronosNetwork[] = [];
    
    if (evmKey) available.push('cronos-mainnet');
    if (zkevmKey) available.push('cronos-zkevm-mainnet');
    
    return available;
}

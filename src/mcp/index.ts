// Balance & Token Analytics Tools
import { 
    GetNativeBalanceTool,
    GetERC20BalanceTool,
    GetWalletOverviewTool,
    GetNetworkInfoTool
} from "./balance/get_balance_tools";

// Transaction Analytics Tools
import {
    GetTransactionTool,
    GetTransactionStatusTool
} from "./transaction/get_transaction_tools";

// Block Analytics Tools
import {
    GetCurrentBlockTool,
    GetBlockByTagTool
} from "./block/get_block_tools";

// DeFi Analytics Tools  
import {
    GetAllFarmsTool,
    GetFarmBySymbolTool
} from "./defi/get_defi_tools";
 
// CronosId Tools
import {
    ResolveCronosIdTool,
    ReverseResolveCronosIdTool
} from "./cronosid/get_cronosid_tools";

// VVS Finance DEX Tools
import {
    GetVVSSupplyTool,
    GetVVSSummaryTool,
    GetVVSTokensTool,
    GetVVSTokenInfoTool,
    GetVVSPairsTool,
    GetVVSTopPairsTool
} from "./vvs/get_vvs_tools";

// Market & Exchange Tools
import {
    GetAllTickersTool,
    GetTickerTool,
    GetMarketSummaryTool
} from "./market/get_market_tools";

// Complete Analytics Tools Collection
export const CronosAnalyticsTools = {
    // === BALANCE & TOKEN ANALYTICS (4 tools) ===
    "GetNativeBalanceTool": GetNativeBalanceTool,                    // Native CRO/zkCRO balance
    "GetERC20BalanceTool": GetERC20BalanceTool,                      // ERC20 token balances
    "GetWalletOverviewTool": GetWalletOverviewTool,                  // Complete wallet portfolio
    "GetNetworkInfoTool": GetNetworkInfoTool,                       // Network information

    // === TRANSACTION ANALYTICS (2 tools) ===
    "GetTransactionTool": GetTransactionTool,                       // Transaction details
    "GetTransactionStatusTool": GetTransactionStatusTool,           // Transaction status

    // === BLOCK ANALYTICS (2 tools) ===
    "GetCurrentBlockTool": GetCurrentBlockTool,                     // Current block info
    "GetBlockByTagTool": GetBlockByTagTool,                         // Block by number/tag
 
    // === DEFI ANALYTICS (2 tools) ===
    "GetAllFarmsTool": GetAllFarmsTool,                             // All yield farms
    "GetFarmBySymbolTool": GetFarmBySymbolTool,                     // Specific farm data

    // === CRONOS ID (2 tools) ===
    "ResolveCronosIdTool": ResolveCronosIdTool,                     // Resolve name to address
    "ReverseResolveCronosIdTool": ReverseResolveCronosIdTool,       // Resolve address to name

    // === VVS FINANCE DEX (6 tools) ===
    "GetVVSSupplyTool": GetVVSSupplyTool,                           // VVS token supply info
    "GetVVSSummaryTool": GetVVSSummaryTool,                         // VVS DEX overview
    "GetVVSTokensTool": GetVVSTokensTool,                           // All VVS tokens
    "GetVVSTokenInfoTool": GetVVSTokenInfoTool,                     // Specific token on VVS
    "GetVVSPairsTool": GetVVSPairsTool,                             // All VVS trading pairs
    "GetVVSTopPairsTool": GetVVSTopPairsTool,                       // Top VVS pairs by liquidity/volume

    // === MARKET & EXCHANGE DATA (3 tools) ===
    "GetAllTickersTool": GetAllTickersTool,                         // All trading pairs
    "GetTickerTool": GetTickerTool,                                 // Specific ticker data
    "GetMarketSummaryTool": GetMarketSummaryTool,                   // Market overview
};

// Export count for verification
export const TOOL_COUNT = Object.keys(CronosAnalyticsTools).length;

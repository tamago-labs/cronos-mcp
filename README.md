# Cronos MCP

![NPM Version](https://img.shields.io/npm/v/@tamago-labs/cronos-mcp)

**Cronos MCP** is a Model Context Protocol (MCP) server implementation for Cronos blockchain analytics, compatible with MCP clients like Claude Desktop or Cursor.ai. It provides comprehensive Web3 analytics for both **Cronos Mainnet** and **zkEVM Mainnet** networks with **VVS Finance DEX** integration using the Crypto.com Developer Platform.

## Features

- **22+ MCP tools** covering balance analytics, transaction analysis, DeFi protocols, and market data
- **Auto-network detection** - Automatically detects which network to use based on API keys
- **VVS Finance integration** - Complete DEX analytics for the top DEX on Cronos
- **Advanced wallet analytics** with portfolio tracking and batch processing
- **Real-time pricing data** from VVS Finance API and Crypto.com Exchange
- **Analytics-only approach** - No private keys required, pure read-only blockchain analytics
- **CronosId support** - Resolve .cro domains to addresses and vice versa

## Using with Claude Desktop

1. Install Claude Desktop if you haven't already
2. Open Claude Desktop settings  
3. Add the Cronos MCP client to your configuration:

**Simple Setup (Recommended):**
```json
{
  "mcpServers": {
    "cronos-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@tamago-labs/cronos-mcp",
        "--cronos_evm_api_key=YOUR_CRONOS_EVM_API_KEY"
      ],
      "disabled": false
    }
  }
}
```

**For zkEVM instead:**
```json
{
  "mcpServers": {
    "cronos-mcp": {
      "command": "npx", 
      "args": [
        "-y",
        "@tamago-labs/cronos-mcp",
        "--cronos_zkevm_api_key=YOUR_CRONOS_ZKEVM_API_KEY"
      ],
      "disabled": false
    }
  }
}
```

**Multi-Network Setup (Best Experience):**
```json
{
  "mcpServers": {
    "cronos-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "@tamago-labs/cronos-mcp",
        "--cronos_evm_api_key=YOUR_CRONOS_EVM_API_KEY",
        "--cronos_zkevm_api_key=YOUR_CRONOS_ZKEVM_API_KEY"
      ],
      "disabled": false
    }
  }
}
```

### API Keys Required

Get your API keys from the [Crypto.com Developer Platform](https://developers.crypto.com/):

| Network | API Key Parameter | Environment Variable |
|---------|------------------|---------------------|
| Cronos Mainnet | `--cronos_evm_api_key` | `CRONOS_EVM_API_KEY` |
| zkEVM Mainnet | `--cronos_zkevm_api_key` | `CRONOS_ZKEVM_API_KEY` |

**Network Auto-Detection:**
- Provide **one API key** → Uses that network automatically
- Provide **both API keys** → Defaults to Cronos Mainnet, enables cross-network analytics
- Override with `--network=cronos-zkevm-mainnet` if you want zkEVM as default

## Use Cases

### 1. Portfolio & Wealth Analytics
The agent provides comprehensive portfolio tracking tools:

- **Multi-address monitoring** with batch balance queries
- **Token holdings analysis** with real-time VVS pricing
- **Portfolio valuation** across native and ERC20 tokens
- **Activity scoring** and user behavior analysis
- **Wealth distribution** tracking and whale monitoring

### 2. DeFi Protocol Analytics
The agent integrates with leading Cronos DeFi protocols:
- **VVS Finance DEX** - Complete trading pair analytics, liquidity data, token prices
- **Yield farming analytics** - H2 Finance and VVS Finance farm data with APR/APY
- **Token discovery** - All available tokens with USD and CRO pricing
- **Liquidity analysis** - Top trading pairs by volume and liquidity

### 3. Market Intelligence & Trading
The agent provides real-time market data:
- **Exchange integration** - Live data from Crypto.com Exchange
- **Price discovery** - USD and CRO-denominated prices for all tokens
- **Market overview** - Trading volumes, liquidity metrics, and trends
- **Arbitrage detection** - Cross-platform price comparisons

### 4. User Behavior Analytics
The agent offers advanced user analytics:
- **Transaction pattern analysis** - Activity scoring and behavior tracking
- **Address clustering** - Multi-address portfolio analysis
- **Risk assessment** - Balance distribution and activity indicators
- **KYC support** - Address verification and reputation scoring

## Available Tools (22 Tools)

### Balance & Token Analytics
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `cronos_get_native_balance` | Get native CRO/zkCRO balance for any address | "What's the CRO balance of address 0x..." |
| `cronos_get_erc20_balance` | Get ERC20 token balance for address/contract | "Check USDC balance for wallet 0x..." |
| `cronos_get_wallet_overview` | Complete wallet portfolio analysis | "Show complete portfolio for 0x..." |
| `cronos_get_network_info` | Network information and statistics | "Show current Cronos network status" |

### Advanced Wallet Analytics
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `cronos_get_address_activity` | Comprehensive address activity analysis | "Analyze activity for address 0x..." |
| `cronos_get_multiple_balances` | Batch balance queries for multiple addresses | "Check balances for these 5 addresses" |
| `cronos_get_address_tokens` | Token holdings with VVS pricing | "Show all tokens with values for 0x..." |

### Transaction & Block Analytics
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `cronos_get_transaction` | Detailed transaction information by hash | "Analyze transaction 0xabc..." |
| `cronos_get_transaction_status` | Transaction confirmation status | "Check status of transaction 0x..." |
| `cronos_get_current_block` | Current latest block information | "What's the current block number?" |
| `cronos_get_block_by_tag` | Block data by number, 'latest', or 'pending' | "Show block details for #1000000" |

### VVS Finance DEX Analytics
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `cronos_get_vvs_supply` | VVS token supply information | "Show VVS token supply analytics" |
| `cronos_get_vvs_summary` | VVS DEX overview with top trading pairs | "Show VVS DEX summary" |
| `cronos_get_vvs_tokens` | All tokens available on VVS with prices | "List all VVS tokens with USD prices" |
| `cronos_get_vvs_token_info` | Specific token information from VVS | "Get VVS price data for WCRO" |
| `cronos_get_vvs_pairs` | All VVS trading pairs with liquidity data | "Show all VVS trading pairs" |
| `cronos_get_vvs_top_pairs` | Top VVS pairs by liquidity or volume | "Show top 10 VVS pairs by liquidity" |

### DeFi Protocol Analytics
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `cronos_get_all_farms` | All yield farms with APR/APY data | "Show VVS Finance yield farms" |
| `cronos_get_farm_by_symbol` | Specific farm details by LP symbol | "Get farm details for CRO-USDC pair" |

### CronosId Resolution
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `cronos_resolve_cronosid` | Resolve CronosId (.cro domain) to address | "What address does alice.cro resolve to?" |
| `cronos_reverse_resolve_cronosid` | Find CronosId associated with address | "Does 0x... have a .cro domain?" |

### Market & Exchange Data
| Tool Name | Description | Example Usage |
|-----------|-------------|---------------|
| `cronos_get_all_tickers` | All available trading pairs | "Show all Crypto.com Exchange pairs" |
| `cronos_get_ticker` | Specific trading pair data | "Get CRO_USD price data" |
| `cronos_get_market_summary` | Market overview and CRO analytics | "Show Cronos market summary" |

## Advanced Analytics Workflow Examples

### Complete Portfolio Analysis
```
User: "Analyze the portfolio of address 0x742d35Cc6638C0532C88D6E84Dff35654A5e6A1B"

Agent: 
1. Uses cronos_get_address_tokens to get all token holdings with VVS prices
2. Uses cronos_get_address_activity to analyze transaction patterns
3. Uses cronos_get_native_balance for CRO holdings
4. Provides portfolio valuation, activity score, and recommendations
```

### Cross-Network Analysis (if both API keys provided)
```
User: "Compare the same address across Cronos and zkEVM networks"

Agent:
1. Uses cronos_get_wallet_overview for both networks
2. Uses cronos_get_address_activity to compare activity patterns
3. Analyzes token holdings and portfolio distribution
4. Provides cross-chain insights and optimization recommendations
```

### VVS Finance DEX Analysis
```
User: "Give me a complete analysis of VVS Finance DEX"

Agent:
1. Uses cronos_get_vvs_summary for overall DEX metrics
2. Uses cronos_get_vvs_top_pairs to identify top trading pairs
3. Uses cronos_get_vvs_supply for VVS tokenomics
4. Provides liquidity analysis, trading volume trends, and market insights
```

### Multi-Address Whale Tracking
```
User: "Monitor these 10 whale addresses for balance changes"

Agent:
1. Uses cronos_get_multiple_balances for batch balance checking
2. Uses cronos_get_address_activity for each address
3. Tracks portfolio changes and trading patterns
4. Provides whale movement alerts and market impact analysis
```

## Supported Networks

| Network | Chain ID | Native Currency | Auto-Detection |
|---------|----------|-----------------|----------------|
| Cronos Mainnet | 25 | CRO | `CRONOS_EVM_API_KEY` present |
| zkEVM Mainnet | 388 | zkCRO | `CRONOS_ZKEVM_API_KEY` present |

## Key Integrations

### VVS Finance (Leading DEX on Cronos)
- **Real-time DEX data** from VVS Finance API
- **WCRO integration** (canonical address: `0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23`)
- **Comprehensive analytics** - liquidity, volume, prices
- **Token pricing** in both USD and CRO
- **Top pairs ranking** by liquidity or volume

### Crypto.com Developer Platform
- **Native token balances** for CRO and zkCRO
- **ERC20 token analytics** with detailed metadata
- **Transaction analysis** with comprehensive details
- **Block data** for network monitoring
- **Exchange market data** from Crypto.com Exchange

## Background

Model Context Protocol (MCP), introduced by Claude AI in late 2024, solves the challenge of rapidly evolving AI applications in crypto. Unlike traditional agent kits that tightly couple AI models and components, MCP provides standardized interfaces that remain stable as models evolve.

Cronos MCP leverages this architecture to provide professional-grade Web3 analytics tools that work seamlessly across different AI interfaces, allowing users to perform comprehensive blockchain analysis through natural language interactions without requiring private keys or transaction signing capabilities.

## Installation

### Quick Start
```bash
npm install -g @tamago-labs/cronos-mcp
```

### Development Setup
```bash
git clone https://github.com/tamago-labs/cronos-mcp.git
cd cronos-mcp
npm install
npm run build
```

### Environment Variables (Alternative to CLI args)
```bash
# For Cronos Mainnet
export CRONOS_EVM_API_KEY="your_cronos_evm_api_key"

# For zkEVM Mainnet  
export CRONOS_ZKEVM_API_KEY="your_cronos_zkevm_api_key"

# Then run without CLI args
npx @tamago-labs/cronos-mcp
```

## Troubleshooting

If you're using Ubuntu or another Linux environment with NVM, you'll need to manually configure the path. Follow these steps:

1. Install the Cronos MCP under your current NVM-managed Node.js version.

```bash
npm install -g @tamago-labs/cronos-mcp
```

2. Due to how NVM installs libraries, you may need to use absolute paths in your config. Replace the example values below with your actual username and Node version:

**Simple Setup:**
```json
{
  "mcpServers": {
    "cronos-mcp": {
      "command": "/home/YOUR_NAME/.nvm/versions/node/YOUR_NODE_VERSION/bin/node",
      "args": [
        "/home/YOUR_NAME/.nvm/versions/node/YOUR_NODE_VERSION/bin/cronos-mcp",
        "--cronos_evm_api_key=YOUR_CRONOS_EVM_API_KEY"
      ]
    }
  }
}
```

**Multi-Network Setup:**
```json
{
  "mcpServers": {
    "cronos-mcp": {
      "command": "/home/YOUR_NAME/.nvm/versions/node/YOUR_NODE_VERSION/bin/node",
      "args": [
        "/home/YOUR_NAME/.nvm/versions/node/YOUR_NODE_VERSION/bin/cronos-mcp",
        "--cronos_evm_api_key=YOUR_CRONOS_EVM_API_KEY",
        "--cronos_zkevm_api_key=YOUR_CRONOS_ZKEVM_API_KEY"
      ]
    }
  }
}
```

3. Restart Claude Desktop and it should work now.

## Links

- [Crypto.com Developer Platform](https://developers.crypto.com/)
- [Cronos Documentation](https://docs.cronos.org/)
- [zkEVM Documentation](https://docs.zkevm.cronos.org/)
- [VVS Finance](https://vvs.finance/)
- [Model Context Protocol](https://modelcontextprotocol.io/)

## License

This project is licensed under the MIT License.

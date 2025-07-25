import { z } from "zod";
import { DefiProtocol } from "@crypto.com/developer-platform-client";

export interface McpTool {
    name: string;
    description: string;
    schema: Record<string, any>;
    handler: (agent: any, input: Record<string, any>) => Promise<any>;
}

export interface TokenBalance {
    address: string;
    balance: string;
    symbol?: string;
    name?: string;
    decimals?: number;
    balanceFormatted?: string;
}

export interface TransactionData {
    hash: string;
    from: string;
    to: string;
    value: string;
    gasPrice?: string;
    gasUsed?: string;
    blockNumber?: number;
    timestamp?: number;
    status?: string;
}

export interface NetworkStats {
    chainId: number;
    blockNumber: number;
    gasPrice: string;
    networkName: string;
}

export interface ExchangeData {
    instrument: string;
    price: string;
    volume24h?: string;
    change24h?: string;
}

export interface AnalyticsResponse {
    status: 'success' | 'error';
    message?: string;
    data?: any;
    network?: string;
    timestamp?: number;
}

export interface DefiToken {
    id: number;
    name: string;
    symbol: string;
    address: string;
    decimal: number;
    logoImagePngUrl: string;
    logoImageSvgUrl: string;
    chain: string;
    chainId: number;
}

export interface Farm {
    id: number;
    pid: number;
    lpSymbol: string;
    lpAddress: string;
    baseApr: number;
    baseApy: number;
    lpApr: number;
    lpApy: number;
    isFinished: boolean;
    rewardStartAt: string;
    rewardEndAt?: string;
    chain: string;
    chainId: number;
}

export interface BlockData {
    number: string;
    hash: string;
    parentHash: string;
    timestamp: string;
    gasLimit: string;
    gasUsed: string;
    transactions?: any[];
}

export interface CronosIdData {
    name?: string;
    address?: string;
}

// Utility type for enum validation
export const DefiProtocolSchema = z.enum(['h2finance', 'vvsfinance']);
export const NetworkSchema = z.enum(['cronos-mainnet', 'cronos-zkevm-mainnet']);
export const AddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid Ethereum address");
export const TxHashSchema = z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Must be a valid transaction hash");
export const CronosIdSchema = z.string().regex(/^[a-zA-Z0-9_-]+\.cro$/, "Must be a valid CronosId ending with .cro");

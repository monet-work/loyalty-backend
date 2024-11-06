// types.ts

import { Brand, PointsTransfer } from "@prisma/client";

// Represents a single entry of points with number of points and expiration date
export interface PointEntry {
    points: number;
    expirationDate: string;
}

// Represents an array of PointEntry items
export interface PointsArrayResponse {
    points: PointEntry[];
}

// Updated BrandConfig with pointsArrayPath field
export interface BrandConfig {
    name: string;
    api_base_url: string;
    endpoints: {
        getPoints: string;
        transferPoints: string;
    };
    auth: {
        type: 'bearer_token' | 'api_key';
        token_url?: string;
        api_key?: string;
    };
    schema: {
        points: string; // Maps the 'points' field in each point entry
        expiration_date: string; // Maps the 'expiration_date' field in each point entry
    };
    pointsArrayPath?: string; // Path to the array of points in the response
    customHeaders?: Record<string, string>;
    queryParams?: Record<string, string | number>;
    customBodyParams?: Record<string, Record<string, any>>;
}

// Represents the overall configuration
export interface Config {
    brands: Record<string, BrandConfig>;
}

export interface TransferResponse {
    id: string;
    message: string;
}

export interface BrandDashboardResponse {
    numberOfConsumers: number | null;
    totalTradedInPoints: number | null;
    totalTradedOutPoints: number | null;
    totalTransactions: number;
    brand: PartialBrand;
}

export type PartialBrand = Partial<Brand>;
export type PartialPointTransfer = Partial<PointsTransfer>;
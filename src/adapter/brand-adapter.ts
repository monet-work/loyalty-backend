// brandAdapter.ts

import axios, { AxiosRequestConfig } from 'axios';
import configData from '../config/brand-config.json';
import { BrandConfig, PointEntry, Config, TransferResponse } from '../config/brand-types';
import { EXPIRY_DAYS_FOR_NEWLY_ISSUED_POINTS } from '../config/constants';

const config = configData as Config;

// Utility to retrieve data at a specific path within an object
const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, key) => acc && acc[key], obj);
};

// Helper function to replace placeholders in a URL
const replacePlaceholders = (url: string, params: Record<string, string | number>) => {
    return url.replace(/{(\w+)}/g, (_, key) => {
        return params[key] !== undefined ? params[key].toString() : `{${key}}`;
    });
};
// Utility function to replace placeholders in query parameter values
const templateString = (str: string, params: Record<string, string | number>): string => {
    return str.replace(/{(\w+)}/g, (_, key) => {
        return params[key] !== undefined ? params[key].toString() : `{${key}}`;
    });
};

const templateObject = (obj: Record<string, any>, params: Record<string, string | number>): Record<string, any> => {
    const templatedObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
        console.log("key, value: ", key, typeof value, value);
        // Only template string values; keep other types intact
        templatedObj[key] = typeof value === 'string'
            ? templateString(value, params)
            : typeof value === 'object' && value !== null
                ? templateObject(value, params)  // Recursively handle nested objects
                : value;  // Keep the original type for numbers, booleans, etc.
    }
    return templatedObj;
};

// Modify makeApiCall to handle templated query params
const makeApiCall = async (
    brandConfig: BrandConfig,
    endpoint: keyof BrandConfig['endpoints'],
    method: 'GET' | 'PUT' = 'GET',
    data: Record<string, any> = {},
    pathParams: Record<string, string | number> = {},
    queryParams: Record<string, string | number> = {},
    bodyParams: Record<string, string | number> = {},
): Promise<any> => {
    const endpointUrl = replacePlaceholders(brandConfig.endpoints[endpoint], pathParams);
    const url = `${brandConfig.api_base_url}${endpointUrl}`;

    const headers: Record<string, string> = brandConfig.customHeaders ? { ...brandConfig.customHeaders } : {};
    if (brandConfig.auth.type === 'bearer_token' && brandConfig.auth.token_url) {
        const token = await getBearerToken(brandConfig);
        headers['Authorization'] = `Bearer ${token}`;
    } else if (brandConfig.auth.type === 'api_key' && brandConfig.auth.api_key) {
        headers['Authorization'] = `APIKEY ${brandConfig.auth.api_key}`;
    }

    // Template the query parameters
    console.log("--------------------QUERY PARAMS--------------------------------");
    console.log(brandConfig.queryParams, queryParams);
    const templatedQueryParams = { ...brandConfig.queryParams, ...queryParams };
    const finalQueryParams: Record<string, string> = {};
    for (const [key, value] of Object.entries(templatedQueryParams)) {
        finalQueryParams[key] = typeof value === 'string' ? templateString(value, queryParams) : value.toString();
    }
    console.log(finalQueryParams);

    // Prepare body parameters and template them
    const baseBodyParams = brandConfig.customBodyParams && brandConfig.customBodyParams[endpoint]
        ? { ...data, ...brandConfig.customBodyParams[endpoint] }
        : data;

    console.log("bodyParams: ", bodyParams);
    const templatedData = templateObject(baseBodyParams, bodyParams);

    console.log("templatedData: ", templatedData);

    const axiosConfig: AxiosRequestConfig = {
        method,
        url,
        headers,
        params: finalQueryParams,
        data: method === 'PUT' ? templatedData : undefined,
    };

    const response = await axios(axiosConfig);
    return response.data;
};

// BrandAdapter class with updated fetchPoints method
// brandAdapter.ts

// Rest of the imports and helper functions remain the same

export class BrandAdapter {
    private brandConfig: BrandConfig;

    constructor(brandName: string) {
        this.brandConfig = config.brands[brandName];
    }

    async fetchPoints(userId: string): Promise<PointEntry[]> {
        const data = await makeApiCall(this.brandConfig, 'getPoints', 'GET', {}, {}, { userId: userId });

        // Retrieve the points array based on pointsArrayPath
        const pointsArray: any[] = this.brandConfig.pointsArrayPath
            ? getNestedValue(data, this.brandConfig.pointsArrayPath)
            : data;

        if (!Array.isArray(pointsArray)) {
            throw new Error(`Points data at path '${this.brandConfig.pointsArrayPath}' is not an array`);
        }

        // Map each point entry based on schema
        return pointsArray.map((item) => ({
            points: item[this.brandConfig.schema.points],
            expirationDate: item[this.brandConfig.schema.expiration_date],
        }));
    }

    async transferPoints(fromUserId: string, points: number): Promise<TransferResponse> {
        const payload = {};
        const today = new Date();
        const futureDate = new Date(today);
        futureDate.setDate(today.getDate() + EXPIRY_DAYS_FOR_NEWLY_ISSUED_POINTS);
        const response = await makeApiCall(this.brandConfig, 'transferPoints', 'PUT', payload, {}, { userId: fromUserId }, { points: points, userId: fromUserId, expiration_date: futureDate.toDateString() });

        return {
            id: response.id,
            message: response.message,
        };
    }
}


// Helper to get bearer token if needed
const getBearerToken = async (brandConfig: BrandConfig): Promise<string> => {
    const response = await axios.post(brandConfig.auth.token_url!, {
        client_id: 'YOUR_CLIENT_ID',
        client_secret: 'YOUR_CLIENT_SECRET',
        grant_type: 'client_credentials',
    });
    return response.data.access_token;
};

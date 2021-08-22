import Axios, {AxiosError, AxiosInstance, ResponseType} from 'axios';
import {FerdigApiError, FerdigApiErrorData} from './FerdigApiError';

export enum HTTP_METHOD {
    GET = 'GET',
    POST = 'POST',
    PATCH = 'PATCH',
    PUT = 'PUT',
    'DELETE' = 'DELETE'
}

export interface ApiRequestConfig {
    host?: string;
    token?: string;
}

interface RequestParams {
    method: HTTP_METHOD;
    path: string;
    payload?: Record<never, never>;
    responseType?: ResponseType;
    contentType?: string;
}

export default class ApiRequest {
    private readonly axiosInstance: AxiosInstance;

    public constructor(initialConfig?: ApiRequestConfig) {
        this.axiosInstance = Axios.create();

        if (initialConfig) {
            this.doInitialConfig(initialConfig);
        }
    }

    public doInitialConfig(config: ApiRequestConfig): void {
        if (config.host) {
            this.setHost(config.host);
        }

        if (config.token) {
            this.setToken(config.token);
        }
    }

    public setToken(token: string | null): this {
        if (!token) {
            delete this.axiosInstance.defaults.headers.authorization;
            return this;
        }
        this.axiosInstance.defaults.headers.authorization = `Bearer ${token}`;

        return this;
    }

    public setHost(host: string): this {
        if (!host) {
            throw new Error('Please provide a host');
        }

        this.axiosInstance.defaults.baseURL = host + '/api';

        return this;
    }

    public async request<T>({method, path, payload, responseType, contentType}: RequestParams): Promise<T> {
        const headersMerged: Record<string, string> = {};

        if (contentType) {
            headersMerged['Content-Type'] = 'multipart/form-data';
        }

        try {
            const response = await this.axiosInstance.request<T>({
                method,
                url: path,
                data: payload,
                responseType,
                headers: headersMerged,
            });
            return response.data;
        } catch (e) {
            const axiosError = e as AxiosError;

            if (!axiosError.response) {
                throw e;
            }

            const ferdigError = axiosError.response.data as FerdigApiErrorData;
            throw new FerdigApiError(ferdigError);
        }
    }
}

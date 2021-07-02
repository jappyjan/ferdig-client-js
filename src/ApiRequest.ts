import Axios, {AxiosInstance} from 'axios';

export enum HTTP_METHOD {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    'DELETE' = 'DELETE'
}

export interface ApiRequestConfig {
    host?: string;
    token?: string;
}

export default class ApiRequest {
    private readonly axiosInstance: AxiosInstance;

    public constructor(initialConfig?: ApiRequestConfig) {
        this.axiosInstance = Axios.create();

        if (initialConfig) {
            this.doInitialConfig(initialConfig);
        }
    }

    public doInitialConfig(config: ApiRequestConfig) {
        if (config.host) {
            this.setHost(config.host);
        }

        if (config.token) {
            this.setToken(config.token);
        }
    }

    public setToken(token: string | null) {
        if (!token) {
            delete this.axiosInstance.defaults.headers.authorization;
            return;
        }
        this.axiosInstance.defaults.headers.authorization = `Bearer ${token}`;

        return this;
    }

    public setHost(host: string) {
        if (!host) {
            throw new Error('Please provide a host');
        }

        this.axiosInstance.defaults.baseURL = host + '/api';

        return this;
    }

    public async request<T>(method: HTTP_METHOD, path: string, payload?: Record<never, never>) {
        const response = await this.axiosInstance.request<T>({
            method,
            url: path,
            data: payload,
        });

        return response.data;
    }
}

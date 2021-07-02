import ApiRequest, {ApiRequestConfig} from './ApiRequest';
import {FerdigApplicationsClient} from './Applications';
import {FerdigAuthClient} from './Auth';

export class FerdigClient {
    public readonly applications: FerdigApplicationsClient;
    public readonly auth: FerdigAuthClient;
    private readonly apiClient: ApiRequest;

    public constructor(config: ApiRequestConfig) {
        this.apiClient = new ApiRequest(config);
        this.applications = new FerdigApplicationsClient(this.apiClient);
        this.auth = new FerdigAuthClient(this.apiClient);
    }

    public setToken(token: string | null): this {
        this.apiClient.setToken(token);
        return this;
    }

    public setHost(host: string): this {
        this.apiClient.setHost(host);
        return this;
    }
}

import ApiRequest, {ApiRequestConfig} from './ApiRequest';
import {FerdigApplicationsClient} from './Applications';

export class FerdigClient {
    public readonly applications: FerdigApplicationsClient;
    private readonly apiClient: ApiRequest;

    public constructor(config: ApiRequestConfig) {
        this.apiClient = new ApiRequest(config);
        this.applications = new FerdigApplicationsClient(this.apiClient);
    }

    public setToken(token: string | null) {
        this.apiClient.setToken(token);
        return this;
    }

    public setHost(host: string) {
        this.apiClient.setHost(host);
        return this;
    }
}

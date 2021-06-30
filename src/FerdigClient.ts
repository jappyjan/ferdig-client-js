import ApiRequest, {ApiRequestConfig} from './ApiRequest';
import {FerdigApplicationsClient} from './Applications';

export class FerdigClient {
    private readonly apiClient: ApiRequest;
    private readonly applications: FerdigApplicationsClient;

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

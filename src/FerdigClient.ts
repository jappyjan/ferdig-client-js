import {FerdigCollectionsClient} from './Collections';
import ApiRequest, {ApiRequestConfig} from './ApiRequest';

interface FerdigConfig extends ApiRequestConfig {
    applicationId: string;
}

export class FerdigClient {
    public readonly collections: FerdigCollectionsClient;
    private readonly apiClient: ApiRequest;

    public constructor(config: FerdigConfig) {
        this.apiClient = new ApiRequest(config);
        this.collections = new FerdigCollectionsClient(this.apiClient, config.applicationId);
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

import ApiRequest, {ApiRequestConfig} from './ApiRequest';
import {FerdigApplicationsClient} from './Applications';
import {FerdigAuthClient} from './Auth';
import {SocketClient} from './Socket';

export class FerdigClient {
    public readonly applications: FerdigApplicationsClient;
    public readonly auth: FerdigAuthClient;
    private readonly apiClient: ApiRequest;
    private readonly socketClient: SocketClient;

    public constructor(config: ApiRequestConfig) {
        this.apiClient = new ApiRequest(config);
        this.socketClient = new SocketClient(config);

        this.applications = new FerdigApplicationsClient(this.apiClient, this.socketClient);
        this.auth = new FerdigAuthClient(this.apiClient, this.socketClient);
    }


    public setToken(token: string | null): this {
        this.apiClient.setToken(token);
        this.socketClient.setToken(token);
        return this;
    }

    public setHost(host: string): this {
        this.apiClient.setHost(host);
        this.socketClient.setHost(host);
        return this;
    }
}

import ApiRequest, {ApiRequestConfig} from './ApiRequest';
import {FerdigApplicationsClient} from './Applications';
import {FerdigAuthClient} from './Auth';
import {BehaviorSubject} from 'rxjs';
import {FerdigUsersClient} from './Users';

export class FerdigClient {
    public readonly applications: FerdigApplicationsClient;
    public readonly auth: FerdigAuthClient;
    private readonly apiClient: ApiRequest;
    private readonly config: BehaviorSubject<ApiRequestConfig>;
    private readonly users: FerdigUsersClient;

    public constructor(config: ApiRequestConfig) {
        this.apiClient = new ApiRequest(config);
        this.config = new BehaviorSubject<ApiRequestConfig>(config);

        this.applications = new FerdigApplicationsClient(this.apiClient, this.config);
        this.auth = new FerdigAuthClient(this.apiClient);
        this.users = new FerdigUsersClient(this.apiClient);
    }


    public setToken(token: string | null): this {
        this.apiClient.setToken(token);
        this.config.next({
            ...this.config.value,
            token,
        });
        return this;
    }

    public setHost(host: string): this {
        this.apiClient.setHost(host);
        this.config.next({
            ...this.config.value,
            host,
        });
        return this;
    }
}

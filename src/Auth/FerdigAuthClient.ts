import {BasicApiClient} from '../BasicApiClient';
import ApiRequest, {HTTP_METHOD} from '../ApiRequest';
import {FerdigUser} from '../Shared-Interfaces';
import {SocketClient} from '../Socket';

export interface FerdigAuthSignupPayload {
    email: string;
    password: string;
    applicationId: string | null;
}

export interface FerdigAuthStartSessionPayload {
    email: string;
    password: string;
}

export interface FerdigUserWithSessionToken extends FerdigUser{
    token: string;
}

export class FerdigAuthClient extends BasicApiClient {
    public constructor(api: ApiRequest, socket: SocketClient) {
        const basePath = '/auth'
        super(api, socket, basePath);
    }

    public async signUp(data: FerdigAuthSignupPayload): Promise<FerdigUser> {
        return await this.api.request<FerdigUser>(
            HTTP_METHOD.POST,
            `${this.basePath}/signup`,
            data,
        );
    }

    public async startSession(data: FerdigAuthStartSessionPayload, updateToken = true): Promise<FerdigUserWithSessionToken> {
        const response = await this.api.request<FerdigUserWithSessionToken>(
            HTTP_METHOD.POST,
            `${this.basePath}/sessions`,
            data,
        );

        if (updateToken) {
            this.api.setToken(response.token);
        }

        return response;
    }

    public async getCurrentUser(): Promise<FerdigUser> {
        return await this.api.request<FerdigUserWithSessionToken>(
            HTTP_METHOD.GET,
            `${this.basePath}/sessions/current`,
        );
    }
}

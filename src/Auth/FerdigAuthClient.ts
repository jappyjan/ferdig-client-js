import {BasicApiClient} from '../BasicApiClient';
import ApiRequest, {HTTP_METHOD} from '../ApiRequest';
import {FerdigUser} from '../Shared-Interfaces';

export interface FerdigAuthSignupPayload {
    email: string;
    password: string;
    applicationId: string | null;
}

export interface FerdigAuthStartLocalSessionPayload {
    email: string;
    password: string;
}

export interface FerdigUserWithSessionToken extends FerdigUser {
    token: string;
}

interface StartSessionParams {
    protocol: 'local' | 'anonymous';
    data?: FerdigAuthStartLocalSessionPayload;
    updateToken?: boolean;
}

export class FerdigAuthClient extends BasicApiClient {
    public constructor(api: ApiRequest) {
        const basePath = '/auth'
        super(api, basePath);
    }

    public async signUp(data: FerdigAuthSignupPayload): Promise<FerdigUser> {
        return await this.api.request<FerdigUser>(
            {method: HTTP_METHOD.POST, path: `${this.basePath}/signup`, payload: data},
        );
    }

    public async startSession(props: StartSessionParams): Promise<FerdigUserWithSessionToken> {
        const {protocol, data, updateToken = true} = props;

        const path = `${this.basePath}/sessions/${protocol}`;

        const response = await this.api.request<FerdigUserWithSessionToken>(
            {
                method: HTTP_METHOD.POST,
                path,
                payload: data,
                headers: {
                    authorization: ''
                }
            },
        );

        if (updateToken) {
            this.api.setToken(response.token);
        }

        return response;
    }


    public async getCurrentUser(): Promise<FerdigUser> {
        return await this.api.request<FerdigUserWithSessionToken>(
            {
                method: HTTP_METHOD.GET, path: `${this.basePath}
/
    sessions
/
    current
`,
            },
        );
    }
}

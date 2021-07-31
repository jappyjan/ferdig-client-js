import {BasicApiClient} from '../BasicApiClient';
import ApiRequest, {HTTP_METHOD} from '../ApiRequest';

export class FerdigUsersClient extends BasicApiClient {
    public constructor(api: ApiRequest) {
        const basePath = '/users'
        super(api, basePath);
    }

    public async verifyEmail(userId: string, token: string): Promise<void> {
        await this.api.request(
            HTTP_METHOD.POST,
            `${this.basePath}/${userId}/verify-email`,
            {token},
        );
    }
}

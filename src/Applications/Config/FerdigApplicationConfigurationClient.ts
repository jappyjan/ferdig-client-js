import {BasicApiClient} from '../../BasicApiClient';
import ApiRequest, {HTTP_METHOD} from '../../ApiRequest';

export class FerdigApplicationConfigurationClient extends BasicApiClient {
    private readonly applicationId: string;

    public constructor(api: ApiRequest, applicationId: string) {
        const basePath = `/applications/${applicationId}/configuration`
        super(api, basePath);
        this.applicationId = applicationId;
    }

    public async setLoginRequiresValidEmail(value: boolean): Promise<void> {
        await this.api.request(
            HTTP_METHOD.PATCH,
            this.basePath,
            {
                loginRequiresValidEmail: value,
            },
        );
    }
}

import ApiRequest from './ApiRequest';

export abstract class BasicApiClient {
    protected readonly api: ApiRequest;
    protected readonly basePath: string;

    protected constructor(api: ApiRequest, basePath: string) {
        this.api = api;
        this.basePath = basePath;
    }
}

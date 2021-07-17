import ApiRequest from './ApiRequest';
import {SocketClient} from './Socket';

export abstract class BasicApiClient {
    protected readonly api: ApiRequest;
    protected readonly basePath: string;
    protected readonly socket: SocketClient;

    protected constructor(api: ApiRequest, socket: SocketClient, basePath: string) {
        this.api = api;
        this.socket = socket;
        this.basePath = basePath;
    }
}

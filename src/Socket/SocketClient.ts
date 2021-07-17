import {io as IO, Socket} from 'socket.io-client';

interface Config {
    host?: string;
    token?: string;
}

export class SocketClient {
    private io: Socket | null = null;
    private config: Config;

    public constructor(config: Config) {
        this.config = config;
        this.init();
    }

    private init(): void {
        if (this.io) {
            this.io.offAny();
            this.io.disconnect();
            this.io = null;
        }

        if (!this.config.host) {
            return;
        }

        let options: {auth: {token: string}};
        if (this.config.token) {
            options = {
                auth: {
                    token: this.config.token
                }
            }
        }

        this.io = IO(this.config.host, options);
    }

    public setHost(host: string): void {
        this.config.host = host;
        this.init()
    }

    public setToken(token: string): void {
        this.config.token = token;
        this.init()
    }

    public on(eventName: string, callback: (...args: unknown[]) => unknown): void {
        this.io.on(eventName, callback);
    }

    public off(eventName?: string, listener?: (...args: unknown[]) => unknown): void {
        this.io.off(eventName, listener);
    }
}

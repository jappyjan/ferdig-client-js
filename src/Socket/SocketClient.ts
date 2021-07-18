import {io as IO, Socket} from 'socket.io-client';
import {BehaviorSubject} from 'rxjs';

interface Config {
    host?: string;
    token?: string;
    namespace?: string;
}

export class SocketClient {
    private io: Socket | null = null;
    private config: Config;

    public constructor(configObserver: BehaviorSubject<Config>, namespaceName: string) {
        configObserver.subscribe((config) => {
            this.config = {
                ...config,
                namespace: namespaceName,
            };
            this.init();
        });

        this.init();
    }

    private init(): void {
        if (this.io) {
            this.io.offAny();
            this.io.disconnect();
            this.io = null;
        }

        if (!this.config.host || !this.config.namespace) {
            console.warn('socket no host or namespace', this.config);
            return;
        }

        let options: { auth: { token: string } };
        if (this.config.token) {
            options = {
                auth: {
                    token: this.config.token,
                },
            }
        }

        const socketUrl = `${this.config.host}/${this.config.namespace}`;
        this.io = IO(socketUrl, options);
        this.io.on('connected', () => console.info('socket connected'));
    }

    public on(
        eventName: string,
        callback: (...args: unknown[]) => unknown,
    ): void {
        this.io.on(eventName, callback);
    }

    public off(eventName?: string, listener?: (...args: unknown[]) => unknown): void {
        this.io.off(eventName, listener);
    }
}

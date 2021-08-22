import {io as IO, Socket} from 'socket.io-client';
import {BehaviorSubject} from 'rxjs';

interface Config {
    host?: string;
    token?: string;
    namespace?: string;
}

type Listener = (...args: unknown[]) => unknown;

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
        this.io.onAny((...args: unknown[]) => {
            console.log(...args);
        })
    }

    public on(
        eventName: string,
        callback: Listener,
    ): void {
        if (!this.io) {
            throw new Error('IO not initialised');
        }

        this.io.on(eventName, callback);
    }

    public off(eventName: string, listener: (...args: unknown[]) => unknown): void {
        if (!this.io) {
            throw new Error('IO not initialised');
        }

        this.io.off(eventName, listener);
    }
}

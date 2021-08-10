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
    private listeners: Array<{eventName: string; callback: Listener}> = [];

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

        this.io.onAny((eventName, args) => {
            const listeners = this.listeners[eventName] ?? [];

            if (eventName === 'applications/d04c31cb-4a7c-4f55-b223-437316c457cd/collections/4ca017f7-baa7-4a43-80e6-a7aaf9573db6/columns/*') {
                console.log('event', eventName, listeners, this.listeners);
            }
            listeners.forEach(listener => listener(...args));
        });
    }

    public on(
        eventName: string,
        callback: Listener,
    ): void {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        if (eventName === 'applications/d04c31cb-4a7c-4f55-b223-437316c457cd/collections/4ca017f7-baa7-4a43-80e6-a7aaf9573db6/columns/*') {
            console.log('listening', eventName);
        }
        this.listeners.push({
            callback,
            eventName,
        });
    }

    public off(eventName: string, listener: (...args: unknown[]) => unknown): void {
        if (eventName === 'applications/d04c31cb-4a7c-4f55-b223-437316c457cd/collections/4ca017f7-baa7-4a43-80e6-a7aaf9573db6/columns/*') {
            console.log('stop listening', eventName);
        }
        this.listeners[eventName] = this.listeners[eventName].filter((current) => current !== listener);
    }
}

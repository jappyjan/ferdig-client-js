import {BasicCrudClient, FerdigListResult} from './BasicCrudClient';
import ApiRequest, {ApiRequestConfig} from './ApiRequest';
import {SocketClient} from './Socket';
import {BehaviorSubject, finalize} from 'rxjs';

export interface SocketChangeEvent<ItemType extends { id: string }, IdentifierType> {
    item: ItemType;
    identifier: IdentifierType;
}

export type FerdigObservation<T> = {
    subscribe: (cb: ((value: T) => unknown)) => void;
    complete: () => void;
    readonly value: T;
    next: (value: T) => void;
}

export abstract class AbstractSocketCrudClient<ReturnType extends { id: string }, CreateType, UpdateType, ListParams, SocketChangeEventIdentifierType> extends BasicCrudClient<ReturnType, CreateType, UpdateType, ListParams> {
    protected readonly socket: SocketClient;
    private readonly socketChangeEventName: string;
    private readonly socketChangeEventFilter: (identifier: SocketChangeEventIdentifierType) => boolean;
    private readonly socketChangeEventItemMatcher: (identifier: SocketChangeEventIdentifierType, item: ReturnType) => boolean;

    protected constructor(
        api: ApiRequest,
        config: BehaviorSubject<ApiRequestConfig>,
        basePath: string,
        socketNameSpace: string,
        socketChangeEventName: string,
        socketChangeEventFilter: (identifier: SocketChangeEventIdentifierType) => boolean,
        socketChangeEventItemMatcher: (identifier: SocketChangeEventIdentifierType, item: ReturnType) => boolean,
    ) {
        super(api, basePath);

        this.socket = new SocketClient(config, socketNameSpace);
        this.socketChangeEventName = socketChangeEventName;
        this.socketChangeEventFilter = socketChangeEventFilter;
        this.socketChangeEventItemMatcher = socketChangeEventItemMatcher;
    }

    protected observeOne(item: ReturnType): FerdigObservation<ReturnType | null> {
        const subject = new BehaviorSubject(item);

        const onChange = async (event: SocketChangeEvent<ReturnType, SocketChangeEventIdentifierType>) => {
            const {item} = event;

            const transformed = item === null ? null : await this.objectTransformer(item);

            subject.next(transformed);

            if (item === null) {
                subject.complete();
            }
        };

        subject.pipe(
            finalize(() => {
                this.socket.off(
                    this.socketChangeEventName,
                    onChange,
                );
            }),
        );

        this.socket.on(
            this.socketChangeEventName,
            onChange,
        );

        return subject;
    }

    // noinspection JSUnusedGlobalSymbols
    public async createAndObserve(data: CreateType): Promise<FerdigObservation<ReturnType | null>> {
        const item = await this.create(data);
        return this.observeOne(item);
    }

    public async getAndObserve(id: string): Promise<FerdigObservation<ReturnType | null>> {
        const item = await this.get(id);
        return this.observeOne(item);
    }

    public async listAndObserve(
        params: ListParams,
    ): Promise<FerdigObservation<FerdigListResult<ReturnType>>> {
        const result = await this.list(params);
        const resultSubject = new BehaviorSubject(result);

        const onChange = async (event: SocketChangeEvent<ReturnType, SocketChangeEventIdentifierType>) => {
            if (!this.socketChangeEventFilter(event.identifier)) {
                return;
            }

            const transformed = await this.objectTransformer(event.item);

            // TODO: filter by params.filter
            const items: Array<ReturnType> = [];

            let found = false;
            resultSubject.value.items.forEach((item) => {
                if (this.socketChangeEventItemMatcher(event.identifier, item)) {
                    found = true;
                    if (event.item === null) {
                        return;
                    }

                    items.push(transformed);
                    return;
                }

                items.push(item);
            });

            if (!found && event.item !== null) {
                items.push(transformed);
            }

            resultSubject.next({
                ...resultSubject.value,
                items,
            });
        };

        resultSubject.pipe(
            finalize(() => {
                this.socket.off(
                    this.socketChangeEventName,
                    onChange
                );
            }),
        );

        this.socket.on(
            this.socketChangeEventName,
            onChange,
        );

        return resultSubject;
    }
}

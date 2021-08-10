import {BasicCrudClient, FerdigListResult} from './BasicCrudClient';
import ApiRequest, {ApiRequestConfig} from './ApiRequest';
import {SocketClient} from './Socket';
import {BehaviorSubject, finalize} from 'rxjs';

export interface SocketChangeEvent<ItemType extends { id: string }, IdentifierType> {
    item: ItemType;
    identifier: IdentifierType;
}

export abstract class AbstractSocketCrudClient<ReturnType extends { id: string }, CreateType, UpdateType, ListParams, SocketChangeEventIdentifierType> extends BasicCrudClient<ReturnType, CreateType, UpdateType, ListParams> {
    protected readonly socket: SocketClient;
    private readonly socketChangeEventBaseName: string;
    private readonly socketChangeEventFilter: (identifier: SocketChangeEventIdentifierType) => boolean;
    private readonly socketChangeEventItemMatcher: (identifier: SocketChangeEventIdentifierType, item: ReturnType) => boolean;

    protected constructor(
        api: ApiRequest,
        config: BehaviorSubject<ApiRequestConfig>,
        basePath: string,
        socketNameSpace: string,
        socketChangeEventBaseName: string,
        socketChangeEventFilter: (identifier: SocketChangeEventIdentifierType) => boolean,
        socketChangeEventItemMatcher: (identifier: SocketChangeEventIdentifierType, item: ReturnType) => boolean,
    ) {
        super(api, basePath);

        this.socket = new SocketClient(config, socketNameSpace);
        this.socketChangeEventBaseName = socketChangeEventBaseName;
        this.socketChangeEventFilter = socketChangeEventFilter;
        this.socketChangeEventItemMatcher = socketChangeEventItemMatcher;
    }

    protected observeOne(item: ReturnType): BehaviorSubject<ReturnType | null> {
        const subject = new BehaviorSubject(item);

        const eventName = `${this.socketChangeEventBaseName}/${item.id}`;

        const onChange = async (event: SocketChangeEvent<ReturnType, SocketChangeEventIdentifierType>) => {
            const {item} = event;

            const transformed = item === null ? null : await this.objectTransformer(item);

            subject.next(transformed);

            if (item === null) {
                subject.complete();
            }
        };

        subject.pipe(
            finalize(() => this.socket.off(eventName, onChange)),
        );

        this.socket.on(
            eventName,
            onChange,
        );

        return subject;
    }

    // noinspection JSUnusedGlobalSymbols
    public async createAndObserve(data: CreateType): Promise<BehaviorSubject<ReturnType | null>> {
        const item = await this.create(data);
        return this.observeOne(item);
    }

    public async getAndObserve(id: string): Promise<BehaviorSubject<ReturnType | null>> {
        const item = await this.get(id);
        return this.observeOne(item);
    }

    public async listAndObserve(
        params: ListParams,
    ): Promise<BehaviorSubject<FerdigListResult<ReturnType>>> {
        const result = await this.list(params);
        const resultSubject = new BehaviorSubject(result);

        const eventName = `${this.socketChangeEventBaseName}/*`;

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
            finalize(() => this.socket.off(eventName, onChange)),
        );

        this.socket.on(
            eventName,
            onChange,
        );

        return resultSubject;
    }
}

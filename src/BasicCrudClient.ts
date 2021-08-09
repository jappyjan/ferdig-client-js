import {HTTP_METHOD} from './ApiRequest';
import {BasicApiClient} from './BasicApiClient';

export interface FerdigListResult<ReturnType> {
    items: ReturnType[],
    moreAvailable: boolean
}

export abstract class BasicCrudClient<ReturnType, CreateType, UpdateType, ListParams> extends BasicApiClient {
    protected async objectTransformer(object: unknown): Promise<ReturnType> {
        return object as ReturnType;
    }

    public async create(data: CreateType): Promise<ReturnType> {
        const item = await this.api.request<ReturnType>({
                method: HTTP_METHOD.POST,
                path: this.basePath,
                payload: data,
            },
        );

        return this.objectTransformer(item);
    }

    public async update(id: string, data: UpdateType): Promise<ReturnType> {
        const response = await this.api.request<ReturnType>({
                method: HTTP_METHOD.PUT,
                path: `${this.basePath}/${id}`,
                payload: data,
            },
        );

        return this.objectTransformer(response);
    }

    public async get(id: string): Promise<ReturnType> {
        const response = await this.api.request<ReturnType>({
                method: HTTP_METHOD.GET,
                path: `${this.basePath}/${id}`,
            },
        );

        return this.objectTransformer(response);
    }

    public async remove(id: string): Promise<void> {
        await this.api.request<void>({
                method: HTTP_METHOD.DELETE,
                path: `${this.basePath}/${id}`,
            },
        );
    }

    public async list(params?: ListParams, query?: string): Promise<FerdigListResult<ReturnType>> {
        const response = await this.api.request<{ items: unknown[], moreAvailable: boolean }>({
                method: HTTP_METHOD.POST,
                path: `${this.basePath}/list` + (query ?? ''),
                payload: params,
            },
        );

        return {
            moreAvailable: response.moreAvailable,
            items: await Promise.all(response.items.map((item) => this.objectTransformer(item))),
        };
    }
}

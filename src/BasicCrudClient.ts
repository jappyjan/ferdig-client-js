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
        return await this.api.request<ReturnType>(
            HTTP_METHOD.POST,
            this.basePath,
            data,
        );
    }

    public async update(id: string, data: UpdateType): Promise<ReturnType> {
        const response = await this.api.request<ReturnType>(
            HTTP_METHOD.PUT,
            `${this.basePath}/${id}`,
            data,
        );

        return this.objectTransformer(response);
    }

    public async get(id: string): Promise<ReturnType> {
        const response = await this.api.request<ReturnType>(
            HTTP_METHOD.GET,
            `${this.basePath}/${id}`,
        );

        return this.objectTransformer(response);
    }

    public async remove(id: string): Promise<void> {
        await this.api.request<void>(
            HTTP_METHOD.DELETE,
            `${this.basePath}/${id}`,
        );
    }

    public async list(params?: ListParams): Promise<FerdigListResult<ReturnType>> {
        const response = await this.api.request<{ items: unknown[], moreAvailable: boolean }>(
            HTTP_METHOD.POST,
            `${this.basePath}/list`,
            params,
        );

        return {
            moreAvailable: response.moreAvailable,
            items: await Promise.all(response.items.map((item) => this.objectTransformer(item))),
        };
    }
}

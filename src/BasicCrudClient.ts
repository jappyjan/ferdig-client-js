import ApiRequest, {HTTP_METHOD} from './ApiRequest';


export abstract class BasicCrudClient<ReturnType, CreateType, UpdateType, ListParams, ListResult> {
    protected readonly api: ApiRequest;
    protected readonly basePath: string;

    protected constructor(api: ApiRequest, basePath: string) {
        this.api = api;
        this.basePath = basePath;
    }


    public async create(data: CreateType): Promise<ReturnType> {
        return await this.api.request<ReturnType>(
            HTTP_METHOD.POST,
            this.basePath,
            data,
        );
    }

    public async update(id: string, data: UpdateType): Promise<ReturnType> {
        return await this.api.request<ReturnType>(
            HTTP_METHOD.PUT,
            `${this.basePath}/${id}`,
            data,
        );
    }

    public async get(id: string): Promise<ReturnType> {
        return await this.api.request<ReturnType>(
            HTTP_METHOD.GET,
            `${this.basePath}/${id}`,
        );
    }

    public async remove(id: string): Promise<void> {
        return await this.api.request<void>(
            HTTP_METHOD.DELETE,
            `${this.basePath}/${id}`,
        );
    }

    public async list(params?: ListParams): Promise<ListResult> {
        return await this.api.request<ListResult>(
            HTTP_METHOD.POST,
            `${this.basePath}`,
            params,
        );
    }
}

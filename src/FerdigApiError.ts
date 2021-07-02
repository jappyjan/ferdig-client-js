export interface FerdigApiErrorData {
    errors: string[];
    message: string;
    name: string;
    stack: string;
    status: number;
}

export class FerdigApiError extends Error {
    public readonly details: FerdigApiErrorData;

    constructor(error: FerdigApiErrorData) {
        super(error.message);
        this.details = error;
    }
}

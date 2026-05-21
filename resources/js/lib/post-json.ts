export type ValidationErrors = Record<string, string[]>;

export class PostJsonError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly errors: ValidationErrors = {},
    ) {
        super(message);
        this.name = 'PostJsonError';
    }
}

function getCsrfToken(): string {
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]*)/);

    return match ? decodeURIComponent(match[1]) : '';
}

export async function postJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            'X-XSRF-TOKEN': getCsrfToken(),
        },
        credentials: 'same-origin',
        body: JSON.stringify(body),
    });

    const data = (await response.json().catch(() => ({}))) as T & { errors?: ValidationErrors; message?: string };

    if (!response.ok) {
        throw new PostJsonError(data.message ?? 'Error al guardar.', response.status, data.errors ?? {});
    }

    return data;
}

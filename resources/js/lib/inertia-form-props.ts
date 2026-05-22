type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

type RouteLike = {
    url: (options?: Record<string, unknown>) => string;
    form?: (options?: Record<string, unknown>) => {
        action: string;
        method: HttpMethod;
    };
};

/**
 * Props para <Form> de Inertia compatibles con Wayfinder, con respaldo si .form() no existe.
 */
export function inertiaFormProps(
    route: RouteLike,
    fallbackMethod: HttpMethod = 'post',
    options?: Record<string, unknown>,
): { action: string; method: HttpMethod } {
    if (typeof route.form === 'function') {
        return route.form(options);
    }

    return {
        action: route.url(options),
        method: fallbackMethod,
    };
}

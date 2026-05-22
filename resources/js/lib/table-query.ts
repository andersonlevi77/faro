export type TableQueryParams = Record<string, string | number | undefined | null>;

export function mergeTableQuery(
    base: TableQueryParams,
    patch: TableQueryParams,
): TableQueryParams {
    const merged: TableQueryParams = { ...base, ...patch };

    for (const key of Object.keys(merged)) {
        const value = merged[key];
        if (value === undefined || value === null || value === '') {
            delete merged[key];
        }
    }

    return merged;
}

/** Normaliza texto para búsqueda insensible a mayúsculas y acentos. */
export function normalizeSearchText(value: string): string {
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '');
}

export function matchesSearchQuery(searchText: string, query: string): boolean {
    const normalizedQuery = normalizeSearchText(query.trim());

    if (normalizedQuery === '') {
        return true;
    }

    return normalizeSearchText(searchText).includes(normalizedQuery);
}

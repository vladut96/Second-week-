import { Paginator, PaginationQuery } from "../types/types";

export function buildPaginator<T>(
    query: PaginationQuery,
    totalCount: number,
    items: T[]
): Paginator<T> {
    const pagesCount = Math.ceil(totalCount / query.pageSize);
    return {
        pagesCount,
        page: query.pageNumber,
        pageSize: query.pageSize,
        totalCount,
        items,
    };
}
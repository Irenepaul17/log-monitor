import { useState, useEffect } from 'react';

type PaginationMeta = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

type PaginatedResponse<T> = {
    data: T[];
    meta: PaginationMeta;
};

export function usePaginatedData<T>(
    url: string,
    params: Record<string, string>,
    initialLimit: number = 10,
    enabled: boolean = true
) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(initialLimit);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // Construct URL with query params
                const query = new URLSearchParams({
                    ...params,
                    page: page.toString(),
                    limit: limit.toString()
                }).toString();

                const res = await fetch(`${url}?${query}`);
                if (!res.ok) throw new Error('Failed to fetch data');

                const json: PaginatedResponse<T> = await res.json();

                // Handle both paginated and legacy array responses just in case
                if (Array.isArray(json)) {
                    setData(json);
                    setMeta(null);
                } else {
                    setData(json.data);
                    setMeta(json.meta);
                }
            } catch (error) {
                console.error("Error fetching paginated data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, page, limit, JSON.stringify(params), enabled, refreshKey]);

    return {
        data,
        loading,
        page,
        setPage,
        limit,
        setLimit,
        meta,
        refresh: () => setRefreshKey(k => k + 1)
    };
}

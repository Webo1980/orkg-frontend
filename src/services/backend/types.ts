export type PaginatedResponse<T> = {
    content: T[];
    pageable: {
        sort: {
            sorted: boolean;
            unsorted: boolean;
            empty: boolean;
        };
        pageNumber: number;
        pageSize: number;
        offset: number;
        paged: boolean;
        unpaged: boolean;
    };
    totalElements: number;
    totalPages: number;
    last: boolean;
    sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
    };
    first: boolean;
    number: number;
    numberOfElements: number;
    size: number;
    empty: boolean;
};

export type ExtractionMethod = 'UNKNOWN' | 'MANUAL' | 'AUTOMATIC';

export type Resource = {
    id: string;
    label: string;
    classes: string[];
    shared: number;
    featured: boolean;
    unlisted: boolean;
    verified: boolean;
    extraction_method: ExtractionMethod;
    _class: 'resource';
    created_at: string;
    created_by: string;
    observatory_id: string;
    organization_id: string;
    formatted_label: string;
};

export type Predicate = {
    id: string;
    label: string;
    description: string;
    _class: 'predicate';
    created_at: string;
    created_by: string;
};

export type Literal = {
    id: string;
    label: string;
    datatype: string;
    _class: 'literal';
    created_at: string;
    created_by: string;
};

export type Class = {
    id: string;
    label: string;
    uri: string | null;
    description: string | null;
    _class: 'class';
    created_at: string;
    created_by: string;
};

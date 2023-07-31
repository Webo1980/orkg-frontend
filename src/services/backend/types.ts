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
    type: string;
    resource_type: string;
    resource_id: string;
    title: string;
    subject: string;
    description: string;
    related_resources?: any[]; // Replace 'any' with the appropriate type if possible
    authors?: string[]; // Replace 'string' with the type of authors if possible
    url: string;
};


export type Predicate = {
    id: string;
    label: string;
    description: string;
    _class: 'predicate';
    created_at: string;
    created_by: string;
};

export type Statement = {
    id: string;
    predicate: { id: string };
    subject: {
        classes: any; id: string 
};
    object: { classes?: string[], [key: string]: any };
    created_at: string;
}

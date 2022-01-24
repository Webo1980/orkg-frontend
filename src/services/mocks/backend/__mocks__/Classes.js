import faker from 'faker';

export const DClocationResources = {
    content: [
        {
            id: `R${faker.datatype.number()}`,
            label: 'Hannover',
            created_at: '2020-06-18T12:37:02.422347Z',
            classes: ['DCLocation'],
            shared: 2,
            created_by: '00000000-0000-0000-0000-000000000000',
            _class: 'resource',
            observatory_id: '00000000-0000-0000-0000-000000000000',
            extraction_method: 'UNKNOWN',
            organization_id: '00000000-0000-0000-0000-000000000000'
        },
        {
            id: `R${faker.datatype.number()}`,
            label: 'Annaba',
            created_at: '2020-06-18T12:37:02.422347Z',
            classes: ['DCLocation'],
            shared: 2,
            created_by: '00000000-0000-0000-0000-000000000000',
            _class: 'resource',
            observatory_id: '00000000-0000-0000-0000-000000000000',
            extraction_method: 'UNKNOWN',
            organization_id: '00000000-0000-0000-0000-000000000000'
        }
    ],
    pageable: { sort: { sorted: true, unsorted: false, empty: false }, pageNumber: 0, pageSize: 10, offset: 0, paged: true, unpaged: false },
    totalPages: 1,
    totalElements: 2,
    last: true,
    first: true,
    sort: { sorted: true, unsorted: false, empty: false },
    size: 10,
    number: 0,
    numberOfElements: 2,
    empty: false
};

export const QBDatasetClasses = {
    content: [
        {
            id: 'C2',
            label: 'qb:ComponentProperty',
            uri: 'http://purl.org/linked-data/cube#ComponentProperty',
            created_at: '2021-11-16T12:12:43.245509Z',
            created_by: '00000000-0000-0000-0000-000000000000',
            _class: 'class',
            description: null
        },
        {
            id: 'C6',
            label: 'qb:ComponentSpecification',
            uri: 'http://purl.org/linked-data/cube#ComponentSpecification',
            created_at: '2021-11-16T12:12:43.245665Z',
            created_by: '00000000-0000-0000-0000-000000000000',
            _class: 'class',
            description: null
        },
        {
            id: 'C3',
            label: 'qb:Concept',
            uri: 'http://purl.org/linked-data/cube#Concept',
            created_at: '2021-11-16T12:12:43.245716Z',
            created_by: '00000000-0000-0000-0000-000000000000',
            _class: 'class',
            description: null
        },
        {
            id: 'C7',
            label: 'qb:ConceptScheme',
            uri: 'http://purl.org/linked-data/cube#ConceptScheme',
            created_at: '2021-11-16T12:12:43.245762Z',
            created_by: '00000000-0000-0000-0000-000000000000',
            _class: 'class',
            description: null
        },
        {
            id: 'C8',
            label: 'qb:DataStructureDefinition',
            uri: 'http://purl.org/linked-data/cube#DataStructureDefinition',
            created_at: '2021-11-16T12:12:43.245805Z',
            created_by: '00000000-0000-0000-0000-000000000000',
            _class: 'class',
            description: null
        },
        {
            id: 'C1',
            label: 'qb:DimensionProperty',
            uri: 'http://purl.org/linked-data/cube#DimensionProperty',
            created_at: '2021-11-16T12:12:43.245848Z',
            created_by: '00000000-0000-0000-0000-000000000000',
            _class: 'class',
            description: null
        },
        {
            id: 'C5',
            label: 'qb:MeasureProperty',
            uri: 'http://purl.org/linked-data/cube#MeasureProperty',
            created_at: '2021-11-16T12:12:43.245891Z',
            created_by: '00000000-0000-0000-0000-000000000000',
            _class: 'class',
            description: null
        },
        {
            id: 'C0',
            label: 'qb:Observation',
            uri: 'http://purl.org/linked-data/cube#Observation',
            created_at: '2021-11-16T12:12:43.245937Z',
            created_by: '00000000-0000-0000-0000-000000000000',
            _class: 'class',
            description: null
        },
        {
            id: 'QBDataset',
            label: 'qb:DataSet',
            uri: 'http://purl.org/linked-data/cube#DataSet',
            created_at: '2019-12-16T16:54:05.404+01:00',
            created_by: '00000000-0000-0000-0000-000000000000',
            _class: 'class',
            description: null
        }
    ],
    pageable: { sort: { sorted: true, unsorted: false, empty: false }, pageNumber: 0, pageSize: 2000, offset: 0, paged: true, unpaged: false },
    totalPages: 1,
    totalElements: 9,
    last: true,
    first: true,
    sort: { sorted: true, unsorted: false, empty: false },
    size: 2000,
    number: 0,
    numberOfElements: 9,
    empty: false
};
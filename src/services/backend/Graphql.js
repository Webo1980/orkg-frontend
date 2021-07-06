import { url } from 'constants/misc';
import { submitGetRequest, submitPostRequest, sbmitPutRequest } from 'network';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';

export const graphql = `http://localhost:4001/graphql/`;

export const getWorksData = () => {
    const GET_PETS = `
        query {
            work(id: "https://doi.org/10.1101/2020.03.08.20030643") {
                id
                resource_id
                titles {
                    title
                }
                citations {
                    totalCount
                    nodes {
                        id
                        titles {
                            title
                        }
                        publisher
                    }
                }
            }
        }
    `;
    //const g =
    //'query {work(id: "https://doi.org/10.1101/2020.03.08.20030643") {id titles {title} creators { id name familyName } citations { totalCount nodes { id titles {title}publisher}}}}';

    const g = '{ Paper(doi: "10.1109/TITS.2013.2296697") { label resource_id authors { label id { label } } } }';

    return submitGetRequest(`${graphql}?query=${g}`);
    //return GET_PETS;
    //const { data, loading, error } = useQuery(GET_PETS);
    //console.log(useQuery(GET_PETS));
};

export const getWorksDataByString = (input, value = 'Confidence interval') => {
    const GET_PETS = `
        query {
            work(id: "https://doi.org/10.1101/2020.03.08.20030643") {
                id
                resource_id
                titles {
                    title
                }
                citations {
                    totalCount
                    nodes {
                        id
                        titles {
                            title
                        }
                        publisher
                    }
                }
            }
        }
    `;
    const c = [];
    console.log(input);
    c.push({ label_contains: input });
    c.push({ label_contains: input === input.toLowerCase() ? input.toUpperCase() : input.toLowerCase() });
    //c.push({ label_contains: 'covid-19' });
    //let c = [{ label_contains: 'covid-19' }, { label_contains: 'COVID-19' }, { label_contains: 'corona' }];
    c.map(r => {
        console.log(r.label_contains);
    });
    //const g = `{ findPaperByLabel(filter: { OR: [
    //${c.map(r => {
    //return `{label_contains:"${r.label_contains}"}`;
    //})}
    //]}) { label authors { label id { label } } contributions { label contribution_details { property { label } label contribution_details { property { label } label contribution_details { property { label } label } } } } } }`;
    //console.log(g);

    const g = `{Resource(filter: { OR: [
        ${c.map(r => {
            return `{label_contains:"${r.label_contains}"}`;
        })} ]}) { relatedPapers { label paper { label resource_id } details(value: "${value}") { label details { label } average } work { id citationCount } } } }`;
    console.log(g);

    //const g =
    //'{ Resource(label: "Determination of the COVID-19 basic reproduction number") { relatedPapers { label paper { label resource_id } details(value: "Confidence interval") { label details { label } average } work { id citationCount } } } }';
    //const g =
    //'query {work(id: "https://doi.org/10.1101/2020.03.08.20030643") {id titles {title} creators { id name familyName } citations { totalCount nodes { id titles {title}publisher}}}}';

    //const g = '{ Paper(doi: "10.1109/TITS.2013.2296697") { label resource_id authors { label id { label } } } }';

    return submitGetRequest(`${graphql}?query=${g}`);
    //return GET_PETS;
    //const { data, loading, error } = useQuery(GET_PETS);
    //console.log(useQuery(GET_PETS));
};

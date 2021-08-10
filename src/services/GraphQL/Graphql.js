import { submitGetRequest } from 'network';

export const graphql = `http://localhost:4001/graphql/`;

export const getWorksDataByString = (input, value = 'Confidence interval') => {
    const c = [];
    console.log(input);
    c.push({ label_contains: input });
    c.push({ label_contains: input === input.toLowerCase() ? input.toUpperCase() : input.toLowerCase() });
    c.map(r => {
        console.log(r.label_contains);
    });

    const g = `{Resource(filter: { OR: [
        ${c.map(r => {
            return `{label_contains:"${r.label_contains}"}`;
        })} ]}) { relatedPapers { label paper { label resource_id } details(value: "${value}") { label details { label } average } work { id citationCount } } } }`;
    console.log(g);

    return submitGetRequest(`${graphql}?query=${g}`);
};

export const getPapersFromOpenAIRE = input => {
    const g = `{ openAIREPapers(searchTerm:"${input}") { title  year doi authors abstract peerReview { type citationCount } } }`;

    return submitGetRequest(`${graphql}?query=${g}`);
};

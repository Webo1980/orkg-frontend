import { submitGetRequest } from 'network';

export const federatedGraphql = `http://localhost:4001/graphql/`;
export const graphql = `http://localhost:4000/graphql/`;

export const getWorksData = input => {
    const query = `
        query {
            work(id: "${input}") {
                id
                titles {
                    title
                }
                creators {
                    givenName
                    familyName
                    id
                  }
            }
        }
    `;
    return submitGetRequest(`${federatedGraphql}?query=${query}`);
};

export const getWorksDatabyLabel = input => {
    const query = `{
      works(query: "${input}", resourceType:"Text", first:25) {
        totalCount
        edges {
          node {
            id
            titles {
              title
            }
            creators {
              familyName
              givenName
              id
            }
          }
        }
      }
    }`;
    return submitGetRequest(`${federatedGraphql}?query=${query}`);
};

export const getWorksDataWithCitations = input => {
    const query = `
    {
      semanticScholarPaper(doi: "${input}") {
        doi
        title
        abstract
        citations {
          title
          doi
        }
        references {
          title
          doi
        }
        project {
          funder
          project
        }
        topics {
          topic
        }
      }
    }    
    `;
    return submitGetRequest(`${federatedGraphql}?query=${query}`);
};

export const getPapersbyLabelfromORKG = input => {
    const c = [];
    c.push({ label_contains: input });
    c.push({ label_contains: input === input.toLowerCase() ? input.toUpperCase() : input.toLowerCase() });

    const g = `{
            papers(
              where: {
                OR: [${c.map(r => {
                    return `{label_CONTAINS:"${r.label_contains}"}`;
                })}]
              }
            ) {
                contributions {
                    property {
                      label
                    }
                    details {
                      label
                      property
                    }
                  }
              id
              label
              authors{
                label
                id{
                  label
                }
              }
            }
          }`;

    return submitGetRequest(`${graphql}?query=${g}`);
};

export const getPapersbyProblem = input => {
    const g = `{
      problems(
        where: { label: "${input}" }
    ) {
      label
      papers {
        label
        id
        authors {
          label
          id {
            label
          }
        }
        contributions {
          details {
            property
            label
          }
        }
      }
    }
  }`;
    return submitGetRequest(`${graphql}?query=${g}`);
};

export const getResearcherDetails = input => {
    const g = `{
      person(id: "${input}") {
        id
        type
        name
        employment {
          organizationName
          organizationId
          startDate
          endDate
        }
        publications(first: 50) {
          totalCount
          nodes {
            id
            type
            titles {
              title
            }
            creators {
              givenName
              familyName
              id
            }
          }
        }
        datasets(first: 50) {
          totalCount
          nodes {
            id
            type
            titles {
              title
            }
            creators {
              givenName
              familyName
              id
            }
          }
        }
        softwares {
          totalCount
          nodes {
            id
            type
            titles {
              title
            }
            creators {
              givenName
              familyName
              id
            }
          }
        }
      }
    }`;

    return submitGetRequest(`${federatedGraphql}?query=${g}`);
};

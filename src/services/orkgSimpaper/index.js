import { submitGetRequest } from 'network';
import env from '@beam-australia/react-env';
import qs from 'qs';

export const paperURL = env('REACT_APP_SIMILAR_PAPER_ENDPOINT');
export const comparisonUrl = `${paperURL}similar`;
// @param {Array} comparisonId comparison id
// https://orkg.org/simpaper/api/paper/similar
/**
 * Get comparison result
 *
 * @param {Array[String]} contributionIds Contribution id
 * @param {String} type Method used to compare (path | merge)
 * @param {String} mode Response hash
 * @param {Boolean} save_response To return a response hash and save a copy of the result
 */

export const getSimilarPapers = ({ contributionIds = [], mode = null }) => {
    const params = qs.stringify({
        contributions: contributionIds.join(','),
        mode,
    });
    console.log('show params', params);
    return submitGetRequest(`${comparisonUrl}?${params}`);
};
// export const getSimilarPapers = contributionIds => {
//     const result = submitGetRequest(`https://orkg.org/simpaper/api/paper/similar?${contributionIds}`).then((data, reject) => {
//         if (!data.abstract) {
//             return reject;
//         }
//         return data;
//     });
//     return result;
// };
// const contributionIds = ['R309223', 'R309230', 'R309234'];

// export const getSimilarPapers = contributionIds => {
//     // eslint-disable-next-line no-debugger
//     debugger;
//     const queryParams = contributionIds.join('&contributionIds=');
//     const url = `https://orkg.org/simpaper/api/paper/similar?contributionIds=${queryParams}`;

//     return fetch(url)
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .catch(error => {
//             console.error('API Error:', error);
//             throw error;
//         });
// };

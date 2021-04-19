/**
 * Services file for the Bioassays Semantification service
 * https://gitlab.com/TIBHannover/orkg/orkg-bioassays-semantification
 */

import { submitPostRequest } from 'network';
import env from '@beam-australia/react-env';

export const bioassaysServiceUrl = env('BIOASSAYS_SEMANTIFICATION_SERVICE_URL');

export const semantifyBioassays = bioassay => {
    return submitPostRequest(`${bioassaysServiceUrl}bioassay/`, { 'Content-Type': 'application/json' }, { bioassay }, true, false);
};

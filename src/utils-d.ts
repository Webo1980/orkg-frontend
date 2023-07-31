
import { CLASSES, MISC, PREDICATES, ENTITIES } from 'constants/graphSettings';
import REGEX from 'constants/regex';
import ROUTES from 'constants/routes';
import { isString, sortBy, uniqBy } from 'lodash';
import qs from 'qs';
import { Cookies } from 'react-cookie';
import env from '@beam-australia/react-env';
import slugifyString from 'slugify';
import { LOCATION_CHANGE as LOCATION_CHANGE_RFH } from 'redux-first-history';
import { string } from 'joi';
import { Statement } from 'services/backend/types';

const cookies = new Cookies();

/**
 * Filter a list of statements by predicate id and return the object (including the statement id and created_at)
 *
 * @param {Array} statementsArray Array of statements
 * @param {String} predicateID Predicate ID
 * @param {String} classID Class ID
 * @param {String} subjectID Subject ID
 * @param {Boolean} isUnique if this predicate is unique and has one value
 */

export const filterObjectOfStatementsByPredicateAndClass = (
    statementsArray: Statement[],
    predicateID: string,
    isUnique:boolean = true,
    classID: string | null = null,
    subjectID: string | null = null,
): any => {
    if (!statementsArray) {
        return isUnique ? null : [];
    }
    let result = statementsArray.filter(
        statement => statement.predicate.id === predicateID && (statement.subject.id === subjectID || subjectID === null),
    );
    if (classID) {
        result = statementsArray.filter(statement => statement.object.classes && statement.object.classes.includes(classID));
    }
    if (result.length > 0 && isUnique) {
        return { ...result[0].object, statementId: result[0].id, s_created_at: result[0].created_at };
    }
    if (result.length > 0 && !isUnique) {
        return result.map(s => ({ ...s.object, statementId: s.id, s_created_at: s.created_at }));
    }
    return isUnique ? null : [];
};

/**
 * Filter a list of statements by predicate id and return the subject (including the statement id and created_at)
 *
 * @param {Array} statementsArray Array of statements
 * @param {String} predicateID Predicate ID
 * @param {Boolean} isUnique if this predicate is unique and has one value
 */
export const filterSubjectOfStatementsByPredicateAndClass = (  statementsArray: Statement[],
    predicateID: string,
    isUnique:boolean = true,
    classID: string | null = null,
    subjectID: string | null = null):any => {
    if (!statementsArray) {
        return isUnique ? null : [];
    }
    let result = statementsArray.filter(statement => statement.predicate.id === predicateID);
    if (classID) {
        result = statementsArray.filter(statement => statement.subject.classes && statement.subject.classes.includes(classID));
    }
    if (result.length > 0 && isUnique) {
        return { ...result[0].subject, statementId: result[0].id, s_created_at: result[0].created_at };
    }
    if (result.length > 0 && !isUnique) {
        return result.map(s => ({ ...s.subject, statementId: s.id, s_created_at: s.created_at }));
    }
    return isUnique ? null : [];
};
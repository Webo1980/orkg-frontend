import PropTypes from 'prop-types';
import { useCallback } from 'react';
import { CLASSES } from 'constants/graphSettings';
import CSVWTable from 'components/CSVWTable/CSVWTable';
import FlashCard from 'components/StatementBrowser/FlashCard/FlashCard';
import { getTemplateIDsByResourceID } from 'slices/statementBrowserSlice';
import { useSelector } from 'react-redux';

const ItemPreviewFactory = ({ id, classes, children = null, enableEdit = false }) => {
    const findClass = useCallback(classId => classes?.includes(classId), [classes]);

    const templateIDs = useSelector(state => getTemplateIDsByResourceID(state, id));
    const isFlashCard = useSelector(state => {
        if (templateIDs.length > 0) {
            return templateIDs.map(tId => state.statementBrowser.templates[tId]).filter(t => t.isFlashCard)?.length > 0;
        }
        return null;
    });

    if (findClass(CLASSES.CSVW_TABLE)) {
        return <CSVWTable id={id} />;
    }

    if (isFlashCard) {
        return <FlashCard id={id} enableEdit={enableEdit} />;
    }

    return children;
};

ItemPreviewFactory.propTypes = {
    id: PropTypes.string.isRequired,
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.array, PropTypes.node]),
    classes: PropTypes.array,
    enableEdit: PropTypes.bool.isRequired,
};

export default ItemPreviewFactory;

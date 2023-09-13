import FlashCardInputField from 'components/StatementBrowser/FlashCard/FlashCardInputField';
import FlashCardValue from 'components/StatementBrowser/FlashCard/FlashCardValue';
import { StatementsGroupStyle } from 'components/StatementBrowser/styled';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import ReactStringReplace from 'react-string-replace';
import { Col, Row } from 'reactstrap';
import { getTemplateIDsByResourceID } from 'slices/statementBrowserSlice';

const FlashCard = ({ id, enableEdit = false }) => {
    const templateIDs = useSelector(state => getTemplateIDsByResourceID(state, id));

    const template = useSelector(state => {
        if (templateIDs.length > 0) {
            return templateIDs.map(tId => state.statementBrowser.templates[tId]).find(t => t.isFlashCard);
        }
        return null;
    });

    const replacementFunction = (match, index, offset) => {
        if (enableEdit) {
            return <FlashCardInputField key={index} resourceId={id} predicateId={match} enableEdit={enableEdit} />;
        }
        return <FlashCardValue key={index} resourceId={id} predicateId={match} />;
    };
    const formattedLabelWithInputs = ReactStringReplace(template?.labelFormat, /{(.*?)}/, replacementFunction);

    return (
        <Row>
            <Col>
                <StatementsGroupStyle className="noTemplate list-group-item">
                    <div className="p-3" style={{ fontSize: '22px', lineHeight: 3 }}>
                        {formattedLabelWithInputs}
                    </div>
                </StatementsGroupStyle>
            </Col>
        </Row>
    );
};

FlashCard.propTypes = {
    // resource id in the statement browser
    id: PropTypes.string.isRequired,
    enableEdit: PropTypes.bool.isRequired,
};

export default FlashCard;

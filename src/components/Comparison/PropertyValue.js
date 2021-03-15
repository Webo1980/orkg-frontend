import { useState } from 'react';
import { Button } from 'reactstrap';
import Tippy from '@tippyjs/react';
import StatementBrowserDialog from 'components/StatementBrowser/StatementBrowserDialog';
import DescriptionTooltip from 'components/DescriptionTooltip/DescriptionTooltip';
import ConditionalWrapper from 'components/Utils/ConditionalWrapper';
import FilterWrapper from 'components/Comparison/Filters/FilterWrapper';
import FilterModal from 'components/Comparison/Filters/FilterModal';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { getRuleByProperty, getValuesByProperty, getDataByProperty } from 'utils';
import styled from 'styled-components';
import { upperFirst } from 'lodash';
import { PREDICATE_TYPE_ID } from 'constants/misc';
import PropTypes from 'prop-types';
import classNames from 'classnames';

const FilterButton = styled(Button)`
    &&& {
        padding: 0 5px;
        color: ${props => props.theme.ultraLightBlueDarker};
        &:hover,
        &.active {
            color: ${props => props.theme.darkblueDarker};
        }

        & .cross {
            position: absolute;
            right: 22px;
            top: 12px;
            width: 12px;
            height: 12px;
        }
        & .cross:hover {
            opacity: 1;
        }
        & .cross:before,
        & .cross:after {
            position: absolute;
            left: 15px;
            content: ' ';
            height: 12px;
            width: 2px;
            background-color: ${props => props.theme.darkblueDarker};
        }
        & .cross:before {
            transform: rotate(45deg);
        }
        & .cross:after {
            transform: rotate(-45deg);
        }
    }
`;

const PropertyValue = ({ id, label, similar, filterControlData, updateRulesOfProperty }) => {
    const [showStatementBrowser, setShowStatementBrowser] = useState(false);
    const [showFilterDialog, setShowFilterDialog] = useState(false);

    const updateRulesFactory = newRules => updateRulesOfProperty(newRules, id);

    const handleOpenStatementBrowser = () => {
        setShowStatementBrowser(true);
    };

    const getValuesNr = () => {
        return Object.keys(getValuesByProperty(filterControlData, id)).length;
    };

    const filterButtonClasses = classNames({
        'd-block': true,
        active: getRuleByProperty(filterControlData, id).length > 0
    });

    return (
        <>
            <Button onClick={handleOpenStatementBrowser} color="link" className="text-light m-0 p-0">
                <DescriptionTooltip
                    id={id}
                    typeId={PREDICATE_TYPE_ID}
                    extraContent={similar && similar.length ? `This property is merged with : ${similar.join(', ')}` : ''}
                >
                    {upperFirst(label)}
                    {similar && similar.length > 0 && '*'}
                </DescriptionTooltip>
            </Button>

            <FilterWrapper
                data={{
                    rules: getRuleByProperty(filterControlData, id),
                    disabled: getValuesNr() <= 1 && getRuleByProperty(filterControlData, id).length === 0
                }}
            >
                <FilterButton color="link" disabled={getValuesNr() <= 1} onClick={() => setShowFilterDialog(v => !v)} className={filterButtonClasses}>
                    <Icon size="xs" icon={faFilter} />
                    {getValuesNr() <= 1 && <div className="cross" />}
                </FilterButton>
            </FilterWrapper>

            <FilterModal
                data={getDataByProperty(filterControlData, id)}
                updateRulesOfProperty={updateRulesFactory}
                showFilterDialog={showFilterDialog}
                toggleFilterDialog={() => setShowFilterDialog(v => !v)}
            />

            {showStatementBrowser && (
                <StatementBrowserDialog
                    show={true}
                    type={PREDICATE_TYPE_ID}
                    toggleModal={() => setShowStatementBrowser(v => !v)}
                    id={id}
                    label={label}
                />
            )}
        </>
    );
};

PropertyValue.propTypes = {
    label: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    similar: PropTypes.array,
    filterControlData: PropTypes.array.isRequired,
    updateRulesOfProperty: PropTypes.func.isRequired
};

PropertyValue.defaultProps = {
    label: PropTypes.string.isRequired,
    similar: PropTypes.array
};

export default PropertyValue;

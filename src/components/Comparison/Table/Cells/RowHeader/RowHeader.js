import ContributionCell from 'components/Comparison/Table/Cells/ContributionCell';
import PropertyCell from 'components/Comparison/Table/Cells/PropertyCell';
import { Properties, PropertiesInner } from 'components/Comparison/styled';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { getCellPadding } from 'slices/comparisonSlice';

const RowHeader = ({ cell, property }) => {
    const transpose = useSelector(state => state.comparison.configuration.transpose);
    const cellPadding = useSelector(getCellPadding);
    const comparisonType = useSelector(state => state.comparison.configuration.comparisonType);

    return (
        <Properties className={`${!transpose ? 'columnProperty' : 'columnContribution'} ${cell.group ? 'columnPropertyGroup' : ''}`}>
            <PropertiesInner
                className={`${
                    comparisonType === 'property-path' ? `bg-property-depth-${cell?.path.length < 10 ? cell?.path.length : 'deepest'}` : ''
                } ${!transpose ? 'd-flex flex-row align-items-start justify-content-between' : ''}`}
                cellPadding={cellPadding}
                transpose={transpose}
            >
                {!transpose ? (
                    <PropertyCell
                        similar={cell.similar}
                        label={cell.label}
                        id={cell.id}
                        group={cell.group ?? false}
                        grouped={cell.grouped ?? false}
                        groupId={cell.groupId ?? null}
                        property={property}
                        path={cell.path}
                    />
                ) : (
                    <ContributionCell contribution={cell} />
                )}
            </PropertiesInner>
        </Properties>
    );
};

RowHeader.propTypes = {
    cell: PropTypes.object.isRequired,
    property: PropTypes.object,
};

export default RowHeader;

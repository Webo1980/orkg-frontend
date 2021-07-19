import TableScrollContainer from 'components/Comparison/TableScrollContainer';
import ComparisonTable from 'components/Comparison/ComparisonTable';
import { useSelector } from 'react-redux';

const Comparison = props => {
    const { contributions, properties, data, filterControlData } = useSelector(state => state.comparison);
    const { transpose, comparisonType, viewDensity } = useSelector(state => state.comparison.configuration);

    return (
        <TableScrollContainer>
            <ComparisonTable
                {...props}
                filterControlData={filterControlData}
                viewDensity={viewDensity}
                comparisonType={comparisonType}
                transpose={transpose}
                contributions={contributions}
                data={data}
                properties={properties}
            />
        </TableScrollContainer>
    );
};

export default Comparison;

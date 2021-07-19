import { memo, useRef, useMemo } from 'react';
import { Alert } from 'reactstrap';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import PropertyValue from 'components/Comparison/PropertyValue';
import ROUTES from 'constants/routes';
import { reverse } from 'named-urls';
import { Link } from 'react-router-dom';
import { ScrollSyncPane } from 'react-scroll-sync';
import { ReactTableWrapper, Contribution, Delete, ItemHeader, ItemHeaderInner, Properties, PropertiesInner } from './styled';
import TableCell from './TableCell';
import { useTable, useFlexLayout } from 'react-table';
import { useSticky } from 'react-table-sticky';
import {
    getPropertyObjectFromData,
    extendAndSortProperties,
    activatedContributionsToList,
    generateFilterControlData,
    getRuleByProperty,
    applyRule
} from 'utils';
import { useSelector, useDispatch } from 'react-redux';
import {
    setComparisonContributionList,
    setComparisonProperties,
    setComparisonContributions,
    setComparisonData,
    setComparisonFilterControlData
} from 'actions/comparison';
import { flatten, findIndex, cloneDeep, isEmpty, intersection } from 'lodash';
import PropTypes from 'prop-types';

const ComparisonTable = props => {
    const dispatch = useDispatch();

    const predicatesList = useSelector(state => state.comparison.configuration.predicatesList);

    const scrollContainerHead = useRef(null);
    const smallerFontSize = props.viewDensity === 'compact';

    let cellPadding = 10;
    if (props.viewDensity === 'normal') {
        cellPadding = 5;
    } else if (props.viewDensity === 'compact') {
        cellPadding = 1;
    }

    /**
     * Remove contribution
     *
     * @param {String} contributionId Contribution id to remove
     */
    const removeContribution = contributionId => {
        const cIndex = findIndex(props.contributions, c => c.id === contributionId);
        const newContributions = props.contributions
            .filter(c => c.id !== contributionId)
            .map(contribution => {
                return { ...contribution, active: contribution.active };
            });
        const newData = cloneDeep(props.data);
        let newProperties = cloneDeep(props.properties);
        for (const property in newData) {
            // remove the contribution from data
            if (flatten(newData[property][cIndex]).filter(v => !isEmpty(v)).length !== 0) {
                // decrement the contribution amount from properties if it has some values
                const pIndex = newProperties.findIndex(p => p.id === property);
                newProperties[pIndex].contributionAmount = newProperties[pIndex].contributionAmount - 1;
            }
            newData[property].splice(cIndex, 1);
        }
        newProperties = extendAndSortProperties({ data: newData, properties: newProperties }, predicatesList);
        dispatch(setComparisonContributionList(activatedContributionsToList(newContributions)));

        dispatch(setComparisonContributions(newContributions));
        dispatch(setComparisonData(newData));
        dispatch(setComparisonProperties(newProperties));
        // keep existing filter rules
        const newFilterControlData = generateFilterControlData(newContributions, newProperties, newData).map(filter => {
            filter.rules = getRuleByProperty(props.filterControlData, filter.property.id);
            return filter;
        });
        dispatch(setComparisonFilterControlData(newFilterControlData));
        //setUrlNeedsToUpdate(true);
    };

    /**
     * Update filter control data of a property
     *
     * @param {Array} rules Array of rules
     * @param {Array} propertyId property ID
     */
    const updateRulesOfProperty = (newRules, propertyId) => {
        const newState = [...props.filterControlData];
        const toChangeIndex = newState.findIndex(item => item.property.id === propertyId);
        const toChange = { ...newState[toChangeIndex] };
        toChange.rules = newRules;
        newState[toChangeIndex] = toChange;
        applyAllRules(newState);
        dispatch(setComparisonFilterControlData(newState));
    };

    /**
     * Apply filter control data rules
     *
     * @param {Array} newState Filter Control Data
     */
    const applyAllRules = newState => {
        const AllContributionsID = props.contributions.map(contribution => contribution.id);
        const contributionIds = []
            .concat(...newState.map(item => item.rules))
            .map(c => applyRule({ filterControlData: props.filterControlData, ...c }))
            .reduce((prev, acc) => intersection(prev, acc), AllContributionsID);
        displayContributions(contributionIds);
    };

    /**
     * display certain contributionIds
     *
     * @param {array} contributionIds Contribution ids to display
     */
    const displayContributions = contributionIds => {
        const newContributions = props.contributions.map(contribution => {
            return contributionIds.includes(contribution.id) ? { ...contribution, active: true } : { ...contribution, active: false };
        });
        dispatch(setComparisonContributionList(activatedContributionsToList(newContributions)));
        dispatch(setComparisonContributions(newContributions));
        //setUrlNeedsToUpdate(true);
    };

    const data = useMemo(() => {
        return [
            ...(!props.transpose
                ? props.properties
                      .filter(property => property.active && props.data[property.id])
                      .map((property, index) => {
                          return {
                              property: property,
                              values: props.contributions.map((contribution, index2) => {
                                  const data = props.data[property.id] ? props.data[property.id][index2] : null;
                                  return data;
                              })
                          };
                      })
                : props.contributions.map((contribution, index) => {
                      return {
                          property: contribution,
                          values: props.properties
                              .filter(property => property.active)
                              .map((property, index2) => {
                                  const data = props.data[property.id] ? props.data[property.id][index] : null;
                                  return data;
                              })
                      };
                  }))
        ];
    }, [props.transpose, props.properties, props.contributions, props.data]);

    const defaultColumn = useMemo(
        () => ({
            minWidth: 250,
            width: 1,
            maxWidth: 2
        }),
        []
    );

    const columns = useMemo(() => {
        if (props.filterControlData.length === 0) {
            return [];
        }
        return [
            {
                Header: (
                    <Properties>
                        <PropertiesInner transpose={props.transpose} className="first">
                            Properties
                        </PropertiesInner>
                    </Properties>
                ),
                accessor: 'property',
                sticky: 'left',
                Cell: info => {
                    return !props.transpose ? (
                        <Properties className="columnProperty">
                            <PropertiesInner className="d-flex flex-row align-items-start justify-content-between" cellPadding={cellPadding}>
                                <PropertyValue
                                    embeddedMode={props.embeddedMode}
                                    filterControlData={props.filterControlData}
                                    updateRulesOfProperty={updateRulesOfProperty}
                                    similar={info.value.similar}
                                    label={info.value.label}
                                    id={info.value.id}
                                    property={props.comparisonType === 'merge' ? info.value : getPropertyObjectFromData(props.data, info.value)}
                                />
                            </PropertiesInner>
                        </Properties>
                    ) : (
                        <Properties className="columnContribution">
                            <PropertiesInner transpose={props.transpose}>
                                <Link
                                    to={reverse(ROUTES.VIEW_PAPER, {
                                        resourceId: info.value.paperId,
                                        contributionId: info.value.id
                                    })}
                                >
                                    {info.value.title ? info.value.title : <em>No title</em>}
                                </Link>
                                <br />
                                <Contribution>
                                    {info.value.contributionLabel} {info.value.year && `- ${info.value.year}`}
                                </Contribution>
                            </PropertiesInner>

                            {!props.embeddedMode && props.contributions.filter(contribution => contribution.active).length > 2 && (
                                <Delete onClick={() => removeContribution(info.value.id)}>
                                    <Icon icon={faTimes} />
                                </Delete>
                            )}
                        </Properties>
                    );
                }
            },
            ...(!props.transpose && props.contributions
                ? props.contributions
                      .map((contribution, index) => {
                          if (contribution.active) {
                              return {
                                  id: contribution.id, // <-here
                                  Header: () => {
                                      return (
                                          <ItemHeader key={`contribution${contribution.id}`}>
                                              <ItemHeaderInner>
                                                  <Link
                                                      to={reverse(ROUTES.VIEW_PAPER, {
                                                          resourceId: contribution.paperId,
                                                          contributionId: contribution.id
                                                      })}
                                                  >
                                                      {contribution.title ? contribution.title : <em>No title</em>}
                                                  </Link>
                                                  <br />
                                                  <Contribution>
                                                      {contribution.year && `${contribution.year} - `}
                                                      {contribution.contributionLabel}
                                                  </Contribution>
                                              </ItemHeaderInner>

                                              {!props.embeddedMode && props.contributions.filter(contribution => contribution.active).length > 2 && (
                                                  <Delete onClick={() => removeContribution(contribution.id)}>
                                                      <Icon icon={faTimes} />
                                                  </Delete>
                                              )}
                                          </ItemHeader>
                                      );
                                  },
                                  accessor: d => {
                                      //return d.values[index].length > 0 ? d.values[index][0].label : '';
                                      return d.values[index];
                                  },
                                  Cell: cell => <TableCell data={cell.value} viewDensity={props.viewDensity} /> // Custom cell components!
                              };
                          } else {
                              return null;
                          }
                      })
                      .filter(Boolean)
                : props.properties
                      .filter(property => property.active && props.data[property.id])
                      .map((property, index) => {
                          return {
                              id: property.id, // <-here
                              Header: () => (
                                  <ItemHeader key={`property${property.id}`}>
                                      <ItemHeaderInner
                                          className="d-flex flex-row align-items-center justify-content-between"
                                          transpose={props.transpose}
                                      >
                                          <PropertyValue
                                              embeddedMode={props.embeddedMode}
                                              filterControlData={props.filterControlData}
                                              updateRulesOfProperty={updateRulesOfProperty}
                                              similar={property.similar}
                                              label={property.label}
                                              id={property.id}
                                              property={props.comparisonType === 'merge' ? property : getPropertyObjectFromData(props.data, property)}
                                          />
                                      </ItemHeaderInner>
                                  </ItemHeader>
                              ),
                              accessor: d => {
                                  //return d.values[index].length > 0 ? d.values[index][0].label : '';
                                  return d.values[index];
                              },
                              Cell: cell => <TableCell data={cell.value} viewDensity={props.viewDensity} /> // Custom cell components!
                          };
                      }))
        ];
        // TODO: remove disable lint rule: useCallback for removeContribution and add used dependencies
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.transpose, props.properties, props.contributions, props.filterControlData, props.viewDensity]);

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } = useTable(
        {
            columns,
            data,
            defaultColumn
        },
        useFlexLayout,
        useSticky
    );

    return (
        <ReactTableWrapper>
            <div
                id="comparisonTable"
                {...getTableProps()}
                className="table sticky mb-0"
                style={{ height: 'max-content', fontSize: smallerFontSize ? '0.95rem' : '1rem' }}
            >
                <ScrollSyncPane group="one">
                    <div
                        ref={scrollContainerHead}
                        style={{ overflow: 'auto', top: '71px', position: 'sticky', zIndex: '3' }}
                        className="disable-scrollbars"
                    >
                        {headerGroups.map(headerGroup => (
                            <div className="header" {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map(column => (
                                    <div {...column.getHeaderProps()} className="th">
                                        {column.render('Header')}
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </ScrollSyncPane>
                <ScrollSyncPane group="one">
                    <div ref={props.scrollContainerBody} style={{ overflow: 'auto' }}>
                        <div {...getTableBodyProps()} className="comparisonBody" style={{ ...getTableProps().style }}>
                            {rows.map((row, i) => {
                                prepareRow(row);
                                return (
                                    <div {...row.getRowProps()} className="tr">
                                        {row.cells.map(cell => {
                                            return (
                                                <div {...cell.getCellProps()} className="td">
                                                    {cell.render('Cell')}
                                                </div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </ScrollSyncPane>
            </div>
            {rows.length === 0 && (
                <Alert className="mt-3" color="info">
                    This contributions have no data to compare on!
                </Alert>
            )}
        </ReactTableWrapper>
    );
};

ComparisonTable.propTypes = {
    contributions: PropTypes.array.isRequired,
    data: PropTypes.object.isRequired,
    properties: PropTypes.array.isRequired,
    transpose: PropTypes.bool.isRequired,
    comparisonType: PropTypes.string.isRequired,
    viewDensity: PropTypes.oneOf(['spacious', 'normal', 'compact']),
    scrollContainerBody: PropTypes.object.isRequired,
    filterControlData: PropTypes.array.isRequired,
    embeddedMode: PropTypes.bool.isRequired
};

ComparisonTable.defaultProps = {
    embeddedMode: false
};

export default memo(ComparisonTable);

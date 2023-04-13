/* eslint-disable linebreak-style */
// eslint-disable-next-line no-unused-vars
import { React, useRef, useEffect } from 'react';
// import { chart } from '@rawgraphs/rawgraphs-core';
// import { bubblechart } from '@rawgraphs/rawgraphs-charts';
// import icon from 'assets/img/chart_icons/bubble_chart.svg';

function VisualizationType() {
    return (
        <div className="container">
            <div className="row">
                <div className="col-lg-2">
                    <h3 id="data">Load your data</h3>
                </div>

                <div className="col-lg-10">
                    <h3>
                        <span ng-show="parsed && text.length" className="small text-mono">
                            filename
                        </span>
                        <span className="list-type pull-right" ng-show="data.length">
                            {/* <i
                                className="type fa fa-align-left breath-left"
                                data-toggle="tooltip"
                                data-title="View as Text"
                                ng-click="dataView='text'"
                                ng-className="{selected:dataView!='table'}"
                            ></i>
                            <i
                                className="type fa fa-table breath-left"
                                data-toggle="tooltip"
                                data-title="View as Table"
                                ng-click="dataView='table'"
                                ng-className="{selected:dataView=='table'}"
                            ></i> */}
                        </span>
                        {/* <span className="clearfix"></span> */}
                    </h3>
                </div>
            </div>
        </div>
    );
}

export default VisualizationType;

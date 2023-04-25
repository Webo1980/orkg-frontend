/* eslint-disable linebreak-style */
// eslint-disable-next-line no-unused-vars
import { React, useRef, useEffect } from 'react';
// import { chart } from '@rawgraphs/rawgraphs-core';
// import { bubblechart } from '@rawgraphs/rawgraphs-charts';
// import icon from 'assets/img/chart_icons/bubble_chart.svg';

function VisualizationType() {
    const handleClick = () => {
        window.location.href = 'http://localhost:3002/';
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-lg-2">
                    <h3 id="data">Load your data</h3>
                    <button onClick={handleClick}>Open Other React App</button>
                </div>
            </div>
        </div>
    );
}

export default VisualizationType;

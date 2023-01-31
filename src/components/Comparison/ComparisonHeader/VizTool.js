import { Modal, ModalHeader, ModalBody } from 'reactstrap';
import PropTypes from 'prop-types';
import { cloneDeep } from 'lodash';
import { GraphicWalker } from '@kanaries/graphic-walker';
import { useSelector } from 'react-redux';

function VizTool(props) {
    const data = useSelector(state => state.comparison.data);
    const contributions = useSelector(state => state.comparison.contributions.filter(c => c.active));
    const properties = useSelector(state => state.comparison.properties.filter(c => c.active));

    const _properties = [
        {
            fid: 'title',
            name: 'Paper title',
            analyticType: 'dimension',
            semanticType: 'nominal',
            dataType: '?',
        },
        {
            fid: 'year',
            name: 'Year',
            analyticType: 'dimension',
            semanticType: 'nominal',
            dataType: '?',
        },
        ...properties.map(p => ({
            fid: p.id,
            name: p.label,
            analyticType: 'measure',
            semanticType: 'nominal',
            dataType: '?',
        })),
    ];
    let _data = [];
    _properties.map((p, index) => {
        if (index === 0 || index === 1) {
            return null;
        }
        data[p.fid].map((v, i) => {
            let r = {};
            if (typeof _data[i] !== 'undefined') {
                r = _data[i];
            } else {
                _data.push(r);
            }
            r[p.fid] = v?.[0]?.label;
            _data[i] = r;
            return null;
        });
        return null;
    });
    _data = _data.map((d, i) => ({ ...d, title: contributions[i].title, year: contributions[i].year }));
    /*
    let dataSource = [
        {
            Name: 'chevrolet chevelle malibu',
            Miles_per_Gallon: 18,
            Cylinders: 8,
            Displacement: 307,
            Horsepower: 130,
            Weight_in_lbs: 3504,
            Acceleration: 12,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'buick skylark 320',
            Miles_per_Gallon: 15,
            Cylinders: 8,
            Displacement: 350,
            Horsepower: 165,
            Weight_in_lbs: 3693,
            Acceleration: 11.5,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'plymouth satellite',
            Miles_per_Gallon: 18,
            Cylinders: 8,
            Displacement: 318,
            Horsepower: 150,
            Weight_in_lbs: 3436,
            Acceleration: 11,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'amc rebel sst',
            Miles_per_Gallon: 16,
            Cylinders: 8,
            Displacement: 304,
            Horsepower: 150,
            Weight_in_lbs: 3433,
            Acceleration: 12,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'ford torino',
            Miles_per_Gallon: 17,
            Cylinders: 8,
            Displacement: 302,
            Horsepower: 140,
            Weight_in_lbs: 3449,
            Acceleration: 10.5,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'ford galaxie 500',
            Miles_per_Gallon: 15,
            Cylinders: 8,
            Displacement: 429,
            Horsepower: 198,
            Weight_in_lbs: 4341,
            Acceleration: 10,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'chevrolet impala',
            Miles_per_Gallon: 14,
            Cylinders: 8,
            Displacement: 454,
            Horsepower: 220,
            Weight_in_lbs: 4354,
            Acceleration: 9,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'plymouth fury iii',
            Miles_per_Gallon: 14,
            Cylinders: 8,
            Displacement: 440,
            Horsepower: 215,
            Weight_in_lbs: 4312,
            Acceleration: 8.5,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'pontiac catalina',
            Miles_per_Gallon: 14,
            Cylinders: 8,
            Displacement: 455,
            Horsepower: 225,
            Weight_in_lbs: 4425,
            Acceleration: 10,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'amc ambassador dpl',
            Miles_per_Gallon: 15,
            Cylinders: 8,
            Displacement: 390,
            Horsepower: 190,
            Weight_in_lbs: 3850,
            Acceleration: 8.5,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'citroen ds-21 pallas',
            Miles_per_Gallon: null,
            Cylinders: 4,
            Displacement: 133,
            Horsepower: 115,
            Weight_in_lbs: 3090,
            Acceleration: 17.5,
            Year: '1970-01-01',
            Origin: 'Europe',
        },
        {
            Name: 'chevrolet chevelle concours (sw)',
            Miles_per_Gallon: null,
            Cylinders: 8,
            Displacement: 350,
            Horsepower: 165,
            Weight_in_lbs: 4142,
            Acceleration: 11.5,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'ford torino (sw)',
            Miles_per_Gallon: null,
            Cylinders: 8,
            Displacement: 351,
            Horsepower: 153,
            Weight_in_lbs: 4034,
            Acceleration: 11,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'plymouth satellite (sw)',
            Miles_per_Gallon: null,
            Cylinders: 8,
            Displacement: 383,
            Horsepower: 175,
            Weight_in_lbs: 4166,
            Acceleration: 10.5,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'amc rebel sst (sw)',
            Miles_per_Gallon: null,
            Cylinders: 8,
            Displacement: 360,
            Horsepower: 175,
            Weight_in_lbs: 3850,
            Acceleration: 11,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'dodge challenger se',
            Miles_per_Gallon: 15,
            Cylinders: 8,
            Displacement: 383,
            Horsepower: 170,
            Weight_in_lbs: 3563,
            Acceleration: 10,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: "plymouth 'cuda 340",
            Miles_per_Gallon: 14,
            Cylinders: 8,
            Displacement: 340,
            Horsepower: 160,
            Weight_in_lbs: 3609,
            Acceleration: 8,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'ford mustang boss 302',
            Miles_per_Gallon: null,
            Cylinders: 8,
            Displacement: 302,
            Horsepower: 140,
            Weight_in_lbs: 3353,
            Acceleration: 8,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'chevrolet monte carlo',
            Miles_per_Gallon: 15,
            Cylinders: 8,
            Displacement: 400,
            Horsepower: 150,
            Weight_in_lbs: 3761,
            Acceleration: 9.5,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'buick estate wagon (sw)',
            Miles_per_Gallon: 14,
            Cylinders: 8,
            Displacement: 455,
            Horsepower: 225,
            Weight_in_lbs: 3086,
            Acceleration: 10,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'toyota corona mark ii',
            Miles_per_Gallon: 24,
            Cylinders: 4,
            Displacement: 113,
            Horsepower: 95,
            Weight_in_lbs: 2372,
            Acceleration: 15,
            Year: '1970-01-01',
            Origin: 'Japan',
        },
        {
            Name: 'plymouth duster',
            Miles_per_Gallon: 22,
            Cylinders: 6,
            Displacement: 198,
            Horsepower: 95,
            Weight_in_lbs: 2833,
            Acceleration: 15.5,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'amc hornet',
            Miles_per_Gallon: 18,
            Cylinders: 6,
            Displacement: 199,
            Horsepower: 97,
            Weight_in_lbs: 2774,
            Acceleration: 15.5,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'ford maverick',
            Miles_per_Gallon: 21,
            Cylinders: 6,
            Displacement: 200,
            Horsepower: 85,
            Weight_in_lbs: 2587,
            Acceleration: 16,
            Year: '1970-01-01',
            Origin: 'USA',
        },
        {
            Name: 'datsun pl510',
            Miles_per_Gallon: 27,
            Cylinders: 4,
            Displacement: 97,
            Horsepower: 88,
            Weight_in_lbs: 2130,
            Acceleration: 14.5,
            Year: '1970-01-01',
            Origin: 'Japan',
        },
        {
            Name: 'volkswagen 1131 deluxe sedan',
            Miles_per_Gallon: 26,
            Cylinders: 4,
            Displacement: 97,
            Horsepower: 46,
            Weight_in_lbs: 1835,
            Acceleration: 20.5,
            Year: '1970-01-01',
            Origin: 'Europe',
        },
        {
            Name: 'peugeot 504',
            Miles_per_Gallon: 25,
            Cylinders: 4,
            Displacement: 110,
            Horsepower: 87,
            Weight_in_lbs: 2672,
            Acceleration: 17.5,
            Year: '1970-01-01',
            Origin: 'Europe',
        },
        {
            Name: 'audi 100 ls',
            Miles_per_Gallon: 24,
            Cylinders: 4,
            Displacement: 107,
            Horsepower: 90,
            Weight_in_lbs: 2430,
            Acceleration: 14.5,
            Year: '1970-01-01',
            Origin: 'Europe',
        },
        {
            Name: 'saab 99e',
            Miles_per_Gallon: 25,
            Cylinders: 4,
            Displacement: 104,
            Horsepower: 95,
            Weight_in_lbs: 2375,
            Acceleration: 17.5,
            Year: '1970-01-01',
            Origin: 'Europe',
        },
        {
            Name: 'bmw 2002',
            Miles_per_Gallon: 26,
            Cylinders: 4,
            Displacement: 121,
            Horsepower: 113,
            Weight_in_lbs: 2234,
            Acceleration: 12.5,
            Year: '1970-01-01',
            Origin: 'Europe',
        },
    ];
    let rawFields = [
        {
            fid: 'Name',
            name: 'Paper Title',
            analyticType: 'dimension',
            semanticType: 'nominal',
            dataType: '?',
        },
        {
            fid: 'Miles_per_Gallon',
            analyticType: 'measure',
            semanticType: 'quantitative',
            dataType: '?',
        },
        {
            fid: 'Cylinders',
            analyticType: 'measure',
            semanticType: 'quantitative',
            dataType: '?',
        },
        {
            fid: 'Displacement',
            analyticType: 'measure',
            semanticType: 'quantitative',
            dataType: '?',
        },
        {
            fid: 'Horsepower',
            analyticType: 'measure',
            semanticType: 'quantitative',
            dataType: '?',
        },
        {
            fid: 'Weight_in_lbs',
            analyticType: 'measure',
            semanticType: 'quantitative',
            dataType: '?',
        },
        {
            fid: 'Acceleration',
            analyticType: 'measure',
            semanticType: 'quantitative',
            dataType: '?',
        },
        {
            fid: 'Year',
            analyticType: 'dimension',
            semanticType: 'temporal',
            dataType: '?',
        },
        {
            fid: 'Origin',
            analyticType: 'dimension',
            semanticType: 'nominal',
            dataType: '?',
        },
    ];
    */
    return (
        <Modal fullscreen isOpen={props.showDialog} toggle={props.toggle}>
            <ModalHeader toggle={props.toggle}>Visualization tool</ModalHeader>
            <ModalBody>
                <GraphicWalker keepAlive={false} hideDataSourceConfig={true} dataSource={cloneDeep(_data)} rawFields={cloneDeep(_properties)} />
            </ModalBody>
        </Modal>
    );
}

VizTool.propTypes = {
    showDialog: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
};

export default VizTool;

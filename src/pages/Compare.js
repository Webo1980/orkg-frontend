import React, {Component} from 'react';
import { ReactTabulator } from 'react-tabulator';

import "react-tabulator/lib/css/bootstrap/tabulator_bootstrap.min.css"; // use Theme(s)


const columns = [
    { title: "Title", field: "title", formatter: "link", width:170 },
    { title: "Similar", field: "sim", formatter: "progress", width:150 },
    { title: "Problem", field: "problem", formatter: "link", width:160 },
    { title: "Programming</br>Language", field: "lang", formatter: "link", width:150 },
    { title: "Stable?", field: "stable", formatter: "tickCross", width:100 },
    { title: "Best</br>Complexity", field: "best", width:120 },
    //{ title: "Average</br>Complexity", field: "average"},
    { title: "Worst</br>Complexity", field: "worst", width:120 },
    { title: "Approach", field: "approach", formatter: "link", width:170 },
  ];
  const data = [
    {
        id: 10,
        sim: 90,
        title: "Merge sort",
        problem: "Efficient sorting",
        approach: "Merging",
        lang: "C++",
        stable: true,
        best:'n log n',
        average: 'n log n',
        worst: 'n log n'
        
    }/*,
    {
        id: 11,
        sim: 60,
        title: "Insertion sort",
        problem: "data sorting",
        approach: "Insertion",
        stable: true,
        best:'n',
        average: 'n2',
        worst: 'n2'
    }*/,
    {
        id: 12,
        sim: 75,
        title: "Heap sort",
        problem: "Efficient sorting",
        approach: "Selection",
        stable: false,
        best:'n',
        average: 'n log n',
        worst: 'n log n'
    },
    {
        id: 13,
        sim: 55,
        title: "Bubble sort",
        problem: "Sorting",
        approach: "Exchanging",
        stable: true,
        lang: "Python",
        best:'n',
        average: 'n2',
        worst: 'n2'
    },
    {
        id: 1,
        title: "Towards research infrastructures that curate scientific information: A use case in life sciences",
        problem: "reproducibility crisis",
        approach: "leverage web technologies",
        lang: "Python",
        sim: 14,
    }/*,
    {
        id: 2,
        title: "Interactive Visualization for large-scale multi-factorial Research Designs",
        problem: "reproducibility crisis",
        approach: "Factorial expiremental designs",
        lang: "Java",
        sim: 10,
    }*/,
    {
        id: 3,
        title: "FedSDM: Semantic Data Manager for Federations of RDF Datasets",
        problem: "Semantic data managment",
        approach: "",
        lang: "Python 3.5",
        sim: 22,
    }/*,
    {
        id: 4,
        title: "Data Integration for Supporting Biomedical Knowledge Graph Creation at Large-Scale",
        problem: "semantic data integration",
        approach: "NGS analyzed data",
        lang: "Python 3.5",
        sim: 2,
    },
    {
        id: 5,
        title: "Automated Coding of Medical Diagnostics from Free- Text: the Role of Parameters Optimization and Imbalanced Classes",
        problem: "imbalanced classes",
        approach: "SVM",
        lang: "Python",
        sim: 1,
    }*/
  ];

export default class Compare extends Component {

    state = {
        data: []
    };

    
    fectchData = () => {
        fetch('./data/data.json')
            .then((response) => response.json())
            .then((findresponse)=> {
                this.setState({
                    data:findresponse
                })
            });
    }

    render() {
        //if (this.state.data && this.state.data.length === 0) {
        //   this.fectchData();
        //}
        return  <div>
            <div>
                <h3>Comparing <a href='#'>Quick Sort</a> to other research contributions:</h3>
            </div>
            <ReactTabulator columns={columns} data={data} />
        </div>;
        
    }

}

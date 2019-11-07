import React, { Component } from 'react';
import { connect } from 'react-redux';
import { goToResourceHistory } from '../../actions/statementBrowser';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components/macro';
import PropTypes from 'prop-types';

const BreadcrumbList = styled.ul`
    list-style: none; 
    overflow: hidden; 
    padding:0;
    margin:10px 0 0;
    display:flex;
    width:80%;
    border-top-right-radius: 12px;
    border-bottom-right-radius: 12px;

    li { 
        float: left; 
        font-size:87%;

        b{
            white-space:nowrap;
            overflow:hidden;
            text-overflow: ellipsis;
            max-width:48px;
            cursor:pointer;


            font-weight: normal;
            float: left;
        }

        span {
            padding: 8px 0 8px 15px;
            background: rgb(219,221,229);
            position: relative; 
            display: block;
            float: left;


            &::after { 
                content: " "; 
                display: block; 
                width: 0; 
                height: 0;
                border-top: 20px solid transparent;
                border-bottom: 20px solid transparent;
                border-left: 10px solid rgb(219,221,229);
                position: absolute;
                top: 50%;
                margin-top: -20px; 
                left: 100%;
                z-index: 2; 
            }

            &::before { 
                content: " "; 
                display: block; 
                width: 0; 
                height: 0;
                border-top: 20px solid transparent;       
                border-bottom: 20px solid transparent;
                border-left: 10px solid white;
                position: absolute;
                top: 50%;
                margin-top: -20px; 
                margin-left: 1px;
                left: 100%;
                z-index: 1; 
            }
        }

        &:first-child span {
            padding-left: 14px;
            padding-right: 6px;
            border-top-left-radius: 12px;
            border-bottom-left-radius: 12px;
        }

        &:last-child span {
            background:#E86161;
            color:#fff;
            border-top-right-radius: 12px;
            border-bottom-right-radius: 12px;

            b{
                max-width:100%;
                padding-right:8px;
                cursor:default;
            }

            &:hover b{
                color:inherit;
            }
            
        }

        &:hover b{
            max-width: 100%;
            color:#000;
        }
    }

    li:last-child span::after { 
        border: 0; 
    }
`;

const Container = styled.div`
    margin: 0 0 10px 0;
    height: 35px;
`;

class Breadcrumbs extends Component {
    handleOnClick = (id, historyIndex) => {
        this.props.goToResourceHistory({
            id,
            historyIndex,
        });
    }

    handleBackClick = () => {
        let historyIndex = this.props.resourceHistory.allIds.length - 2;
        let id = this.props.resourceHistory.allIds[historyIndex];

        this.props.goToResourceHistory({
            id,
            historyIndex,
        });
    }

    render() {
        return (
            <Container>
                <BreadcrumbList>
                    {this.props.resourceHistory.allIds.map((history, index) => {
                        let item = this.props.resourceHistory.byId[history];

                        return (
                            <li key={index} onClick={() => this.handleOnClick(item.id, index)}>
                                <span>
                                    <b>
                                        {item.label === 'Main' ? <Icon icon={faFile} /> : item.label}
                                    </b>
                                </span>
                            </li>
                        );
                    })}

                </BreadcrumbList>
                <div className="clearfix" />
            </Container>
        )
    }
}

Breadcrumbs.propTypes = {
    resourceHistory: PropTypes.object.isRequired,
    goToResourceHistory: PropTypes.func.isRequired,
};

const mapStateToProps = state => {
    return {
        resourceHistory: state.statementBrowser.resourceHistory,
        level: state.statementBrowser.level,
    }
};

const mapDispatchToProps = dispatch => ({
    goToResourceHistory: (data) => dispatch(goToResourceHistory(data)),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Breadcrumbs);
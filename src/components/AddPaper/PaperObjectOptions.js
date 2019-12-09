import React, { Component } from 'react';
import {
    Button,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownItem,
    DropdownMenu,
    Modal,
    ModalBody,
    ModalHeader,
    Input,
    Tooltip as ReactstrapTooltip
} from 'reactstrap';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { connect } from 'react-redux';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faCog, faClipboard } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';
import { getPaperObject } from 'utils';
import styled from 'styled-components';

const Textarea = styled(Input)`
    font-family: 'Courier New';
    font-size: 85% !important;
`;

const AddPaperOptionStyled = styled(UncontrolledDropdown)`
    position: absolute !important;
    bottom: 0;
    .btn {
        border-bottom-left-radius: 0 !important;
        border-bottom-right-radius: 0 !important;
    }
`;

class PaperObjectOptions extends Component {
    constructor(props) {
        super(props);

        this.state = {
            showTooltipCopiedJSON: false
        };
    }

    toggleTooltip = (e, type) => {
        if (e && e.type !== 'mouseover') {
            this.setState(prevState => ({
                [type]: !prevState[type]
            }));
        }
    };

    /*
        importData = () => {
            if (this.state.jsonToImport) {
                console.log(this.state.jsonToImport);
                let paper = JSON.parse(this.state.jsonToImport);

                this.props.updateGeneralData({
                    title: paper.paper.title,
                    authors: paper.paper.authors,
                    publicationMonth: paper.paper.publicationMonth,
                    publicationYear: paper.paper.publicationYear,
                    showLookupTable: false,
                    doi: paper.paper.doi,
                    entry: paper.paper.doi ? paper.paper.doi : ''
                });

                this.props.updateResearchField({
                    selectedResearchField: paper.paper.researchField
                });
            }
        };
    */

    render() {
        let jsonObject = JSON.stringify(
            getPaperObject({
                title: this.props.title,
                authors: this.props.authors,
                publicationMonth: this.props.publicationMonth,
                publicationYear: this.props.publicationYear,
                doi: this.props.doi,
                selectedResearchField: this.props.selectedResearchField,
                contributions: this.props.contributions,
                resources: this.props.resources,
                properties: this.props.properties,
                values: this.props.values
            })
        );
        return (
            <>
                <AddPaperOptionStyled>
                    <DropdownToggle color="darkblue" size="sm">
                        <Icon icon={faCog} />
                    </DropdownToggle>
                    <DropdownMenu>
                        <DropdownItem
                            onClick={() => {
                                this.props.toggle('showPaperObjectDialog');
                            }}
                        >
                            Export paper data
                        </DropdownItem>
                    </DropdownMenu>
                </AddPaperOptionStyled>

                <Modal isOpen={this.props.showDialog} toggle={this.props.toggle} size="lg">
                    <ModalHeader toggle={this.props.toggle}>Export paper data : JSON format</ModalHeader>
                    <ModalBody>
                        <>
                            <p>
                                <Textarea type="textarea" value={jsonObject} disabled rows="15" readOnly />
                            </p>

                            <CopyToClipboard
                                id="copyToClipboardJSON"
                                text={jsonObject}
                                onCopy={() => {
                                    this.setState({ showTooltipCopiedJSON: true });
                                }}
                            >
                                <Button color="primary" className="pl-3 pr-3 float-right" size="sm">
                                    <Icon icon={faClipboard} /> Copy to clipboard {/* TODO: show a success message after copy */}
                                </Button>
                            </CopyToClipboard>
                            <ReactstrapTooltip
                                placement="top"
                                target="copyToClipboardJSON"
                                trigger={'hover'}
                                toggle={e => this.toggleTooltip(e, 'showTooltipCopiedJSON')}
                                isOpen={this.state.showTooltipCopiedJSON}
                            >
                                Copied!
                            </ReactstrapTooltip>
                        </>
                    </ModalBody>
                </Modal>
            </>
        );
    }
}

PaperObjectOptions.propTypes = {
    title: PropTypes.string.isRequired,
    authors: PropTypes.array.isRequired,
    publicationMonth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    publicationYear: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    doi: PropTypes.string.isRequired,
    selectedResearchField: PropTypes.string.isRequired,
    contributions: PropTypes.object.isRequired,
    resources: PropTypes.object.isRequired,
    properties: PropTypes.object.isRequired,
    values: PropTypes.object.isRequired,
    toggle: PropTypes.func.isRequired,
    showDialog: PropTypes.bool.isRequired
};

const mapStateToProps = state => ({
    publicationMonth: state.addPaper.publicationMonth,
    publicationYear: state.addPaper.publicationYear,
    doi: state.addPaper.doi,
    selectedResearchField: state.addPaper.selectedResearchField,
    contributions: state.addPaper.contributions,
    selectedContribution: state.addPaper.selectedContribution,
    resources: state.statementBrowser.resources,
    properties: state.statementBrowser.properties,
    values: state.statementBrowser.values,
    title: state.addPaper.title,
    authors: state.addPaper.authors
});

const mapDispatchToProps = dispatch => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(PaperObjectOptions);

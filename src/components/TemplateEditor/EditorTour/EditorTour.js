import React, { useState } from 'react';
import Tour from 'reactour';
import { withTheme } from 'styled-components';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

function EditorTour(props) {
    const [currentStep, setCurrentStep] = useState(0);
    const steps = [
        {
            // eslint-disable-next-line react/prop-types
            content: ({ goTo }) => (
                <div>
                    <p>
                        This is <strong>ORKG</strong> template editor. <br />
                        <br />
                        <i>
                            <b>Definition:</b> A template is a model or a pattern used to create new resource in ORKG, it is adjusted for a specific
                            research field or a research problem .
                        </i>
                    </p>
                    <p className="d-flex mt-3">Would you like to take a quick tour?</p>
                    <div className="d-flex mt-2">
                        <div className="flex-grow-1">
                            <Button color="primary" size="sm" onClick={() => goTo(1)}>
                                Yes, please!
                            </Button>
                        </div>
                        <Button
                            className=""
                            size="sm"
                            outline
                            onClick={() => {
                                props.setIsTourOpen(false);
                            }}
                        >
                            No, thanks!
                        </Button>
                    </div>
                </div>
            ),
            selector: 'window',
            placement: 'center'
        },
        {
            selector: '#templateWorkspaceArea',
            position: 'top',
            content: <p>Here&apos;s where you are going to structure your template</p>
        },
        {
            selector: '#addShapeButton',
            content: (
                <span>
                    <p>And you&apos;ll start by adding a template.</p>
                    <p>
                        You can do it by clicking on this button, then you&apos;ll see all available options, so you can create awesome templates...
                    </p>
                </span>
            )
        },
        {
            selector: '#templateEditorFitZoom',
            content: <p>Reset zoom</p>
        },
        {
            selector: '#templateEditReorganize',
            content: <p>Automatically arrange the diagram elements.</p>
        } /*
        {
            selector: '#previewButton',
            content: (
                <div>
                    <p>After that check a preview of the template, if works as you expected</p>
                </div>
            )
        },*/,
        {
            selector: '#saveButton',
            content: (
                <div>
                    <p>Once you are done! click on this button to save the template</p>
                </div>
            )
        }
    ];

    return (
        <>
            <Tour
                steps={steps}
                isOpen={props.isOpen}
                onRequestClose={() => props.setIsTourOpen(false)}
                showNumber={false}
                getCurrentStep={curr => setCurrentStep(curr)}
                accentColor={props.theme.orkgPrimaryColor}
                rounded={10}
                showButtons={currentStep === 0 ? false : true}
                showNavigation={currentStep === 0 ? false : true}
            />
        </>
    );
}

EditorTour.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    setIsTourOpen: PropTypes.func.isRequired,
    theme: PropTypes.object.isRequired
};

export default withTheme(EditorTour);

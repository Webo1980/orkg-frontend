import { nextStep, previousStep, updateResearchField, isBioassay } from 'actions/addPaper';
import ResearchFieldSelector from 'components/ResearchFieldSelector/ResearchFieldSelector';
import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from 'reactstrap';

const ResearchField = () => {
    const [showError, setShowError] = useState(false);
    const selectedResearchField = useSelector(state => state.addPaper.selectedResearchField);
    const researchFields = useSelector(state => state.addPaper.researchFields);
    const dispatch = useDispatch();

    // could be easier handled with "has parentid Rxx" than just lining up the child ids
    const BioassayFieldList = [
        'R13', // Biochemistry, Biophysics, and Structural Biology
        'R14',
        'R15',
        'R16',
        'R17',
        'R18',
        'R19', // Cell and Developmental Biology
        'R20',
        'R21',
        'R22',
        'R23',
        'R35', // Genetics and Genomics
        'R36',
        'R37',
        'R38',
        'R39',
        'R40', // Immunology and Infectious Desease
        'R41',
        'R42',
        'R43',
        'R44',
        'R45',
        'R48', // Biomechanics
        'R52', // Microbiology
        'R53',
        'R54',
        'R55',
        'R56',
        'R57'
    ];

    const handleNextClick = () => {
        if (!selectedResearchField) {
            setShowError(true);
            return;
        }
        dispatch(isBioassay(false));
        dispatch(nextStep());
    };

    const handleBioassayClick = () => {
        dispatch(isBioassay(true));
        dispatch(nextStep());
    };

    let researchFieldLabel;
    if (researchFields && researchFields.length > 0) {
        const field = researchFields.find(rf => rf.id === selectedResearchField);
        researchFieldLabel = field ? field.label : selectedResearchField;
    }

    const handleUpdateResearchField = useCallback(
        data => {
            dispatch(updateResearchField(data));
        },
        [dispatch]
    );

    return (
        <div>
            <h2 className="h4 mt-4 mb-4">Select the research field</h2>
            <p className="text-muted">Select a research field by using the search field or select a field form the list</p>

            <div style={{ maxWidth: 800 }}>
                <ResearchFieldSelector
                    selectedResearchField={selectedResearchField}
                    researchFields={researchFields}
                    updateResearchField={handleUpdateResearchField}
                />
            </div>

            {researchFieldLabel && selectedResearchField ? (
                <div className="mt-3 mb-3">
                    Selected research field: <b>{researchFieldLabel}</b>
                </div>
            ) : (
                <p className={`text-danger mt-2 pl-2 ${!showError ? ' d-none' : ''}`} style={{ borderLeft: '4px red solid' }}>
                    Please select the research field
                </p>
            )}

            <hr className="mt-5 mb-3" />

            <Button color="primary" className="float-right mb-4" onClick={handleNextClick}>
                Next step
            </Button>
            <Button color="light" className="float-right mb-4 mr-2" onClick={() => dispatch(previousStep())}>
                Previous step
            </Button>

            {BioassayFieldList.includes(selectedResearchField) && (
                <Button color="secondary" className="float-right mb-4 mr-2" onClick={handleBioassayClick}>
                    Add Bioassay
                </Button>
            )}
        </div>
    );
};

export default ResearchField;

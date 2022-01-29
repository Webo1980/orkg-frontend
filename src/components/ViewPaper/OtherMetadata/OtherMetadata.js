import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Project from 'components/ViewPaper/OtherMetadata/Project';
import { Button } from 'reactstrap';
import Citations from 'components/ViewPaper/OtherMetadata/Citations';
import Topics from 'components/ViewPaper/OtherMetadata/Topics';

const OtherMetadata = () => {
    const citations = useSelector(state => state.viewPaper.citations);
    const references = useSelector(state => state.viewPaper.references);
    const project = useSelector(state => state.viewPaper.project);
    const topics = useSelector(state => state.viewPaper.topics);
    const [showCitationModal, setShowCitationModal] = useState(false);
    const [showReferencesModal, setShowReferencesModal] = useState(false);
    const [showProjectModal, setShowProjectModal] = useState(false);
    const [showTopicModal, setShowTopicModal] = useState(false);

    useEffect(() => {}, []);

    return (
        <>
            <div>
                <Button color="primary" size="sm" style={{ width: '200px' }} onClick={() => setShowCitationModal(v => !v)}>
                    Citations ({citations.length})
                </Button>
                <br /> <br />
                <Button color="primary" size="sm" style={{ width: '200px' }} onClick={() => setShowReferencesModal(v => !v)}>
                    References ({references.length})
                </Button>
                <br /> <br />
                <Button color="primary" size="sm" style={{ width: '200px' }} onClick={() => setShowProjectModal(v => !v)}>
                    Projects ({project.length})
                </Button>
                <br /> <br />
                <Button color="primary" size="sm" style={{ width: '200px' }} onClick={() => setShowTopicModal(v => !v)}>
                    Topics ({topics.length})
                </Button>
            </div>
            <Citations showDialog={showCitationModal} toggle={() => setShowCitationModal(v => !v)} citations={citations} />
            <Citations showDialog={showReferencesModal} toggle={() => setShowReferencesModal(v => !v)} />
            <Project showDialog={showProjectModal} toggle={() => setShowProjectModal(v => !v)} project={project} />
            <Topics showDialog={showTopicModal} toggle={() => setShowTopicModal(v => !v)} topics={topics} />
        </>
    );
};

export default OtherMetadata;

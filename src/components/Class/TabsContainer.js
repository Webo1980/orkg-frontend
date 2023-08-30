import ClassInstances from 'components/ClassInstances/ClassInstances';
import { TabHeaderStyle } from 'components/Tabs/styled';
import Tabs from 'components/Tabs/Tabs';
import ROUTES from 'constants/routes.js';
import { reverse } from 'named-urls';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Col, Container, Row } from 'reactstrap';
import InformationTab from './InformationTab';
import TreeView from './TreeView';

function TabsContainer({ id, label, uri, editMode }) {
    const { activeTab } = useParams();
    const [reloadTree, setReloadTree] = useState(false);
    const navigate = useNavigate();

    const onTabChange = key => {
        navigate(
            `${reverse(ROUTES.CLASS_TABS, {
                id,
                activeTab: key,
            })}?noRedirect&isEditMode=${editMode}`,
        );
    };

    return (
        <Container className="mt-2 p-0">
            <Row>
                <Col md={6} className="box rounded p-0" style={{ background: '#fff' }}>
                    <TabHeaderStyle className="rc-tabs-nav-wrap">Tree view</TabHeaderStyle>
                    <TreeView id={id} label={label} reloadTree={reloadTree} />
                </Col>
                <Col md={6}>
                    <Tabs
                        className="box rounded"
                        style={{ position: 'sticky', top: '70px' }}
                        destroyInactiveTabPane={true}
                        onChange={onTabChange}
                        activeKey={activeTab ?? 'information'}
                        items={[
                            {
                                label: 'Class information',
                                key: 'information',
                                children: (
                                    <InformationTab
                                        uri={uri}
                                        id={id}
                                        label={label}
                                        editMode={editMode}
                                        callBackToReloadTree={() => setReloadTree(v => !v)}
                                    />
                                ),
                            },
                            {
                                label: 'Instances',
                                key: 'instances',
                                children: <ClassInstances classId={id} />,
                            },
                        ]}
                    />
                </Col>
            </Row>
        </Container>
    );
}

TabsContainer.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string,
    uri: PropTypes.string,
    editMode: PropTypes.bool.isRequired,
};

export default TabsContainer;

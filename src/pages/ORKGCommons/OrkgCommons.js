import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Button, Container, DropdownMenu } from 'reactstrap';
import { createGlobalStyle } from 'styled-components';
import { Input, FormGroup, InputGroupAddon, InputGroup } from 'reactstrap';
import { getWorksData } from 'services/backend/Graphql';
import { InputGroupButtonDropdown } from 'reactstrap';
import { StyledDropdownItem, StyledDropdownToggle } from 'components/StatementBrowser/styled';
import Content from 'pages/ORKGCommons/Content';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

const OrkgCommons = () => {
    const [type, setType] = useState('content');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [text, setText] = useState('');
    const [search, setSearch] = useState(false);
    useEffect(() => {
        document.title = 'ORKG Commons';
    }, []);

    const getValue = e => {
        setText(e);
    };

    return (
        <>
            <Container className="mt-4">
                <div className="box p-4">
                    <FormGroup>
                        <InputGroup>
                            <InputGroupButtonDropdown addonType="append" isOpen={isDropdownOpen} toggle={() => setIsDropdownOpen(v => !v)}>
                                <StyledDropdownToggle disableBorderRadiusRight={true}>
                                    <small>{type}</small>
                                    <Icon size="xs" />
                                </StyledDropdownToggle>
                                <DropdownMenu>
                                    <StyledDropdownItem onClick={() => setType('content')}>Content</StyledDropdownItem>
                                    <StyledDropdownItem onClick={() => setType('people')}>People</StyledDropdownItem>
                                </DropdownMenu>
                            </InputGroupButtonDropdown>
                            <Input id="search_content" onChange={e => getValue(e.target.value)} value={text} />
                            <InputGroupAddon addonType="append">
                                <Button
                                    color="primary"
                                    className="pl-3 pr-3"
                                    style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                                    onClick={() => setSearch(true)}
                                >
                                    <Icon icon={faSearch} />
                                </Button>
                            </InputGroupAddon>
                        </InputGroup>
                    </FormGroup>
                </div>
            </Container>
            {text && type === 'content' && search && <Content input={text} />}
            {text && type === 'project' && search && <Content input={text} />}
        </>
    );
};

export default OrkgCommons;

import styled from 'styled-components';
import { ListGroupItem } from 'reactstrap';

export const customStyles = {
    control: (provided, state) => ({
        ...provided,
        background: 'inherit',
        boxShadow: state.isFocused ? 0 : 0,
        border: 0,
        paddingLeft: 0,
        paddingRight: 0,
        cursor: 'text',
        minHeight: 'initial',
        borderRadius: 'inherit',
        padding: 0,
        '&>div:first-of-type': {
            padding: 0
        }
    }),
    container: provided => ({
        padding: 0,
        height: 'auto',
        background: '#fff',
        display: 'inline-block',
        width: '100%',
        marginRight: 15,
        '&>div:first-of-type': {
            padding: 0
        }
    }),
    menu: provided => ({
        ...provided,
        zIndex: 10,
        width: '50%',
        color: '#000'
    }),
    option: provided => ({
        ...provided,
        cursor: 'pointer',
        whiteSpace: 'normal'
    }),
    indicatorsContainer: provided => ({
        ...provided,
        cursor: 'pointer',
        '&>div:last-child': {
            padding: '0 8px'
        }
    }),
    input: provided => ({
        ...provided,
        margin: '0 4px'
    }),
    placeholder: provided => ({
        ...provided,
        opacity: 0.7,
        paddingLeft: 5,
        fontStyle: 'italic'
    })
};

export const StyledStatementItemValueDropZoneHelper = styled(ListGroupItem)`
    padding: 0.25rem 0.75rem !important;
    cursor: default;
    text-align: center;
    background-color: ${props => props.theme.ultraLightBlue} !important; 
    border: 3px dashed ${props => props.theme.ultraLightBlueDarker} !important;
    border-color: ${props => props.theme.ultraLightBlueDarker} !important; 
    /*border: 2px dashed ${props => props.theme.orkgPrimaryColor};*/

    &:hover, &:focus {
        z-index:initial !important; 
    }
`;

import { useState, useEffect } from 'react';
import { Button, Input, InputGroup, InputGroupAddon } from 'reactstrap';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faPen, faCheck, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import PropTypes from 'prop-types';

const InlineEditForm = props => {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading] = useState(false);
    const [draftValue, setDraftValue] = useState(props.value);

    useEffect(() => {
        setDraftValue(props.value);
    }, [props.value]);
    return (
        <div>
            {!isEditing && (
                <div>
                    {props.value || (
                        <i>
                            <small>Not Defined</small>
                        </i>
                    )}
                    <Button
                        size="sm"
                        color="link"
                        onClick={() => {
                            setIsEditing(true);
                        }}
                    >
                        <Icon icon={faPen} /> Edit
                    </Button>
                </div>
            )}
            {isEditing && (
                <div className="clearfix">
                    <InputGroup size="sm">
                        <Input
                            value={draftValue}
                            onChange={e => {
                                setDraftValue(e.target.value);
                            }}
                            disabled={isLoading}
                        />

                        <InputGroupAddon addonType="append">
                            <Button
                                color="light-darker"
                                onClick={() => {
                                    setIsEditing(false);
                                }}
                                disabled={isLoading}
                            >
                                {!isLoading ? (
                                    <>
                                        <Icon icon={faTimes} /> Cancel
                                    </>
                                ) : (
                                    <Icon icon={faSpinner} spin />
                                )}
                            </Button>
                            <Button
                                color="secondary"
                                onClick={() =>
                                    props.handleSubmitClick(draftValue).then(() => {
                                        setIsEditing(false);
                                    })
                                }
                                disabled={isLoading}
                            >
                                {!isLoading ? (
                                    <>
                                        <Icon icon={faCheck} /> Save
                                    </>
                                ) : (
                                    <Icon icon={faSpinner} spin />
                                )}
                            </Button>
                        </InputGroupAddon>
                    </InputGroup>
                </div>
            )}
            {isLoading && (
                <div>
                    <span className="fa fa-spinner fa-spin" />
                </div>
            )}
        </div>
    );
};

InlineEditForm.propTypes = {
    value: PropTypes.string.isRequired,
    handleSubmitClick: PropTypes.func.isRequired
};

export default InlineEditForm;

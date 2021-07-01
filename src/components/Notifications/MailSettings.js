import React, { useState, useEffect } from 'react';
import { Form, FormGroup, Label, Input, Button, Alert, FormFeedback, CustomInput } from 'reactstrap';
import Tooltip from '../Utils/Tooltip';
import { updateNotificationEmailSettings, getNotificationEmailSettings } from 'services/backend/notifications';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const MailSettings = () => {
    const [timeSelect, setTimeSelect] = useState('-1');
    const user = useSelector(state => state.auth.user);
    const [selectedOption, setSelectedOption] = useState('-1');

    const onTimeSelect = e => {
        setTimeSelect(parseInt(e));
        setSelectedOption(parseInt(e));
    };

    useEffect(() => {
        getNotificationEmailSettings(user.id)
            .then(response => {
                console.log(response);
                onTimeSelect(response.time);
            })
            .catch(e => {
                console.log('Error while fetching data', e);
                toast.error('Error while fetching settings');
            });
    }, []);

    const setEmailCronJobTime = () => {
        const notificationEmailData = {
            userId: user.id,
            time: selectedOption
        };

        updateNotificationEmailSettings(notificationEmailData)
            .then(response => {
                console.log(response);
                toast.success('Updated the settings successfully');
            })
            .catch(e => {
                toast.error('Could not update the email settings');
            });

        console.log(timeSelect);
    };

    return (
        <div>
            <Form>
                <FormGroup>
                    <Label for="cron_job_time">Subscription Digest Email</Label>
                    <Tooltip message="You will receive an email daily comprising of new papers, comparisons, etc., added to ORKG at the selected time." />
                    <div className="ml-3">
                        <Input type="radio" value="-1" checked={selectedOption === -1} onChange={e => onTimeSelect(e.target.value)} />
                        <Label for="negativeOne" className="ml-2">
                            I do not wish to receive daily digest emails.
                        </Label>
                    </div>
                    <div className="ml-3">
                        <Input type="radio" value="18" checked={selectedOption === 18} onChange={e => onTimeSelect(e.target.value)} />
                        <Label for="One" className="ml-2">
                            I wish to receive daily digest emails.
                        </Label>
                    </div>
                    {/**<div className="ml-3">
                        <Input type="radio" value="6" checked={selectedOption === 6} onChange={e => onTimeSelect(e.target.value)} />
                        <Label for="six" className="ml-2">
                            6:00 (CET)
                        </Label>
                    </div>
                    <div className="ml-3">
                        <Input type="radio" value="19" checked={selectedOption === 19} onChange={e => onTimeSelect(e.target.value)} />
                        <Label for="nine" className="ml-2">
                            19:00 (CET)
                        </Label>
                    </div>*/}
                    <div className="mt-3">
                        <Button onClick={setEmailCronJobTime}>Save Changes</Button>
                    </div>
                </FormGroup>
            </Form>
        </div>
    );
};

export default MailSettings;

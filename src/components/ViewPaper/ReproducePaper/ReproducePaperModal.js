import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faQuestionCircle , faCheck, faTimes,faMinus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { SortableContainer } from 'react-sortable-hoc';
import Tabs, { TabPane } from 'rc-tabs';
import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Col, Container, Row } from 'reactstrap';
import { Modal, ModalHeader, ModalBody, Table } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import Tippy from '@tippyjs/react';
import ContributionTab from 'components/ContributionTabs/ContributionTab';
import { useNavigate } from 'react-router-dom';
import { reverse } from 'named-urls';
import ROUTES from 'constants/routes.js';
import axios from "axios";
const GitUrlParse = require("git-url-parse");
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
    auth: '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'
})

import { 
            getTemplateRequiredPropertiesIDsForReproducibilitysByResourceID, 
            hasPropertyValue, 
            getPropertyIdByByResourceAndPredicateId
       } from 'slices/statementBrowserSlice';

import {selectContribution} from 'slices/viewPaperSlice';

import { StyledContributionTabs } from 'components/ContributionTabs/styled';

const ReproducePaperModal = (props) => {
  const { resourceId, contributionId } = useParams();
  const firstContributionId = useSelector(state => contributionId ??state.viewPaper.contributions?.[0].id);
  const state = useSelector(state => state);
  const contributions = state.viewPaper.contributions;
  const templates = state.statementBrowser.templates;
  const [selectedContribution, setSelectedContribution] = useState(firstContributionId);
  const requiredPropertiesIDsForReproducibility = getTemplateRequiredPropertiesIDsForReproducibilitysByResourceID(state,selectedContribution);
  let availabilityScore = [];
  let accessibilityScore = [];
  let linkabilityScore = [];
  let licenseScore = [];
  const [checkedPropertyAccessibility,setCheckedPropertyAccessibility]=useState(false);
  const [checkedPropertyLicense,setCheckedPropertyLicense]=useState('');
  const [currentPropertyValue,setPropertyValue]=useState('');
  const [currentPropertyType,setPropertyType]=useState('');
  const dispatch = useDispatch();
  
  useEffect(() => {
    setSelectedContribution(contributionId ?? firstContributionId);
  }, [firstContributionId]);

  const navigate = useNavigate();
  const handleSelectContribution = cId => {
    // get the contribution label
    const contributionResource = contributions.find(c => c.id === selectedContribution);
    if (contributionResource) {
        setLoadingContributionFailed(false);
        dispatch    (
            selectContribution({
                contributionId: cId,
                contributionLabel: contributionResource.label,
            }),
        );
    } 
  };

  const onTabChange = key => {
    navigate(
        reverse(ROUTES.VIEW_PAPER_CONTRIBUTION, {
            resourceId,
            contributionId: key,
        }),
    );
    handleSelectContribution(key);
    setSelectedContribution(key);
  };

  const renderTabBar = (props, DefaultTabBar) => (
    <div id="contributionsList">
        <DefaultTabBar {...props} />
    </div>
   );

  const TableContainerStyled = styled.div`
    overflow: auto;
    background: ${props => props.theme.lightLighter};
    font-size: 90%;
    max-height: 500px;
    border: 2px solid ${props => props.theme.secondary};
    border-radius: ${props => props.theme.borderRadius};
    //overflow-x: scroll
`;

  const AnimationContainer = styled(CSSTransition)`
      transition: 0.3s background-color, 0.3s border-color;

      &.fadeIn-enter {
          opacity: 0;
      }

      &.fadeIn-enter.fadeIn-enter-active {
          opacity: 1;
          transition: 0.5s opacity;
      }
  `;

  if(props.showReproducePaperModalDialog===true){
     let isReproducibilityTemplateUsed = [];
     if(Object.keys(templates).length > 0 ) {
          Object.entries(templates).map((key, value) => {
            if(Object.keys(templates).length > 0 ) {
                const templateName = key[1].label
                if(templateName!="" && typeof templateName === "string") {
                    isReproducibilityTemplateUsed[value] = templateName.startsWith("Reproducible")
                }
            }
         });
    }

    let checkAccessibility = (propertyValue, propertyType,accessibilityScore) => {
        const accessibility = [];
        if(propertyValue!=""){
            if(propertyType=="literal" && propertyValue.startsWith("http")){
                    const fetchAccessibility =  () => {
                    try {
                            axios.get(propertyValue, {params: {}})
                            .then(response => {
                            (response.status == 200) ? setCheckedPropertyAccessibility(true) : setCheckedPropertyAccessibility(false);
                            })
                            .catch(error => {
                            setCheckedPropertyAccessibility(false);
                            })
                      } catch (error) {
                            setCheckedPropertyAccessibility(false);
                      }
                    };
                    fetchAccessibility();
                if(checkedPropertyAccessibility == true){
                    accessibilityScore[propertyValue] = 100;
                    accessibility.push(<Tippy content={
                        <>
                            The given url: {propertyValue} is reachable
                        </>
                    }><Icon icon={faCheck} className="mt-2 text-success" /></Tippy>);
               }
               else{
                    accessibilityScore[propertyValue] = 0;
                    accessibility.push(<Tippy content={
                        <>
                            The given url: {propertyValue} is unreachable
                        </>
                    }><Icon icon={faXmark} className="mt-2 text-danger" /></Tippy>);
               }
            }
            else{
                    accessibilityScore[propertyValue] = 100;
                    accessibility.push(<Tippy content={
                        <>
                            The property type : {propertyType} is not a valid url, so it is inapplicable for this check
                        </>
                    }><Icon icon={faMinus}  style={{color: '#D4D4D4', fontWeight: 'bolder', fontSize: '1.5em'}} /></Tippy>);
            }
        }
        else{
                accessibilityScore[propertyValue] = 0;
                accessibility.push(<Tippy content="The property has to have at least one value"><Icon icon={faTimes} className="mt-2 text-danger" /></Tippy>);
        }
        return [accessibility,accessibilityScore];
    }

    let checkAvailability = (propertyValue) => {
        const availability = [];
        if(propertyValue!=""){
            availabilityScore[propertyValue] = 100;
            availability.push(<Tippy content={
                <>
                    The property has value: {propertyValue}
                </>
            }><Icon icon={faCheck} className="mt-2 text-success" /></Tippy>);
        }
        else{
                availabilityScore[propertyValue] = 0;
                availability.push(<Tippy content="The property has to have at least one value"><Icon icon={faTimes} className="mt-2 text-danger" /></Tippy>);
        }
        return [availability,availabilityScore];
    }

    let checkLinkability = (propertyValue, propertyType, resourceId, linkabilityScore, propertyName) => {
        const linkability = [];
        if(propertyType == "resource"){
            let resources = state.statementBrowser.resources;
            let sameAsValueId = getPropertyIdByByResourceAndPredicateId(state, resourceId, 'SAME_AS');
            if(sameAsValueId){
                let valueID = state.statementBrowser.properties.byId[sameAsValueId].valueIds;
                if(valueID==''){
                    linkabilityScore[propertyValue] = 0;
                    linkability.push(<Tippy content={
                        <>
                            The property is not of type resource, and cannot be linked with other resources
                        </>
                    }><Icon icon={faXmark} className="mt-2 text-danger" /></Tippy>);
                }
                else{
                    Object.entries(resources.byId).map((key, value) => {
                        if(key[1].valueId == valueID){
                            linkabilityScore[propertyValue] = 100;
                            linkability.push(<Tippy content={
                                <>
                                    The resource {propertyValue} is linked with the external ontology {key[1].label}
                                </>
                            }><Icon icon={faCheck} className="mt-2 text-success" /></Tippy>);
                        }
                    });    
                }
            }
            else{
                    linkabilityScore[propertyValue] = 0;    
                    linkability.push(<Tippy content={
                        <>
                            The resource {propertyValue} is not linked to any external ontolgies
                        </>
                    }><Icon icon={faXmark} className="mt-2 text-danger" /></Tippy>);
            }
        }
        else{   
                linkabilityScore[propertyValue] = 100;
                linkability.push(<Tippy content={
                    <>
                        The property is not of type resource, so it is inapplicable for this check
                    </>
                }><Icon icon={faMinus}  style={{color: '#D4D4D4', fontWeight: 'bolder', fontSize: '1.5em'}} /></Tippy>);
        }
        return [linkability,linkabilityScore];
    }

    let checkLicense  = (propertyValue, propertyType ,licenseScore) => {
        const license = [];
        if(propertyValue!=""){
            if(propertyType=="literal" && propertyValue.startsWith("http")){
                const url = new URL(propertyValue);
                const domain = url.hostname.split('.').shift();
                if(domain == 'github'){
                    const parsedURL = GitUrlParse(propertyValue);
                    const getRepoLicense = async (parsedURL) => {
                        try {      
                                const response = await octokit.repos.get({
                                    owner: parsedURL.owner,
                                    repo: parsedURL.name
                                });
                            setCheckedPropertyLicense(response.data.license.name);
                        }
                        catch (error) {
                            setCheckedPropertyLicense('');
                        }
                    };
                    getRepoLicense(parsedURL);
                    if(checkedPropertyLicense != ""){
                        licenseScore[propertyValue] = 100;
                        license.push(<Tippy content={
                            <>
                                The given url: {propertyValue} has a {checkedPropertyLicense}
                            </>
                        }><Icon icon={faCheck} className="mt-2 text-success" /></Tippy>);
                    }
                    else{
                            licenseScore[propertyValue] = 0;
                            license.push(<Tippy content={
                                <>
                                    The license of the given url: {propertyValue} cannot be retrived
                                </>
                            }><Icon icon={faXmark} className="mt-2 text-danger" /></Tippy>);
                    }
                }
                else{
                        licenseScore[propertyValue] = 100;
                        license.push(<Tippy content={
                                <>
                                    The license of the given url cannot be checked. For now we check only license for Github repos
                                </>
                        }><Icon icon={faCheck} className="mt-2 text-success" /></Tippy>);
                }
            }
            else{
                    licenseScore[propertyValue] = 100;
                    license.push(<Tippy content={
                        <>
                            The property type : {propertyType} is not a valid url, so it is inapplicable for this check
                        </>
                    }><Icon icon={faMinus}  style={{color: '#D4D4D4', fontWeight: 'bolder', fontSize: '1.5em'}} /></Tippy>);
            }
        }
        else{
                licenseScore[propertyValue] = 0;
                license.push(<Tippy content="The property has to have at least one value"><Icon icon={faTimes} className="mt-2 text-danger" /></Tippy>);
        }
        return [license,licenseScore];
    }

    const reproducibilityTableLeftColumn = [];
    const finalAccessibilityColumnScore = [];
    const finalAvailabilityColumnScore = [];
    const finalLinkabilityColumnScore = [];
    const finalLicenseColumnScore = [];
    if(requiredPropertiesIDsForReproducibility.length > 0) {
        let itemValues= {};
        Object.entries(requiredPropertiesIDsForReproducibility).map((key, index) => {
            let propertyValue = hasPropertyValue(state, selectedContribution, key[1]);
            (propertyValue[key[1]])? itemValues = propertyValue[key[1]] : itemValues= {};
            var urlDomain = /:\/\/(.[^/]+)/;
            Object.entries(itemValues).map((propertyValueKey, propertyValueIndex) => {
                const propertyValue = itemValues[propertyValueIndex][0];
                const propertyType = itemValues[propertyValueIndex][1];
                const resourceId = itemValues[propertyValueIndex][3];
                const accessibilityData = checkAccessibility(propertyValue,propertyType,accessibilityScore);
                const availabilityData = checkAvailability(propertyValue,availabilityScore);
                const linkabilityData = checkLinkability(propertyValue,propertyType,resourceId , linkabilityScore, key[1]);
                const licenseData = checkLicense(propertyValue,propertyType, licenseScore);
                const totalPropertyScore = (accessibilityData[1][propertyValue] +
                                         availabilityData[1][propertyValue] +
                                         linkabilityData[1][propertyValue] +
                                         licenseData[1][propertyValue]) / 4;

                if(propertyValueIndex == 0){
                    finalAvailabilityColumnScore.push(availabilityData[1][propertyValue]);
                    finalAccessibilityColumnScore.push(accessibilityData[1][propertyValue])
                    finalLinkabilityColumnScore.push(linkabilityData[1][propertyValue])
                    finalLicenseColumnScore.push(licenseData[1][propertyValue])
                    reproducibilityTableLeftColumn.push(
                        <tr>
                            <td rowSpan={itemValues.length}>{key[1]}</td>
                            <td>{(propertyValue.startsWith("http")===true)? propertyValue.match(urlDomain)[1]:propertyValue}</td>
                            <td style={{textAlign: 'center' }}>{availabilityData[0]}</td>
                            <td style={{textAlign: 'center' }}>{accessibilityData[0]}</td>
                            <td style={{textAlign: 'center' }}>{linkabilityData[0]}</td>
                            <td style={{textAlign: 'center' }}>{licenseData[0]}</td>
                            <td style={{fontWeight: 'bold' }}>{totalPropertyScore}%</td>
                        </tr>
                    );
                } 
                else{
                    reproducibilityTableLeftColumn.push(
                        <tr>
                            <td>{(propertyValue.startsWith("http")===true)? propertyValue.match(urlDomain)[1]:propertyValue}</td>
                            <td style={{textAlign: 'center' }}>{availabilityData[0]}</td>
                            <td style={{textAlign: 'center' }}>{accessibilityData[0]}</td>
                            <td style={{textAlign: 'center' }}>{linkabilityData[0]}</td>
                            <td style={{textAlign: 'center' }}>{licenseData[0]}</td>
                            <td style={{fontWeight: 'bold' }}>{totalPropertyScore}%</td>
                        </tr>
                    );
                } 
            }); 
        });
    }

    const calculateColumnAverage = (ColumnName) => {
        return ColumnName.reduce((total, current) => total + current, 0) / ColumnName.length
    }

    const ReproducibilityTable = SortableContainer(() => {
        if(isReproducibilityTemplateUsed.includes(true)) {                   
            return (
            <>
                    <Table bordered hover className="m-0">
                        <thead>
                            <tr>
                                <td key="1" style={{ width: '10%', fontSize: '16px' }}>
                                    <span style={{fontWeight: 'bold'}}>Icon</span> 
                                </td>
                                <td key="2" style={{ width: '80%', fontSize: '16px' }}>
                                    <span style={{fontWeight: 'bold' }}>Meaning</span> 
                                </td>
                                <td key="3" style={{ width: '10%', fontSize: '16px' }}>
                                    <span style={{fontWeight: 'bold' }}>Score</span>
                                </td>
                            </tr>
                            <tr>
                                <td key="1" style={{fontSize: '14px', textAlign: 'center'}}>
                                    <Icon icon={faCheck} className="text-success" />
                                </td>
                                <td key="2" style={{fontSize: '16px' }}>
                                    The needed data is valid
                                </td>
                                <td key="3" style={{ fontSize: '16px' }}>
                                    100%
                                </td>
                            </tr>
                            <tr>
                                <td key="1" style={{fontSize: '14px', textAlign: 'center'}}>
                                    <Icon icon={faMinus} style={{color: '#D4D4D4', fontWeight: 'bolder', fontSize: '1.5em'}} />
                                </td>
                                <td key="2" style={{ fontSize: '16px' }}>
                                    The needed data is inapplicable
                                </td>
                                <td key="3" style={{ fontSize: '16px' }}>
                                    100%
                                </td>
                            </tr>
                            <tr>
                                <td key="1" style={{fontSize: '14px', textAlign: 'center'}}>
                                    <Icon icon={faTimes} className="text-danger" />
                                </td>
                                <td key="2" style={{ fontSize: '16px' }}>
                                    The needed data is not valid
                                </td>
                                <td key="3" style={{fontSize: '16px' }}>
                                    0%
                                </td>
                            </tr>
                        </thead>
                    </Table>
                    <br />
                    <TableContainerStyled>
                        <Table bordered hover className="m-0">
                            <thead>
                                <tr>
                                    <td key="1" style={{ width: '20%', fontWeight: 'bold' }}>
                                        Property Name
                                    </td>
                                    <td key="2" style={{ width: '20%', fontWeight: 'bold' }}>
                                        Property Value
                                    </td>
                                    <td key="3" style={{ width: '19%', fontWeight: 'bold' }}>
                                        Availability <Tippy content="The availability means that the given resource has at least a one value"><Icon icon={faQuestionCircle} /></Tippy>
                                    </td>
                                    <td key="4" style={{ width: '19%', fontWeight: 'bold' }}>
                                        Accessibility<Tippy content="The accessibility means that if the given resource of type URL, then the URL should be reachable"><Icon icon={faQuestionCircle} /></Tippy>
                                    </td>
                                    <td key="5" style={{ width: '17%', fontWeight: 'bold' }}>
                                        Linkability<Tippy content="The linkability means that the given resource is linked with an external ontology"><Icon icon={faQuestionCircle} /></Tippy>
                                    </td>
                                    <td key="6" style={{ width: '17%', fontWeight: 'bold' }}>
                                        Licence<Tippy content="The license means that if the given resource is of type URL (eg.,gitHub), then it should have a valid license"><Icon icon={faQuestionCircle} /></Tippy>
                                    </td>
                                    <td key="7" style={{ width: '8%', fontWeight: 'bold' }}>
                                        Score
                                    </td>
                                </tr>
                            </thead>
                            <tbody>
                                {reproducibilityTableLeftColumn}
                                <tr>
                                    <td key="1" colSpan={2} style={{ width: '15%', fontWeight: 'bold', textAlign: 'center' }}>Final Score</td>
                                    <td key="2" style={{ width: '15%', fontWeight: 'bold', textAlign: 'center' }}>
                                        {calculateColumnAverage(finalAvailabilityColumnScore)}%
                                    </td>
                                    <td key="3" style={{ width: '15%', fontWeight: 'bold', textAlign: 'center' }}>
                                        {calculateColumnAverage(finalAccessibilityColumnScore)}%
                                    </td>
                                    <td key="4" style={{ width: '15%', fontWeight: 'bold', textAlign: 'center' }}>
                                        {calculateColumnAverage(finalLinkabilityColumnScore)}%
                                    </td>
                                    <td key="5" style={{ width: '15%', fontWeight: 'bold', textAlign: 'center' }}>
                                        {calculateColumnAverage(finalLicenseColumnScore)}%
                                    </td>
                                    <td key="6" style={{ width: '10%', fontWeight: 'bold', textAlign: 'center' }}></td>
                                </tr>
                            </tbody>
                        </Table>
                    </TableContainerStyled>
                    </>
            );
        }
        else{
            return (
                <>
                    <Alert color="danger">
                            At least you need to use one of the reproducibility templates. A reproducibility template, is a template that starts with the key word "Reproducible"
                    </Alert>
                </>
            );     
        }  
    });
      return (
          <div>
            <Modal isOpen={props.showReproducePaperModalDialog} toggle={props.toggleReproducePaperModalDialog} size="lg">
              <ModalHeader toggle={props.toggleReproducePaperModalDialog}>Reproducibility Score</ModalHeader>
              <ModalBody>
                  <div>
                      <Container>
                          <Row>
                              <Col md="12">
                                <StyledContributionTabs>
                              <Tabs
                                    renderTabBar={renderTabBar}
                                    moreIcon={<Icon size="lg" icon={faAngleDown} />}
                                    activeKey={selectedContribution}
                                    onChange={onTabChange}
                                    destroyInactiveTabPane={true}
                                >
                            {contributions?.map(contribution => {
                                return (
                                    <TabPane
                                        tab={
                                            <ContributionTab
                                                isSelected={contribution.id === selectedContribution}
                                                contribution={contribution}
                                                selectedContributionId={selectedContribution}
                                                key={contribution.id}
                                                handleChangeContributionLabel={() => {}}
                                                enableEdit={false}
                                                canDelete={false}
                                                toggleDeleteContribution={() => {}}
                                            />
                                        }
                                        key={contribution.id}
                                    >
                                        <div className="contributionData">
                                        <ReproducibilityTable />
                                        </div>
                                    </TabPane>
                                );
                            })}
                        </Tabs>  
                        </StyledContributionTabs> 
                              </Col>
                              
                          </Row>
                      </Container>
                  </div>
              </ModalBody>
          </Modal>
          </div>
      );
    }
    else{ // important to avoid errors at the first load time
      return (
          <div>
            loading...
          </div>
      );
    }
};

ReproducePaperModal.propTypes = {
    showReproducePaperModalDialog: PropTypes.bool.isRequired
};

export default ReproducePaperModal;

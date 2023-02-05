import styled from 'styled-components';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faAngleDown, faQuestionCircle , faCheck, faTimes,faNotEqual, faInfo, faXmark } from '@fortawesome/free-solid-svg-icons';
import { SortableContainer } from 'react-sortable-hoc';
import ContentLoader from 'react-content-loader';
import Tabs, { TabPane } from 'rc-tabs';
import { useParams } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Alert, Col, Container, FormGroup, Row } from 'reactstrap';
import { Modal, ModalHeader, ModalBody, Table } from 'reactstrap';
import { useSelector } from 'react-redux';
import Tippy from '@tippyjs/react';
import AddContributionButton from 'components/ContributionTabs/AddContributionButton';
import ProgressBar from 'react-bootstrap/ProgressBar';
import ContributionTab from 'components/ContributionTabs/ContributionTab';
//import { StyledHorizontalContributionsList, StyledHorizontalContribution, AddContribution } from 'components/AddPaper/Contributions/styled';
import { 
            getTemplateRequiredPropertiesIDsForReproducibilitysByResourceID, 
            hasPropertyValue, 
            getTemplateIDsByResourceID,
            getPropertyIdByByResourceAndPredicateId,
            contributionProperties,
       } from 'slices/statementBrowserSlice';
import { ar } from 'faker/lib/locales';
import { boolean } from 'joi';
import { StyledContributionTabs, GlobalStyle } from 'components/ContributionTabs/styled';
import { selectContribution } from 'slices/addPaperSlice';
import { tree } from 'd3';

const ReproducePaperModal = (props) => {
  const { resourceId, contributionId } = useParams();
  const state = useSelector(state => state);
  const contributions = state.viewPaper.contributions;
  console.log(state.statementBrowser.properties.byId)
  const templates = state.statementBrowser.templates;
  const isLoading = state.contributionEditor.isLoading;
  const [selectedContribution, setSelectedContribution] = useState(contributionId);
  console.log(selectedContribution)
  const requiredPropertiesIDsForReproducibility = getTemplateRequiredPropertiesIDsForReproducibilitysByResourceID(state,selectedContribution);
  console.log(requiredPropertiesIDsForReproducibility)
  const contributionPropertiesList = contributionProperties(state, selectedContribution);
  console.log(contributionPropertiesList)
  console.log(resourceId)
  let availabilityScore = [];
  let accessibilityScore = [];
  let linkabilityScore = [];
  let licenseScore = [];
  const [isLoadingContributionFailed, setLoadingContributionFailed] = useState(false);
  const [urlStatus, seturlStatus] = useState(false);
  const [licenseStatus, setLicenseStatus] = useState(false);
  const [checkedPropertyValue,setCheckedPropertyValue]=useState('https://gitlab.com/TIBHannover/orkg/orkg-frontend');
  useEffect (() => {
    const isAvailable = () => {
            fetch(checkedPropertyValue)
            .then(response => {
                (response.status == 200) ? seturlStatus(true) : seturlStatus(false);
            })
            .catch(error =>  {
                seturlStatus(false)
            });
        }
        isAvailable();
  }, [urlStatus,checkedPropertyValue]);

  useEffect (() => {
    const isLicensed = () => {
            
        }
        isLicensed();
  }, [licenseStatus,checkedPropertyValue]);
    
  useEffect(() => {
      if (contributions?.length && (selectedContribution !== contributionId || !contributionId)) {
          try {
              // apply selected contribution
              if (
                  contributionId &&
                  !contributions.some(el => {
                      return el.id === contributionId;
                  })
              ) {
                  throw new Error('Contribution not found');
              }
              const selected =
                  contributionId &&
                  contributions.some(el => {
                      return el.id === contributionId;
                  })
                      ? contributionId
                      : contributions[0].id;
              setSelectedContribution(selected);
          } catch (error) {
              console.log(error);
              setLoadingContributionFailed(true);
          }
      }
  }, [contributionId, contributions, selectedContribution]);

  let sendUrl = (propertyValue) => {
    console.log(propertyValue);
    if(propertyValue.startsWith("http")){
        setCheckedPropertyValue(propertyValue);
    }
  }
  const templateIds = getTemplateIDsByResourceID(state, contributionId ? contributionId : state.statementBrowser.selectedResource);
  console.log(templateIds);
  
  const onTabChange = key => {
    handleSelectContribution(key);
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
                console.log(key[1].label);
                if(templateName!="" && typeof templateName === "string") {
                    isReproducibilityTemplateUsed[value] = templateName.startsWith("Reproducible") 
                    console.log(isReproducibilityTemplateUsed[value],value, key,templateName.startsWith("Reproducible"));
                }
            }
         });
      }
      
    /*let areReproducibilityTemplateRequiredPropertiesUsed = [];
     if(Object.keys(templates).length > 0 ) {
         let i = 0;
          Object.entries(templates).map((key, value) => {
            if(Object.keys(templates).length > 0 ) {
                const templateName = key[1].label
                if(templateName!="" && typeof templateName === "string") {
                    if(templateName.indexOf("Reproducible") == 0){
                        //console.log(key[1].components,templateName);
                        console.log(typeof key[1].components);
                        let requiredPropertiesObject = key[1].components.filter(function (prop)
                        {
                            return prop.requiredProperty === true ;
                        });
                        console.log(Object.entries(requiredPropertiesObject).map((key, value) => {return key[1]["property"]["id"]}));
                        areReproducibilityTemplateRequiredPropertiesUsed[i] = doesContributionHasRequiredProperties(state, selectedContribution, Object.entries(requiredPropertiesObject).map((key, value) => {return key[1]["property"]["id"]}))
                        console.log(areReproducibilityTemplateRequiredPropertiesUsed);
                    }
                }
            }
            i++;
         });
      }
      console.log(areReproducibilityTemplateRequiredPropertiesUsed);*/
      //const doesContributionHasRequiredProperty =  (propertyId) => {
        
      //};

    /*if(Object.keys(requiredPropertiesIDsForReproducibility).length > 0 ) {
        Object.entries(requiredPropertiesIDsForReproducibility).map((key, index) => {
            let propertyValue = hasPropertyValue(state, contributionId ? contributionId : state.statementBrowser.selectedResource, key[1]);
            console.log(propertyValue);
        });
    }
    
    const propertiesValues = [];
    Object.entries(requiredPropertiesIDsForReproducibility).map((key, index) => {
        let propertyValue = hasPropertyValue(state, contributionId ? contributionId : state.statementBrowser.selectedResource, key[1]);
        if(propertyValue!= ""){
            propertiesValues.push(<ul><li>{}</li></ul>)   
        }
        else{
            propertiesValues.push(<span>All are set</span>)
        }
    });*/
    
    let getColumnScore = (columnName) => {
        let nodes= document.body.getElementsByTagName('*'),
        list= nodes.length, columnValues= [], temp, node;
        while(list){
            temp= nodes[--list].id || '';
            if(temp.indexOf(columnName)== 0) {
                node = document.getElementById(temp);
                console.log(node.innerHTML);
                //if(typeof node.innerHTML!==undefined){
                    //if (!isNaN(parseInt(node.innerHTML))){
                        //htmlContent += parseInt(node.innerHTML);
                        columnValues.push(parseInt(node.innerHTML));
                        console.log(parseInt(node.innerHTML));
                    //}
                //}
            }
        }
        console.log(columnValues);
        return columnValues.reduce(function(acc, val) { return acc + val; }, 0)/columnValues.length;
    }

    let getScoreByProperty = (propertyValue) => {
        let accessibilityScore = [];
        return accessibilityScore.push(score);
    }

    let checkAccessibility = (propertyValue, propertyType,accessibilityScore) => {
        const accessibility = [];
        console.log(propertyValue);
        console.log(propertyType);
        if(propertyValue!=""){
            if(propertyType=="literal" && propertyValue.startsWith("http")){
                //sendUrl(propertyValue);
               if(urlStatus == true){
                accessibilityScore[propertyValue] = 100;
                accessibility.push(<Tippy content={
                    <>
                        The given url: {checkedPropertyValue} is reachable {urlStatus}
                    </>
                }><Icon icon={faCheck} className="mt-3 me-3 text-success" /></Tippy>);
               }
               else{
                accessibility.push(<Tippy content={
                    <>
                        The given url: {checkedPropertyValue} is unreachable {urlStatus}
                    </>
                }><Icon icon={faXmark} className="mt-3 me-3 text-danger" /></Tippy>);
               }
            }
            else{
                    accessibilityScore[propertyValue] = 100;
                    accessibility.push(<Tippy content={
                        <>
                            The property type : {propertyType} is not a valid url, so it is inapplicable for this check
                        </>
                    }><Icon icon={faNotEqual}  style={{color: '#D4D4D4', fontWeight: 'bolder', fontSize: '1.5em'}} /></Tippy>);
            }
        }
        else{
                accessibilityScore[propertyValue] = 0;
                accessibility.push(<Tippy content="The property has to have at least one value"><Icon icon={faTimes} className="mt-3 me-3 text-danger" /></Tippy>);
        }
        console.log([accessibility,accessibilityScore]);
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
            }><Icon icon={faCheck} className="mt-3 me-3 text-success" /></Tippy>);
        }
        else{
                availabilityScore[propertyValue] = 0;
                availability.push(<Tippy content="The property has to have at least one value"><Icon icon={faTimes} className="mt-3 me-3 text-danger" /></Tippy>);
        }
        console.log(availabilityScore)
        return [availability,availabilityScore];
    }

    let checkLinkability = (propertyValue, propertyType, resourceId, linkabilityScore, propertyName) => {
        const linkability = [];
        console.log(propertyType, resourceId);
        if(propertyType == "resource"){
            let resources = state.statementBrowser.resources;
            let sameAsValueId = getPropertyIdByByResourceAndPredicateId(state, resourceId, 'SAME_AS');
            console.log(sameAsValueId);
            if(sameAsValueId){
                console.log(sameAsValueId);  //45102e49-b5e4-7a1d-3dda-71aae529b053
                let valueID = state.statementBrowser.properties.byId[sameAsValueId].valueIds;
                if(valueID==''){
                    linkabilityScore[propertyValue] = 0;
                    linkability.push(<Tippy content={
                        <>
                            The property is not of type resource, and cannot be linked with other resources
                        </>
                    }><Icon icon={faXmark} className="mt-3 me-3 text-danger" /></Tippy>);
                }
                else{
                    Object.entries(resources.byId).map((key, value) => {
                        if(key[1].valueId == valueID){
                            linkabilityScore[propertyValue] = 100;
                            console.log(requiredPropertiesIDsForReproducibility, value);
                            linkability.push(<Tippy content={
                                <>
                                    The resource {propertyName} is linked with the external ontology {key[1].label}
                                </>
                            }><Icon icon={faCheck} className="mt-3 me-3 text-success" /></Tippy>);
                        }
                    });    
                }
                console.log(resources);
            }
            else{
                    linkabilityScore[propertyValue] = 0;    
                    linkability.push(<Tippy content={
                        <>
                            The resource {propertyValue} is not linked to any external ontolgies
                        </>
                    }><Icon icon={faXmark} className="mt-3 me-3 text-danger" /></Tippy>);
            }
            console.log(propertyValue);  // 590861b9-9fc6-e069-2051-8b5a551eed5b
            console.log(resourceId);
        }
        else{   
                linkabilityScore[propertyValue] = 100;
                linkability.push(<Tippy content={
                    <>
                        The property is not of type resource, so it is inapplicable for this check
                    </>
                }><Icon icon={faNotEqual}  style={{color: '#D4D4D4', fontWeight: 'bolder', fontSize: '1.5em'}} /></Tippy>);
        }
        return [linkability,linkabilityScore];
    }

    let checkLicense  = (propertyValue, propertyType ,licenseScore) => {
        const license = [];
        console.log(propertyValue);
        console.log(propertyType);
        if(propertyValue!=""){
            if(propertyType=="literal" && propertyValue.startsWith("http")){
                //sendUrl(propertyValue);
               if(urlStatus == true){
                    licenseScore[propertyValue] = 100;
                    license.push(<Tippy content={
                        <>
                            The given url: {checkedPropertyValue} has a valid license
                        </>
                    }><Icon icon={faCheck} className="mt-3 me-3 text-success" /></Tippy>);
               }
               else{
                    licenseScore[propertyValue] = 0;
                    license.push(<Tippy content={
                        <>
                            The given url: {checkedPropertyValue} is unreachable {urlStatus}
                        </>
                    }><Icon icon={faXmark} className="mt-3 me-3 text-danger" /></Tippy>);
               }
            }
            else{
                    licenseScore[propertyValue] = 100;
                    license.push(<Tippy content={
                        <>
                            The property type : {propertyType} is not a valid url, so it is inapplicable for this check
                        </>
                    }><Icon icon={faNotEqual}  style={{color: '#D4D4D4', fontWeight: 'bolder', fontSize: '1.5em'}} /></Tippy>);
            }
        }
        else{
                licenseScore[propertyValue] = 0;
                license.push(<Tippy content="The property has to have at least one value"><Icon icon={faTimes} className="mt-3 me-3 text-danger" /></Tippy>);
        }
        console.log(license);
        return [license,licenseScore];
    }

    
    const reproducibilityTableLeftColumn = [];
    if(requiredPropertiesIDsForReproducibility.length > 0) {
        let itemValues= {};
        Object.entries(requiredPropertiesIDsForReproducibility).map((key, index) => {
            let propertyValue = hasPropertyValue(state, contributionId ? contributionId : state.statementBrowser.selectedResource, key[1]);
            (propertyValue[key[1]])? itemValues = propertyValue[key[1]] : itemValues= {};
            console.log(itemValues, key[1]);
            var urlDomain = /:\/\/(.[^/]+)/;
            Object.entries(itemValues).map((propertyValueKey, propertyValueIndex) => {
                console.log(propertyValueKey, propertyValueIndex);
                let propertyValue = itemValues[propertyValueIndex][0];
                let propertyType = itemValues[propertyValueIndex][1];
                let resourceId = itemValues[propertyValueIndex][3];
                let accessibilityData = checkAccessibility(propertyValue,propertyType,accessibilityScore);
                let availabilityData = checkAvailability(propertyValue,availabilityScore);
                let linkabilityData = checkLinkability(propertyValue,propertyType,resourceId , linkabilityScore, key[1]);
                let licenseData = checkLicense(propertyValue,propertyType, licenseScore);
                let totalPropertyScore = (accessibilityData[1][propertyValue] +
                                         availabilityData[1][propertyValue] +
                                         linkabilityData[1][propertyValue] +
                                         licenseData[1][propertyValue]) / 4;

                if(propertyValueIndex == 0){
                    reproducibilityTableLeftColumn.push(
                        <tr>
                            <td rowSpan={itemValues.length}>{key[1]}</td>
                            <td>{(propertyValue.startsWith("http")===true)? propertyValue.match(urlDomain)[1]:propertyValue}</td>
                            <td style={{textAlign: 'center' }}>{availabilityData[0]}<div style={{display : "none"}} id={"availabilityScore" + propertyValueIndex}>{availabilityData[1][propertyValue]}</div></td>
                            <td style={{textAlign: 'center' }}>{accessibilityData[0]}<div style={{display : "none"}} id={"accessibilityScore" + propertyValueIndex}>{accessibilityData[1][propertyValue]}</div></td>
                            <td style={{textAlign: 'center' }}>{linkabilityData[0]}<div style={{display : "none"}} id={"linkabilityScore" + propertyValueIndex}>{linkabilityData[1][propertyValue]}</div></td>
                            <td style={{textAlign: 'center' }}>{licenseData[0]}<div style={{display : "none"}} id={"licenseScore" + propertyValueIndex}>{licenseData[1][propertyValue]}</div></td>
                            <td style={{fontWeight: 'bold' }}>{totalPropertyScore}%</td>
                        </tr>
                    );
                } 
                else{
                    reproducibilityTableLeftColumn.push(
                        <tr>
                            <td>{(propertyValue.startsWith("http")===true)? propertyValue.match(urlDomain)[1]:propertyValue}</td>
                            <td style={{textAlign: 'center' }}>{availabilityData[0]}<div style={{display : "none"}} id={"availabilityScore" + propertyValueIndex}>{availabilityData[1][propertyValue]}</div></td>
                            <td style={{textAlign: 'center' }}>{accessibilityData[0]}<div style={{display : "none"}} id={"accessibilityScore" + propertyValueIndex}>{accessibilityData[1][propertyValue]}</div></td>
                            <td style={{textAlign: 'center' }}>{linkabilityData[0]}<div style={{display : "none"}} id={"linkabilityScore" + propertyValueIndex}>{linkabilityData[1][propertyValue]}</div></td>
                            <td style={{textAlign: 'center' }}>{licenseData[0]}<div style={{display : "none"}} id={"licenseScore" + propertyValueIndex}>{licenseData[1][propertyValue]}</div></td>
                            <td style={{fontWeight: 'bold' }}>{totalPropertyScore}%</td>
                        </tr>
                    );
                }   
                
            });   
        });                  
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
                                    <Icon icon={faNotEqual} style={{color: '#D4D4D4', fontWeight: 'bolder', fontSize: '1.5em'}} />
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
                                    <td key="1" style={{ width: '20%', fontWeight: 'bold' }}>
                                        Property Value
                                    </td>
                                    <td key="2" style={{ width: '19%', fontWeight: 'bold' }}>
                                        Availability <Tippy content="The availability means that the given resource has at least a one value"><Icon icon={faQuestionCircle} /></Tippy>
                                    </td>
                                    <td key="3" style={{ width: '19%', fontWeight: 'bold' }}>
                                        Accessibility<Tippy content="The accessibility means that if the given resource of type URL, then the URL should be reachable"><Icon icon={faQuestionCircle} /></Tippy>
                                    </td>
                                    <td key="4" style={{ width: '17%', fontWeight: 'bold' }}>
                                        Linkability<Tippy content="The linkability means that the given resource is linked with an external ontology"><Icon icon={faQuestionCircle} /></Tippy>
                                    </td>
                                    <td key="5" style={{ width: '17%', fontWeight: 'bold' }}>
                                        Licence<Tippy content="The license means that if the given resource is of type URL (eg.,gitHub), then it should have a valid license"><Icon icon={faQuestionCircle} /></Tippy>
                                    </td>
                                    <td key="6" style={{ width: '8%', fontWeight: 'bold' }}>
                                        Score
                                    </td>
                                </tr>
                            </thead>
                            <tbody>
                                {reproducibilityTableLeftColumn}
                                <tr>
                                    <td key="1" colSpan={2} style={{ width: '15%', fontWeight: 'bold', textAlign: 'center' }}>Final Score</td>
                                    <td key="2" style={{ width: '15%', fontWeight: 'bold', textAlign: 'center' }}>
                                        100%
                                    </td>
                                    <td key="3" style={{ width: '15%', fontWeight: 'bold', textAlign: 'center' }}>
                                        100%
                                    </td>
                                    <td key="4" style={{ width: '15%', fontWeight: 'bold', textAlign: 'center' }}>
                                        100%
                                    </td>
                                    <td key="5" style={{ width: '15%', fontWeight: 'bold', textAlign: 'center' }}>
                                        100%
                                    </td>
                                    <td key="6" style={{ width: '10%', fontWeight: 'bold', textAlign: 'center' }}>
                                        
                                    </td>
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
              <ModalHeader toggle={props.toggleReproducePaperModalDialog}>Reproducibility Report</ModalHeader>
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
                                                canDelete={contributions.length !== 1}
                                                contribution={contribution}
                                                key={contribution.id}
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

          </div>
      );
    }
};

ReproducePaperModal.propTypes = {
    showReproducePaperModalDialog: PropTypes.bool.isRequired
};

export default ReproducePaperModal;

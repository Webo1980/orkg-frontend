import re 
import asyncio
import aiohttp
import pandas as pd
import time
import nam_evaluation
from thefuzz import fuzz
from rest_request.AsyncRequest import AsyncRequest
from Assessment.DatasetAssessment import DatasetAssessment
from response_obj.provResp.Orkg_set import Orkg_set

df = pd.read_csv("test_input_csv/clean_query.csv")
doiPattern = '10[.][0-9]{4,}(?:[.][0-9]+)*/(?:(?!["&\'<>])\S)+'
# remove rows with no title
df.dropna(subset=["title"], inplace=True)
df.dropna(subset=["DOI"], inplace=True)
# list with unique titles
# titles = df["title"].unique()
dois = df["DOI"].unique()
# print("total num of titles: {}".format(len(titles)))

csv_valid_dois = df[df["DOI"].str.match(doiPattern)]
unique_dois = csv_valid_dois["DOI"].unique()


# ORKG-Objekt instanziieren
def makeObj(csv):
    names = csv["name"].values
    row = csv.iloc[0]
    return Orkg_set(row.field_label, row.DOI, row.title, row.id, row.month_number, row.year_number, row.paper_url, row.venue_label, names)

async def makeDOIQuery():
    count = 0
    pd_df = []
    for i in range(0, 200):
        if((i % 80) == 0 and i > 0): 
            print("sleep {}".format(i))
            time.sleep(300)
        tmp_doi = unique_dois[i]
        tmp = csv_valid_dois[csv_valid_dois["DOI"] == tmp_doi]
        start_t = time.time()
        req = AsyncRequest([tmp_doi])
        await req.doiGetMeta()
        print("{}.total:{}".format(i, len(req.results)))
        req.results.append(makeObj(tmp))
        print(req.results)

        assessment = DatasetAssessment(req.results)
        assessment.computeQuality()
        end_time = time.time() - start_t
        semanticscholar = {"provider_name": "Semantic Scholar", "doi": tmp_doi, "response": False, "objectivity": None, "accuracy": None, "understandability": None, "completeness": None, "time": end_time}
        datacite = {"provider_name": "DataCite", "doi": tmp_doi, "response": False, "objectivity": None, "accuracy": None, "understandability": None, "completeness": None, "time": end_time}
        crossref = {"provider_name": "CrossRef", "doi": tmp_doi, "response": False, "objectivity": None, "accuracy": None, "understandability": None, "completeness": None, "time": end_time}
        orkg = {"provider_name": "ORKG", "doi": tmp_doi, "response": False, "objectivity": None, "accuracy": None, "understandability": None, "completeness": None, "time": end_time}
        for a in assessment.quality_result:
            if a[1]["obj_name"] == "CrossRef":
                grade = a[1]["grade"]
                crossref["response"] = True
                crossref["objectivity"] = grade["obj"]
                crossref["accuracy"] = grade["acc"]
                crossref["understandability"] = grade["undst"]
                crossref["completeness"] = grade["cmpl"]
                # grade = a[1]["grade"]
                # crossref.add(grade["obj"], grade["acc"], grade["undst"], grade["cmpl"])
            elif a[1]["obj_name"] == "Semantic Scholar":
                grade = a[1]["grade"]
                semanticscholar["response"] = True
                semanticscholar["objectivity"] = grade["obj"]
                semanticscholar["accuracy"] = grade["acc"]
                semanticscholar["understandability"] = grade["undst"]
                semanticscholar["completeness"] = grade["cmpl"]
                # grade = a[1]["grade"]
                # semanticscholar.add(grade["obj"], grade["acc"], grade["undst"], grade["cmpl"]) 
            elif a[1]["obj_name"] == "DataCite":
                grade = a[1]["grade"]
                datacite["response"] = True
                datacite["objectivity"] = grade["obj"]
                datacite["accuracy"] = grade["acc"]
                datacite["understandability"] = grade["undst"]
                datacite["completeness"] = grade["cmpl"]
                # grade = a[1]["grade"]
                # datacite.add(grade["obj"], grade["acc"], grade["undst"], grade["cmpl"]) 
            else:
                grade = a[1]["grade"]
                orkg["response"] = True
                orkg["objectivity"] = grade["obj"]
                orkg["accuracy"] = grade["acc"]
                orkg["understandability"] = grade["undst"]
                orkg["completeness"] = grade["cmpl"]
                # grade = a[1]["grade"]
                # orkg.add(grade["obj"], grade["acc"], grade["undst"], grade["cmpl"])  
        pd_df.append(semanticscholar)
        pd_df.append(crossref)
        pd_df.append(datacite)
        pd_df.append(orkg)
        
    new_df = pd.DataFrame(pd_df)
    print(new_df)
    new_df.to_csv("test_csv/doi_evalution.csv", sep=",", encoding="utf-8")
    count += 1
    # print("sem:{}\tdatac:{}\tcross:{}\torkg:{}\n".format(semanticscholar.sum() / count, datacite.sum() / count, crossref.sum() / count, orkg.sum() / count))


async def makeTitleQuery():
    titles = (df[df["DOI"].notnull()]).drop_duplicates(subset = ["title"])
    pd_df = []
    for i in range(0, 200): 
        if((i % 80) == 0 and i > 0): 
            print("sleep {}".format(i))
            time.sleep(300)
        r = titles.iloc[i]
        print("{}.doi:{}".format(i, r.DOI))
        tmp = csv_valid_dois[csv_valid_dois["DOI"] == r.DOI]

        start_t = time.time()
        req = AsyncRequest([], r.title)
        await req.titleGetMeta()
        print("{}.total:{}".format(i, len(req.results)))
        req.results.append(makeObj(tmp))
        assessment = DatasetAssessment(req.results)
        assessment.computeQuality()
        end_time = time.time() - start_t
        semanticscholar = {"provider_name": "Semantic Scholar", "query_title": r.title, "result_title": None, "doi": None, "response": False, "objectivity": None, "accuracy": None, "understandability": None, "completeness": None, "time": end_time}
        datacite = {"provider_name": "DataCite", "query_title": r.title, "result_title": None, "doi": None, "response": False, "objectivity": None, "accuracy": None, "understandability": None, "completeness": None, "time": end_time}
        crossref = {"provider_name": "CrossRef", "query_title": r.title, "result_title": None, "doi": None, "response": False, "objectivity": None, "accuracy": None, "understandability": None, "completeness": None, "time": end_time}
        orkg = {"provider_name": "ORKG", "query_title": r.title, "result_title": None, "doi": None, "response": False, "objectivity": None, "accuracy": None, "understandability": None, "completeness": None, "time": end_time}
        for a in assessment.quality_result:
            if a[1]["obj_name"] == "CrossRef":
                grade = a[1]["grade"]
                crossref["response"] = True
                crossref["doi"] = grade["doi"]
                crossref["result_title"] = grade["title"]
                crossref["objectivity"] = grade["obj"]
                crossref["accuracy"] = grade["acc"]
                crossref["understandability"] = grade["undst"]
                crossref["completeness"] = grade["cmpl"]
            elif a[1]["obj_name"] == "Semantic Scholar":
                grade = a[1]["grade"]
                semanticscholar["response"] = True
                semanticscholar["doi"] = grade["doi"]
                semanticscholar["result_title"] = grade["title"]
                semanticscholar["objectivity"] = grade["obj"]
                semanticscholar["accuracy"] = grade["acc"]
                semanticscholar["understandability"] = grade["undst"]
                semanticscholar["completeness"] = grade["cmpl"]
            elif a[1]["obj_name"] == "DataCite":
                grade = a[1]["grade"]
                datacite["response"] = True
                datacite["doi"] = grade["doi"]
                datacite["result_title"] = grade["title"]
                datacite["objectivity"] = grade["obj"]
                datacite["accuracy"] = grade["acc"]
                datacite["understandability"] = grade["undst"]
                datacite["completeness"] = grade["cmpl"]
            else:
                grade = a[1]["grade"]
                orkg["response"] = True
                orkg["doi"] = grade["doi"]
                orkg["result_title"] = grade["title"]
                orkg["objectivity"] = grade["obj"]
                orkg["accuracy"] = grade["acc"]
                orkg["understandability"] = grade["undst"]
                orkg["completeness"] = grade["cmpl"]
        pd_df.append(semanticscholar)
        pd_df.append(crossref)
        pd_df.append(datacite)
        pd_df.append(orkg)
        
    new_df = pd.DataFrame(pd_df)
    print(new_df)
    new_df.to_csv("test_csv/title_evaluation.csv", sep=",", encoding="utf-8")
        
async def testSpeedDOI():
    titles = (df[df["DOI"].notnull()]).drop_duplicates(subset = ["title"])
    temp = []
    async with aiohttp.ClientSession() as session: 
        for i in range(0, 200):
            if (i % 75) == 0 and i > 0: 
                time.sleep(301)
            t = time.time() 
            title = titles.iloc[i]
            await session.get("http://127.0.0.1:8000/search-title/?query={}".format(title.title), ssl=False)
            end_time = time.time()-t
            print("{}title: {}\ttime: {}".format(i, title.title, end_time))
            temp.append({"title": title.title, "time": end_time})
            

    new_df = pd.DataFrame(temp)
    new_df.to_csv("test_csv/time_title.csv", sep=",", encoding="utf-8")



######################################################################## Beschreiben von csv-Dateien #################################################################################
######################################################################################################################################################################################
# beschreibe die csv
# df_eval = pd.read_csv("test_csv/doi_evaluation.csv")
# df_eval["total_quality"] = (df_eval["objectivity"] + df_eval["accuracy"] + df_eval["understandability"] + df_eval["completeness"]) / 4 
# df_eval.to_csv("test_csv/doi_evaluation.csv", index=False) 
# print(df_eval.head())

# asyncio.run(testSpeedDOI())
# asyncio.run(makeTitleQuery())
# asyncio.run(makeDOIQuery())
# assess()
######################################################################################################################################################################################








################# WICHTIG       WICHTIG             WICHTIG         WICHTIG          WICHTIG    #################
#################                       Hier unten sind alle Testwerte                          #################
#################           Bitte ausklammern, wenn man die Testwerte sehen möchte              #################




# print("------------------------------Anzahl Responses Titel------------------------------")
# print("semanticscholar: {}".format(nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "Semantic Scholar")))
# print("crossref: {}".format(nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "CrossRef")))
# print("datacite: {}".format(nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "DataCite")))
# print("orkg: {}".format(nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "ORKG")))

# print("------------------------------Anzahl Responses DOI------------------------------")
# print("semanticscholar: {}".format(nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "Semantic Scholar")))
# print("crossref: {}".format(nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "CrossRef")))
# print("datacite: {}".format(nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "DataCite")))
# print("orkg: {}".format(nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "ORKG")))

# print("------------------------------Qualitäts Durchschnittswerte Titel------------------------------")
# print("Semantic Scholar: {}".format(nam_evaluation.sumProviderQuality("test_csv/title_evaluation.csv", "Semantic Scholar") / nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "Semantic Scholar")))
# print("CrossRef: {}".format(nam_evaluation.sumProviderQuality("test_csv/title_evaluation.csv", "CrossRef") / nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "CrossRef")))
# print("DataCite: {}".format(nam_evaluation.sumProviderQuality("test_csv/title_evaluation.csv", "DataCite") / nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "DataCite")))
# print("ORKG: {}".format(nam_evaluation.sumProviderQuality("test_csv/title_evaluation.csv", "ORKG") / nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "ORKG")))

# print("------------------------------Qualitäts Durchschnittswerte DOI------------------------------")
# print("Semantic Scholar: {}".format(nam_evaluation.sumProviderQuality("test_csv/doi_evaluation.csv", "Semantic Scholar") / nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "Semantic Scholar")))
# print("CrossRef: {}".format(nam_evaluation.sumProviderQuality("test_csv/doi_evaluation.csv", "CrossRef") / nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "CrossRef")))
# print("DataCite: {}".format(nam_evaluation.sumProviderQuality("test_csv/doi_evaluation.csv", "DataCite") / nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "DataCite")))
# print("ORKG: {}".format(nam_evaluation.sumProviderQuality("test_csv/doi_evaluation.csv", "ORKG") / nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "ORKG")))

# print("------------------------------Objectivity Titel------------------------------")
# print("Semantic Scholar: {}".format(nam_evaluation.sumProviderDimension("test_csv/title_evaluation.csv", "objectivity", "Semantic Scholar") / nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "Semantic Scholar")))
# print("CrossRef: {}".format(nam_evaluation.sumProviderDimension("test_csv/title_evaluation.csv", "objectivity", "CrossRef") / nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "CrossRef")))
# print("DataCite: {}".format(nam_evaluation.sumProviderDimension("test_csv/title_evaluation.csv", "objectivity", "DataCite") / nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "DataCite")))
# print("ORKG: {}".format(nam_evaluation.sumProviderDimension("test_csv/title_evaluation.csv", "objectivity", "ORKG") / nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "ORKG")))



# print("------------------------------Completeness Titel------------------------------")
# print("Semantic Scholar: {}".format(nam_evaluation.sumProviderDimension("test_csv/title_evaluation.csv", "completeness", "Semantic Scholar") / nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "Semantic Scholar")))
# print("CrossRef: {}".format(nam_evaluation.sumProviderDimension("test_csv/title_evaluation.csv", "completeness", "CrossRef") / nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "CrossRef")))
# print("DataCite: {}".format(nam_evaluation.sumProviderDimension("test_csv/title_evaluation.csv", "completeness", "DataCite") / nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "DataCite")))
# print("ORKG: {}".format(nam_evaluation.sumProviderDimension("test_csv/title_evaluation.csv", "completeness", "ORKG") / nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "ORKG")))


# print("------------------------------Accuracy Titel------------------------------")
# print("Semantic Scholar: {}".format(nam_evaluation.sumProviderDimension("test_csv/title_evaluation.csv", "accuracy", "Semantic Scholar") / nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "Semantic Scholar")))
# print("CrossRef: {}".format(nam_evaluation.sumProviderDimension("test_csv/title_evaluation.csv", "accuracy", "CrossRef") / nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "CrossRef")))
# print("DataCite: {}".format(nam_evaluation.sumProviderDimension("test_csv/title_evaluation.csv", "accuracy", "DataCite") / nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "DataCite")))
# print("ORKG: {}".format(nam_evaluation.sumProviderDimension("test_csv/title_evaluation.csv", "accuracy", "ORKG") / nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "ORKG")))


# print("------------------------------Understandability Titel------------------------------")
# print("Semantic Scholar: {}".format(nam_evaluation.sumProviderDimension("test_csv/title_evaluation.csv", "understandability", "Semantic Scholar") / nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "Semantic Scholar")))
# print("CrossRef: {}".format(nam_evaluation.sumProviderDimension("test_csv/title_evaluation.csv", "understandability", "CrossRef") / nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "CrossRef")))
# print("DataCite: {}".format(nam_evaluation.sumProviderDimension("test_csv/title_evaluation.csv", "understandability", "DataCite") / nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "DataCite")))
# print("ORKG: {}".format(nam_evaluation.sumProviderDimension("test_csv/title_evaluation.csv", "understandability", "ORKG") / nam_evaluation.countProviderResponses("test_csv/title_evaluation.csv", "provider_name", "ORKG")))



# print("------------------------------Objectivity DOI------------------------------")
# print("Semantic Scholar: {}".format(nam_evaluation.sumProviderDimension("test_csv/doi_evaluation.csv", "objectivity", "Semantic Scholar") / nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "Semantic Scholar")))
# print("CrossRef: {}".format(nam_evaluation.sumProviderDimension("test_csv/doi_evaluation.csv", "objectivity", "CrossRef") / nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "CrossRef")))
# print("DataCite: {}".format(nam_evaluation.sumProviderDimension("test_csv/doi_evaluation.csv", "objectivity", "DataCite") / nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "DataCite")))
# print("ORKG: {}".format(nam_evaluation.sumProviderDimension("test_csv/doi_evaluation.csv", "objectivity", "ORKG") / nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "ORKG")))



# print("------------------------------Completeness DOI------------------------------")
# print("Semantic Scholar: {}".format(nam_evaluation.sumProviderDimension("test_csv/doi_evaluation.csv", "completeness", "Semantic Scholar") / nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "Semantic Scholar")))
# print("CrossRef: {}".format(nam_evaluation.sumProviderDimension("test_csv/doi_evaluation.csv", "completeness", "CrossRef") / nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "CrossRef")))
# print("DataCite: {}".format(nam_evaluation.sumProviderDimension("test_csv/doi_evaluation.csv", "completeness", "DataCite") / nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "DataCite")))
# print("ORKG: {}".format(nam_evaluation.sumProviderDimension("test_csv/doi_evaluation.csv", "completeness", "ORKG") / nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "ORKG")))


# print("------------------------------Accuracy DOI------------------------------")
# print("Semantic Scholar: {}".format(nam_evaluation.sumProviderDimension("test_csv/doi_evaluation.csv", "accuracy", "Semantic Scholar") / nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "Semantic Scholar")))
# print("CrossRef: {}".format(nam_evaluation.sumProviderDimension("test_csv/doi_evaluation.csv", "accuracy", "CrossRef") / nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "CrossRef")))
# print("DataCite: {}".format(nam_evaluation.sumProviderDimension("test_csv/doi_evaluation.csv", "accuracy", "DataCite") / nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "DataCite")))
# print("ORKG: {}".format(nam_evaluation.sumProviderDimension("test_csv/doi_evaluation.csv", "accuracy", "ORKG") / nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "ORKG")))


# print("------------------------------Understandability DOI------------------------------")
# print("Semantic Scholar: {}".format(nam_evaluation.sumProviderDimension("test_csv/doi_evaluation.csv", "understandability", "Semantic Scholar") / nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "Semantic Scholar")))
# print("CrossRef: {}".format(nam_evaluation.sumProviderDimension("test_csv/doi_evaluation.csv", "understandability", "CrossRef") / nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "CrossRef")))
# print("DataCite: {}".format(nam_evaluation.sumProviderDimension("test_csv/doi_evaluation.csv", "understandability", "DataCite") / nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "DataCite")))
# print("ORKG: {}".format(nam_evaluation.sumProviderDimension("test_csv/doi_evaluation.csv", "understandability", "ORKG") / nam_evaluation.countProviderResponses("test_csv/doi_evaluation.csv", "provider_name", "ORKG")))

# print("------------------------------Number Unequal Title Results------------------------------")
# nam_evaluation.numUnequalTitleResults()


# print("------------------------------Mean Time Title------------------------------")
# print("mean-time: {}".format(nam_evaluation.sumColumn("test_csv/time_title.csv", "time") / 200))

# print("------------------------------Mean Time DOI------------------------------")
# print("mean-time: {}".format(nam_evaluation.sumColumn("test_csv/time_doi.csv", "time") / 200))


# nicht mehr auskommentieren außer man möchte die Titel untersuchen, die unterschiedlich von dem der ORKG sind
# nam_evaluation.equalTitleDOI()
import orjson as json
import aiohttp
import asyncio
from thefuzz import fuzz
from configparser import ConfigParser
from queries import dataciteQuery
from response_obj.provResp.DataCiteResponse import DataCiteResponse
from response_obj.provResp.CrossrefResponse import CrossrefResponse
from response_obj.provResp.SemanticScholarResponse import SemanticScholarResponse


class AsyncRequest:

    def __init__(self, dois, queryTitle=None):
        self.DOIS = dois
        self.queryTitle = queryTitle
        self.results = []
        # array of ProviderResponse Objects
        self.rspWithProvidername = []

        self.conf_obj = ConfigParser()
        self.conf_obj.read("config.ini")

    def clearLists(self):
        self.DOIS.clear()
        self.results.clear()

    def get_restTasks(self, session, doiUrl):
        tasks = []

        for doi in self.DOIS:
            tasks.append(session.get(doiUrl.format(doi=doi), ssl=False))

        return tasks

    def get_graphqlTasks(self, session):
        tasks = []
        dataCiteUrl = self.get_dataciteUrl()
        dataCiteEndpoint = self.get_datciteEndpoint()
        for doi in self.DOIS:
            query = dataciteQuery.query.format(doi=dataCiteUrl.format(doi=doi))
            tasks.append(session.post(dataCiteEndpoint, json={
                         'query': query}, ssl=False))
        return tasks

    async def doiGetMeta(self):
        async with aiohttp.ClientSession() as session:
            # tasks to execute asynchronously for each provider
            rest_tasks = self.get_restTasks(session, self.get_semscholarUrl())
            rest_tasks2 = self.get_restTasks(session, self.get_crossrefUrl())
            graphql_tasks = self.get_graphqlTasks(session)
            # deference to get response
            rest_responses = await asyncio.gather(*rest_tasks)
            rest_responses2 = await asyncio.gather(*rest_tasks2)
            graphql_responses = await asyncio.gather(*graphql_tasks)

            [self.results.append(await self.makeSem(rsp))
             for rsp in rest_responses if rsp.status == 200]
            [self.results.append(await self.makeCross(rsp2))
             for rsp2 in rest_responses2 if rsp2.status == 200]
            [self.results.append(await self.makeCite(rsp)) for rsp in graphql_responses if rsp.status == 200 and (await rsp.json())["data"]]

    async def titleGetMeta(self, retry=1):
        async with aiohttp.ClientSession() as session:
            responses = await session.get(self.get_titleSemscholarURL(), ssl=False)
            try:
                data = (json.loads(await responses.read()))["data"]
                ratio = 0
                doi = ""
                title = ""
                for x in data:
                    if fuzz.ratio(x["title"], self.queryTitle) > ratio:
                        try:
                            tmp_doi = x["externalIds"]["DOI"]
                            ratio = fuzz.ratio(x["title"], self.queryTitle)
                            doi = tmp_doi
                            title = x["title"]
                        except:
                            print("field not found")
                if len(doi) > 0:
                    print("doi: {}\ttitle: {}".format(doi, title))
                    self.DOIS.append(doi)
                    await self.doiGetMeta()
            except:
                if(retry > 0):
                    retry -= 1
                    self.titleGetMeta(retry)

    def get_datciteEndpoint(self):
        return self.conf_obj["DATACITE_INFO"]["endpoint"]

    def get_dataciteUrl(self):
        url = self.conf_obj["DATACITE_INFO"]["doi_url"]
        if url[-1] != '/':
            url += '/'
        return url + '{doi}'

    def get_crossrefUrl(self):
        url = self.conf_obj["CROSSREF_INFO"]["endpoint"]
        if url[-1] != '/':
            url += '/'
        return url + '{doi}'

    def get_semscholarUrl(self):
        fields = self.conf_obj["SEMANTIC_SCHOLAR_INFO"]["fields"].split(', ')
        url = self.conf_obj["SEMANTIC_SCHOLAR_INFO"]["endpoint"]
        s = "/?fields=" + ",".join(fields)
        if url[-1] != '/':
            url += '/'
        return url + '{doi}' + s

    def get_titleSemscholarURL(self):
        url = self.conf_obj["SEMANTIC_SCHOLAR_INFO"]["endpoint"]
        if url[-1] != '/':
            url += '/'
        return url + 'search?query=' + self.queryTitle + '&fields=externalIds,title'

    async def makeSem(self, rsp):
        # print("Sem: {}".format(rsp.status))
        return SemanticScholarResponse(json.loads(await rsp.read()))

    async def makeCross(self, rsp):
        # print("Cross: {}".format(rsp.status))
        return CrossrefResponse(json.loads(await rsp.read())["message"])

    async def makeCite(self, rsp):
        # print("cite: {}".format(rsp.status))
        return DataCiteResponse(await rsp.json())

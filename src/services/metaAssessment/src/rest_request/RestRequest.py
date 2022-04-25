import sys
import os
import asyncio
import json
import aiohttp
from configparser import ConfigParser
from response_obj.provResp.DataCiteResponse import DataCiteResponse
from response_obj.provResp.CrossrefResponse import CrossrefResponse
from response_obj.provResp.SemanticScholarResponse import SemanticScholarResponse
from queries import dataciteQuery


class RestRequest:

    def __init__(self, dois):
        self.conn = aiohttp.TCPConnector(
            limit_per_host=3, limit=0, ttl_dns_cache=300)
        self.session = aiohttp.ClientSession(connector=self.conn)
        self.PARALLEL_REQUESTS = 3
        self.results = []
        self.conf_obj = ConfigParser()
        self.conf_obj.read("config.ini")
        self.dcDoiUrls = self.__getDCURLs(
            self.conf_obj["DATACITE_INFO"]["doi_url"], dois)
        self.dcEndpoint = self.conf_obj["DATACITE_INFO"]["endpoint"]
        self.restApiUrls = self.__getRestApiUrls(
            self.conf_obj["SEMANTIC_SCHOLAR_INFO"]["fields"],
            self.conf_obj["SEMANTIC_SCHOLAR_INFO"]["endpoint"],
            self.conf_obj["CROSSREF_INFO"]["endpoint"],
            dois)
        self.datasets = []

    def __getDCURLs(self, dcurl, dois):
        tempURL = dcurl
        if(tempURL[-1] != '/'):
            tempURL += '/'

        res = [tempURL + doi for doi in dois]
        return res

    def __getRestApiUrls(self, fields, smtScholarEndpoint, crossrefEndpoint, dois):
        url1 = smtScholarEndpoint
        url2 = crossrefEndpoint
        if url1[-1] != '/':
            url1 += '/'
        if url2[2] != '/':
            url2 += '/'
        s = "/?fields=" + ",".join(fields.split(', '))
        arr1 = [url1 + doi + s for doi in dois]
        arr2 = [url2 + doi for doi in dois]

        return arr1 + arr2

    async def gather_with_concurrency(self, n, *tasks):
        semaphore = asyncio.Semaphore(n)

        async def sem_task(task):
            async with semaphore:
                return await task

        return await asyncio.gather(*(sem_task(task) for task in tasks))

    async def get_async_requests(self, url):
        async with self.session.get(url=url, ssl=False) as response:
            data = await response.json()
            if response.status == 200:
                if 'crossref' in url:
                    self.results.append(data['message'])
                    obj = CrossrefResponse(data['message'])
                    self.datasets.append(obj)
                # print(
                #     "--------------------------------------INFO--------------------------------------")
                # print(obj.getTitle())
                # [print(author.getFullName()) for author in obj.getAuthors()]
                # print(obj.getURL())
                # print(obj.getPublisher())
                else:
                    self.results.append(data)
                    obj = SemanticScholarResponse(data)
                    self.datasets.append(obj)
                # print(
                #     "--------------------------------------INFO--------------------------------------")
                # print("DOI: " + obj.getDOI())
                # print(obj.getTitle())
                # [print(author.getFullName()) for author in obj.getAuthors()]
                # print(obj.getURL())
                # print(obj.getPublisher())

    async def post_async_graphql(self, gql_doi):
        async with self.session.post(self.dcEndpoint, json={"query": dataciteQuery.query.format(doi=gql_doi)}) as response:
            data = await response.json()
            self.results.append(data)
            if data["data"] != None:
                obj = DataCiteResponse(data)
                self.datasets.append(obj)

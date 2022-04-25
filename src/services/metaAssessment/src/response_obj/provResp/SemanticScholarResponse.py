import json
from .sub_response_obj.Author import Author
from .sub_response_obj.Affiliation import Affiliation
from ..ProviderResponse import ProviderResponse


class SemanticScholarResponse(ProviderResponse):

    def __init__(self, jsonRsp):
        super().__init__(jsonRsp["externalIds"]["DOI"])
        self._response = jsonRsp
        self._title = jsonRsp["title"]
        self._authors = [Author(author, author["name"], self._extractAffiliations(author["affiliations"]))
                         for author in jsonRsp["authors"]]
        self._url = jsonRsp["url"]
        self._publisher = jsonRsp["venue"]

    def getJsonResponse(self):
        return self._response

    def getTitle(self):
        return self._title

    def getAuthors(self):
        return self._authors

    def getAuthorAt(self, index):
        try:
            res = self._authors[index]
            return res
        except IndexError as e:
            print(
                "Acces to list of authors from datacite --> Index {i} is out of range.".format(index))
            print(e)

    def getURL(self):
        return self._url

    def getPublisher(self):
        return self._publisher

    def _extractAffiliations(self, affs):
        res = [Affiliation(name=a["name"]) for a in affs]
        return res

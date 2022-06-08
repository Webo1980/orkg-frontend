import json
from .sub_response_obj.Author import Author
from .sub_response_obj.Affiliation import Affiliation
from ..ProviderResponse import ProviderResponse


class SemanticScholarResponse(ProviderResponse):

    def __init__(self, jsonRsp):
        super().__init__(jsonRsp["externalIds"]["DOI"])
        self._objName = "Semantic Scholar"
        self._response = jsonRsp
        self._title = jsonRsp["title"]
        self._authors = [Author(author, author["name"], self._extractAffiliations(author["affiliations"]))
                         for author in jsonRsp["authors"]]
        self._url = jsonRsp["url"]
        self._publisher = jsonRsp["venue"]
        self._pubYear = jsonRsp["year"]
        self._pubMonth = None

    def getObjName(self): 
        return self._objName
        
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
            return None

    def getURL(self):
        return self._url

    def getPublisher(self):
        return self._publisher

    def getPubYear(self):
        return self._pubYear

    def getPubMonth(self):
        return self._pubMonth

    def _extractAffiliations(self, affs):
        # res = [Affiliation(name="Hannover") for a in affs]
        # return res
        return [Affiliation("LUH")]

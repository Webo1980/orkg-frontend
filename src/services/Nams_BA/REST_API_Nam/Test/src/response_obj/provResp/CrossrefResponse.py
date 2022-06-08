import json
from .sub_response_obj.Author import Author
from .sub_response_obj.Affiliation import Affiliation
from ..ProviderResponse import ProviderResponse


class CrossrefResponse(ProviderResponse):

    def __init__(self, jsonRsp):
        super().__init__(jsonRsp["DOI"])
        self._objName = "CrossRef"
        self._response = jsonRsp
        self._title = jsonRsp["title"][0]
        self._authors = None
        if self.extractAuthors(jsonRsp):
            self._authors = [Author(author, self._extractName(author), self._extractAffiliations(author["affiliation"]))
                             for author in jsonRsp["author"]]
        self._url = self._extractURL(jsonRsp)
        self._publisher = self._extractPublisher(jsonRsp)
        self._pubYear = None
        self._pubMonth = None
        try: 
            pub = jsonRsp["published"]
            self._pubYear = self._extractYear(
                pub["date-parts"])
            self._pubMonth = self._extractMonth(
                pub["date-parts"])
        except: 
            print("no publishing data")

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
        res = [Affiliation(name=a["name"]) for a in affs]
        return res

    def _extractMonth(self, date):
        try:
            res = date[0][1]
            return res
        except:
            print("no month")
            return None

    def _extractYear(self, date):
        try:
            res = date[0][0]
            return res
        except:
            print("no year")
            return None

    def extractAuthors(self, jsonRsp):
        try:
            authors = jsonRsp["author"]
            return authors
        except:
            print("No Author")
            return None

    def _extractName(self, author):
        try:
            s = author["family"]
            try:
                s2 = s + ", " + author["given"]
                return s2
            except:
                return s
        except:
            try:
                s2 = author["given"]
                return s2
            except:
                try: 
                    s2 = author["name"]
                    return s2
                except: 
                    print("no name")
                    return ""
    def _extractGivenName(self, author):
        try:
            s = author["given"]
            return s
        except:
            return ""

    def _extractURL(self, jsonRsp):
        try:
            url = jsonRsp["resource"]["primary"]["URL"]
            return url
        except:
            return None

    def _extractPublisher(self, jsonRsp):
        try:
            p = jsonRsp["publisher"]
            return p
        except:
            return None

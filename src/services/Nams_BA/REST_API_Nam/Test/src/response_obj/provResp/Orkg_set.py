import json
from .sub_response_obj.Author import Author
from .sub_response_obj.Affiliation import Affiliation
from ..ProviderResponse import ProviderResponse


class Orkg_set(ProviderResponse):

    def __init__(self, field_label, doi, title, id, month_number, year_number, paper_url, venue_label, names):
        super().__init__(doi)
        self._objName = "ORKG"
        self._title = title
        self._authors = [Author(None, n, None) for n in names]
        self._url = paper_url
        self._publisher = venue_label
        self._pubYear = int(year_number)
        self._pubMonth = int(month_number) if month_number.isnumeric() else month_number 

    def getObjName(self): 
        return self._objName
        
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


import json


class Author:
    # def __init__(self, json_author, fullname, affiliation_names, affiliation_ids):
    def __init__(self, json_author, fullname, affiliations=None):
        self.__json_author = json_author
        self.__fullName = fullname
        self.__affiliations = affiliations

    def getJson(self):
        return self.__json_author

    def getFullName(self):
        return self.__fullName

    def getAffiliations(self):
        return self.__affiliations

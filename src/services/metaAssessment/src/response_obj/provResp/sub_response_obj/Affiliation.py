import json


class Affiliation:

    def __init__(self, name, ident=None):
        self.__name = name
        self.__ident = ident if ident is not None else None

    def getName(self):
        return self.__name

    def getId(self):
        return self.__ident

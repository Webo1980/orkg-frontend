import json


class ProviderResponse:

    def __init__(self, doi):
        self._doi = doi.lower()

    def getDOI(self):
        return self._doi

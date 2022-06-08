'''
    @param respObjArr is an array consisting of a response from each provider
'''
import asyncio
from datetime import datetime, timezone
import re
from thefuzz import fuzz
from configparser import ConfigParser


class DatasetAssessment:

    def __init__(self, objArr):
        self.rspObjects = objArr
        self.numTotalAttr = len([name for name in dir(
            objArr[0]) if self.isNoMethod(objArr[0], name)])
        self.currdate = datetime.now()
        self.conf_obj = ConfigParser()
        self.conf_obj.read("config.ini")
        self.quality_result = []

    def getQualityResult(self):
        return self.quality_result

    def computeQuality(self, doi=None):
        arr = []
        # if you made a request for multiple DOIs --> pls specify the DOI you want to evaluate
        if doi:
            print("DOI: {}".format(doi))
            arr = [x for x in self.rspObjects if x.getDOI() == doi]
        else:
            arr = self.rspObjects
        lng = len(arr)
        # determine which dataset has a list with the most full written author names
        lngArr = [self.totalLength(rsp.getAuthors())
                  for rsp in arr if rsp.getAuthors()]
        lngArr.sort()
        max_lng = 0
        if len(lngArr) > 0:
            max_length = lngArr[-1]
        for i in range(lng):
            compareObj = arr[i]
            compareToArr = arr[:i] + arr[(i + 1):]

            # calculate metrics and sum their values
            quality_grade = self.computeObjectivity(compareObj, compareToArr) + self.computeAccuracy(
                compareObj) + self.computeUnderstandability(compareObj, max_lng) + self.computeCompleteness(compareObj)
            self.quality_result.append(
                (quality_grade, compareObj.getJsonResponse()))
        self.quality_result.sort(key=lambda tup: tup[0], reverse=True)

    def computeCompleteness(self, rspObj):
        count = 0
        count += len([name for name in dir(rspObj)
                      if self.isNoMethod(rspObj, name) and getattr(rspObj, name) == None])

        total = self.totalNumAttr(rspObj)
        cmpl = (total - count) / total

        return cmpl * float(self.conf_obj["ASSESSMENT_WEIGHTS"]["cmpl"])

    def computeAccuracy(self, rspObj):
        total = 2
        count = 0
        doiPattern = re.compile(
            '10[.][0-9]{4,}(?:[.][0-9]+)*/(?:(?!["&\'<>])\S)+')
        if doiPattern.match(rspObj.getDOI()):
            count += 1
        if isinstance(rspObj.getPubYear(), int) and self.currdate.year > rspObj.getPubYear():
            count += 1
        if rspObj.getPubMonth():
            total += 1
            if isinstance(rspObj.getPubMonth(), int) and rspObj.getPubMonth() in range(1, 13):
                count += 1
        if count > 0:
            return (count / total) * float(self.conf_obj["ASSESSMENT_WEIGHTS"]["acc"])
        return 0

    # return: count/(x*n)
    # - count := in given dataset "cmpObj", count each field in different datasets that are equal to the given field-value
    # - n := number of provider we compare to := 2
    # - x := number of fields (title, author names) we compare in each dataset := 1 + |author names|, where 1 is for title and len(cmpObj.getAuthors) is |author names|
    def computeObjectivity(self, cmpObj, cmpToArr):
        count = 0.0
        if cmpObj.getAuthors():
            for x in cmpToArr:
                if cmpObj.getDOI() == x.getDOI():
                    count += 1.0
                if cmpObj.getPubYear() == x.getPubYear():
                    count += 1.0
                if cmpObj.getTitle() == x.getTitle():
                    count += 1.0
                if x.getAuthors():
                    count += self.countEqualNames(cmpObj.getAuthors(),
                                                  x.getAuthors())
            if count > 0:
                return count / ((len(cmpObj.getAuthors()) + 3.0) * len(cmpToArr)) * float(self.conf_obj["ASSESSMENT_WEIGHTS"]["obj"])
        return 0

    # this metric computes the grade of understandability
    # since we examine the names of authors, the grade of understandability gets increases if:
    # --> a name is written in full
    # --> a name fulfills the name pattern
    def computeUnderstandability(self, rspObj, maxLength):
        authors = rspObj.getAuthors() if rspObj.getAuthors() else []

        matchingName_ratio = self.determineMatchingNamePattern(authors)
        lng_ratio = self.totalLength(
            authors) / maxLength if maxLength > 0 else 0

        # we want to return 1 as value --> if there is more to consider in determining the grad of understanability, we have to increase the denomintor
        return ((matchingName_ratio + lng_ratio) / 2.0) * float(self.conf_obj["ASSESSMENT_WEIGHTS"]["undst"])

    ######################################### HELPER-Functions #########################################

    def totalNumAttr(self, rspObj):
        return len([{"name": name, "type": type(getattr(rspObj, name)).__name__, "value": getattr(rspObj, name)} for name in dir(rspObj) if self.isNoMethod(rspObj, name)])

    def isNoMethod(self, rspObj, name):
        return name[:2] != '__' and name[-2:] != '__' and type(getattr(rspObj, name)).__name__ != 'method'

    def determineMatchingNamePattern(self, authors):
        count = 0
        namePattern = re.compile(
            "^[\w'\-,.]*[^_!¡?÷?¿\/\\+=@#$%ˆ&*(){}|~<>;:[\]]*$")
        for auth in authors:
            if namePattern.match(auth.getFullName()):
                count += 1
        if count > 0:
            return count / len(authors)
        return 0

    def totalLength(self, authors):
        names = ' '.join([auth.getFullName().replace(', ', ' ')
                          for auth in authors])

        return len(names)

    def countEqualNames(self, authors_1, authors_2):
        count = 0
        namePattern = re.compile(
            "^[\w'\-,.]*[^_!¡?÷?¿\/\\+=@#$%ˆ&*(){}|~<>;:[\]]*$")
        lng1 = len(authors_1)
        lng2 = len(authors_2)
        for i in range(lng1):
            name1 = authors_1[i].getFullName()
            if namePattern.match(name1):
                for j in range(lng2):
                    name2 = authors_2[j].getFullName()
                    if(namePattern.match(name2) and self.equalName(name1, name2)):
                        count += 1
                        break
        return count

    # check similarity of name1 and name2
    def equalName(self, name1, name2):
        if fuzz.token_sort_ratio(name1, name2) == 100:
            return True
        nameParts = name1.replace(', ', ' ').split(' ')
        for part in nameParts:
            # if the name parts is not in name2 we check if the alias of part is in name2
            if fuzz.partial_ratio(part, name2) < 100 and fuzz.partial_ratio(self.aliasOf(part), name2) < 100:
                return False
        return True

    def aliasOf(self, namePart):
        if(len(namePart) > 0):
            c = namePart[0]
            if c.isupper():
                return c
        return namePart

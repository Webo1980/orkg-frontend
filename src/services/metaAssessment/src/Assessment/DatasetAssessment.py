'''
    @param respObjArr is an array consisting of a response from each provider
'''
import asyncio


def computeCompleteness(respObjArr):
    count = 0
    res = []
    for rsp in respObjArr:
        count += len([name for name in dir(rsp) if isNoMethod(
            rsp, name) and getattr(rsp, name) == None])

        res.append(
            {"obj": rsp, "totalAttr": totalNumAttr(rsp), "missing": count})
        count = 0

    return res


######################################### HELPER-Functions #########################################
def totalNumAttr(rspObj):
    return len([{"name": name, "type": type(getattr(rspObj, name)).__name__, "value": getattr(rspObj, name)} for name in dir(rspObj) if isNoMethod(rspObj, name)])


def isNoMethod(rsp, name):
    return name[:2] != '__' and name[-2:] != '__' and type(getattr(rsp, name)).__name__ != 'method'

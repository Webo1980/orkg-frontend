from fastapi import FastAPI, HTTPException
from time import time
import asyncio
from rest_request.AsyncRequest import AsyncRequest
from Assessment.DatasetAssessment import DatasetAssessment
import pandas as pd


description = """
    Nams API hilft dir bei der Literaturrecherche, indem es qualitativ hochwertige Metadatensätze einer Publikation zurückliefert. 
"""
app = FastAPI(
    title="Nams API",
    description=description,
    version="0.0.1",
    contact={
        "name": "Nam Dan Nhu"
        "email" "namnhu0@gmail.com"
    }
)
# q = pd.read_csv("query.csv")
# df = pd.DataFrame(q).head(3)
# doiNotNull = df[df["DOI"].notnull()]
# print(doiNotNull["DOI"].values)


@app.get('/search-doi/')
async def doiRequests(doi: str):
    start = time()
    req = AsyncRequest([doi])  # AsyncRequest(doiNotNull["DOI"].values)
    await req.doiGetMeta()
    print("time: ", time() - start)
    if len(req.results) == 0:
        raise HTTPException(status_code=404, detail="Item not found")

    assessment = DatasetAssessment(req.results)
    assessment.computeQuality()
    # assessment.computeQuality(doi)  # ("10.1016/j.trpro.2018.10.057")
    return assessment.quality_result[0][1]


@app.get('/search-title/')
async def queryTitle(query: str):
    req = AsyncRequest([], query)
    print(req.DOIS)
    await req.titleGetMeta()
    if len(req.results) == 0:
        raise HTTPException(status_code=404, detail="Item not found")
    [print(r.getJsonResponse()) for r in req.results]
    assessment = DatasetAssessment(req.results)
    # it's important that the doi is in lower case...since dois in semantic scholar include upper cases
    assessment.computeQuality(req.DOIS[0].lower())
    return assessment.quality_result[0][1]

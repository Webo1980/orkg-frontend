from fastapi import FastAPI
from time import time
import asyncio
from rest_request.RestRequest import RestRequest
from Assessment.DatasetAssessment import computeCompleteness
import pandas as pd


app = FastAPI()
q = pd.read_csv("query.csv")
df = pd.DataFrame(q).head(2)

doiNotNull = df[df["DOI"].notnull()]

print(doiNotNull["DOI"].values)


@app.get('/')
async def doiRequests(doi: str):
    request = RestRequest(doiNotNull["DOI"].values)
    print("DOI URLs: {}".format(doiNotNull["DOI"].values))
    start = time()
    await request.gather_with_concurrency(3, *[request.get_async_requests(url) for url in request.restApiUrls])
    await request.gather_with_concurrency(3, *[request.post_async_graphql(doi) for doi in request.dcDoiUrls])
    print("count: " + str(computeCompleteness(request.datasets)))
    print("time: ", time() - start)
    return request.results

import pandas as pd

def sumProviderQuality(csv_name, provider_name):
    df = pd.read_csv(csv_name)
    temp = df[df["provider_name"] == provider_name]
    return temp["total_quality"].sum()


def countProviderResponses(csv_name, csv_column, value):
    df = pd.read_csv(csv_name)
    temp = df[(df[csv_column] == value) & (df["response"] == True)]
    return len(temp)


def sumProviderDimension(csv_name, csv_column, provider_name):
    df = pd.read_csv(csv_name)
    temp = df[df["provider_name"] == provider_name]
    return temp[csv_column].sum()

def isEqual(rows):
    r = rows.iloc[3]
    lng = len(rows)
    for i in range(0, len(rows)-1): 
        comp = rows.iloc[i]
        if(r.doi == comp.doi):
            return True

def equalTitleDOI():
    result = []
    df_temp = pd.read_csv("test_csv/title_evaluation.csv")
    unique_t = df_temp["query_title"].unique()
    for title in unique_t: 
        temp = df_temp[df_temp["query_title"] == title]
        if not isEqual(temp): 
            result.append({"title": title, "orkg_doi": (temp.iloc[3]).doi})
    print(len(result))
    new_df = pd.DataFrame(result)
    new_df.to_csv("test_csv/title_results_differ.csv", sep=",", encoding="utf-8")

def numUnequalTitleResults():
    result = []
    df_temp = pd.read_csv("test_csv/title_evaluation.csv")
    unique_t = df_temp["query_title"].unique()
    for title in unique_t: 
        temp = df_temp[df_temp["query_title"] == title]
        if not isEqual(temp): 
            result.append(title)
    print("Unequal Title results: {}".format(len(result)))
    print(result)


def sumColumn(csv_name, column):
    df = pd.read_csv(csv_name)
    return df[column].sum()
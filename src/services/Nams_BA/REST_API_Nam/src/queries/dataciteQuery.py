query = '''
{{
  dataPaper(id: "{doi}") {{
    doi
    id
    url
    titles {{
      title
    }}
    creators{{
      affiliation{{
        id
        name
      }}
      familyName
      givenName
      id
      name
      type
    }}
    publisher
    publicationYear
    dates{{
      date
      dateType
    }}
  }}
}}
'''

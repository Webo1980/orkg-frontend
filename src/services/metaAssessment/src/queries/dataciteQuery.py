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


# {{
#   dataPaper(id: "{doi}") {{
#     doi
#     citations{{
#       affiliations{{
#         count
#         id
#         title
#       }}
#       authors{{
#         count
#         id
#         title
#       }}
#     }}
#     creators{{
#       familyName
#       givenName
#       id
#       name
#       type
#     }}
#     titles {{
#       title
#     }}
#     publicationYear
#     publisher
#   }}
# }}

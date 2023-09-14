import os
import habanero
import base64
import pdfkit
import json
import requests
import mimetypes
import datetime
import pandas as pd
from die import die
from bs4 import BeautifulSoup
from werkzeug.utils import secure_filename
from flask import Flask, request, jsonify
from flask_cors import CORS
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor
from SPARQLWrapper import SPARQLWrapper, JSON
from requests.exceptions import RequestException, ConnectTimeout, HTTPError
from transformers import BertTokenizer, BertModel
import torch
from sklearn.metrics.pairwise import cosine_similarity
import pprint
import re

#####################################################################
##################### Config and Global Variables ###################
#####################################################################
X_API_KEY = 'sec_K2IfNgw1D4bgyfGKPCRa0jT6oWlIR9Jq'  # Replace with your actual API key
CHATPDF_API_BASE_URL = 'https://api.chatpdf.com/v1'

CROSSREF_BASE_URL = "https://api.crossref.org/works"

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)

# Set the absolute path for the upload folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'files')
JSON_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'jsons')
#print(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['JSON_FOLDER'] = JSON_FOLDER

@app.route('/')
def home():
    return "Flask server is running!"

def create_session_folder():
    # Get the current timestamp
    current_time = datetime.datetime.now()
    timestamp = current_time.strftime('%Y-%m-%d_%H-%M-%S')

    # Create a folder with the timestamp under the UPLOAD_FOLDER directory
    folder_name = f'folder_{timestamp}'
    folder_path = os.path.join(UPLOAD_FOLDER, folder_name)
    os.makedirs(folder_path)
    return folder_path


def download_pdf_from_url(url, save_directory):
    try:
        response = requests.get(url)
        if response.status_code == 200:
            parsed_url = urlparse(url)
            parsed_url_path = os.path.basename(parsed_url.path)
            #print("parsed_url_path:",parsed_url_path)

            # Get the current timestamp
            current_timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")

            # Append the timestamp to the filename
            filename = f"{parsed_url_path.split('.')[0]}_{current_timestamp}.{parsed_url_path.split('.')[-1]}"
            #print("filename:",filename)

            filename_with_extension = filename + '.pdf'
            #print("filename_with_extension:",filename_with_extension)
            file_path = os.path.join(save_directory, filename_with_extension)
            #print("file_path:",file_path)

            with open(file_path, 'wb') as pdf_file:
                pdf_file.write(response.content)
            return file_path
        else:
            print('Error downloading PDF from URL. Status code:', response.status_code)
            return None
    except Exception as e:
        print('Error downloading PDF:', e)
        return None


@app.route('/api/get_pdf_by_title', methods=['POST'])
def search_pdf_urls_by_title():
    data = request.get_json()
    params = {
        "query.title": data["title"],
        "select": "DOI"
    }

    try:
        response = requests.get(CROSSREF_BASE_URL, params=params)
        data = response.json()

        if response.status_code == 200 and data.get('message', {}).get('items'):
            doi = data['message']['items'][0].get('DOI')
            url = get_pdf_url_from_doi(doi)
            print(url)
            if url is None:
                file  = "Could not find a downloadable PDF file for this title"
            else:
                isPDF = is_valid_pdf(url[0])
                print(isPDF)
                if isPDF:
                    file = url[0]
                else:
                    file = "Could not find a downloadable PDF file for this title"

            response_data = [
                {
                    "pdfFile": file
                }
            ]
            print(response_data)
            return jsonify(response_data)
        else:
            print("PDF not found for the given title.")
            return None

    except requests.exceptions.RequestException as e:
        print("Error:", e)
        return None

def get_metadata_by_doi(doi):
    base_url = f"{CROSSREF_BASE_URL}/{doi}"
    try:
        response = requests.get(base_url)
        data = response.json()

        if response.status_code == 200 and data.get('message'):
            message = data['message']
            paperTitle = message.get('title', [''])[0]
            paperAuthors = [author.get('given', '') + ' ' + author.get('family', '') for author in
                            message.get('author', [])]
            paperPublicationDate = message.get('published-print', '') or message.get('published-online', '')
            paperPublicationMonth = None
            paperPublicationYear = None
            date_parts = paperPublicationDate.get('date-parts', [])
            if date_parts and len(date_parts[0]) >= 2:
                paperPublicationMonth = date_parts[0][1]
                paperPublicationYear = date_parts[0][0]
            publishedIn = message.get('container-title', [''])[0]

            return {
                "title": paperTitle,
                "authors": paperAuthors,
                "paperPublicationMonth": paperPublicationMonth,
                "paperPublicationYear": paperPublicationYear,
                "doi": doi,
                "publishedIn": publishedIn
            }
        else:
            return None

    except requests.exceptions.RequestException as e:
        print("Error:", e)
        return None


@app.route('/api/get_meta_data_by_doi', methods=['POST'])
def search_metadata_by_doi():
    data = request.get_json()
    doi = data['doi']
    metadata = get_metadata_by_doi(doi)
    url = get_pdf_url_from_doi(doi)
    print(url)
    if url is None:
        file = "Could not find a downloadable PDF file for this doi"
    else:
        isPDF = is_valid_pdf(url[0])
        print(isPDF)
        if isPDF:
            file = url[0]
        else:
            file = "Could not find a downloadable PDF file for this doi"

    response_data = [
        {
            "pdfFile": file
        }
    ]
    print(response_data)

    if metadata:
        metadata_with_pdf = {
            "authors": metadata["authors"],
            "doi": metadata["doi"],
            "paperPublicationMonth": metadata["paperPublicationMonth"],
            "paperPublicationYear": metadata["paperPublicationYear"],
            "publishedIn": metadata["publishedIn"],
            "title": metadata["title"],
            "pdfFile": file
        }
        #response = [metadata_with_pdf]
        print(metadata_with_pdf)
        return jsonify(metadata_with_pdf)
    else:
        return jsonify([{"error": "Metadata not found."}])


@app.route('/api/check_pdf_url', methods=['POST'])
def check_pdf_url():
    data = request.get_json()
    print(data)
    #url = data.get('url')

    if data:
        is_pdf_valid = is_valid_pdf(data)
        print(is_pdf_valid)
        if is_pdf_valid:
            response_data = {
                "pdfFile": "The file is downloadable"
            }
        else:
            response_data = {
                "pdfFile": "Could not find a downloadable PDF file for this URL"
            }
        print(response_data)
        return jsonify([response_data])
    else:
        return jsonify({"error": "No URL provided"}), 400


def is_valid_pdf(url):
    try:
        response = requests.head(url, timeout=1)
        response.raise_for_status()
        content_type = response.headers.get('Content-Type')
        print(content_type)
        if content_type == 'application/pdf':
            return True
    except (RequestException, ConnectTimeout, HTTPError):
        pass

    return False


@app.route('/api/get_meta_data_by_abstract', methods=['POST'])
def search_metadata_by_abstract():
    data = request.get_json()
    print(data)
    abstract = data['abstract']
    doi = get_doi_from_abstract(abstract)
    metadata = get_metadata_by_doi(doi)
    url = get_pdf_url_from_doi(doi)
    print(url)
    if url is None:
        file = "Could not find a downloadable PDF file for this abstract"
    else:
        isPDF = is_valid_pdf(url[0])
        print(isPDF)
        if isPDF:
            file = url[0]
        else:
            file = "Could not find a downloadable PDF file for this abstract"

    if metadata:
        metadata_with_pdf = {
            "authors": metadata["authors"],
            "doi": metadata["doi"],
            "paperPublicationMonth": metadata["paperPublicationMonth"],
            "paperPublicationYear": metadata["paperPublicationYear"],
            "publishedIn": metadata["publishedIn"],
            "title": metadata["title"],
            "pdfFile": file
        }
        # response = [metadata_with_pdf]
        print(metadata_with_pdf)
        return jsonify(metadata_with_pdf)
    else:
        return jsonify([{"error": "Metadata not found."}])
    return metadata

@app.route('/api/get_research_problems', methods=['POST'])
def process_data():
    print(request.files.get('files'))
    print(request.files.get('data'))
    folder_path = create_session_folder()
    download_url = ''

    try:
        data = None  # Initialize the data variable
        data_json = request.files.get('data')  # Get the uploaded JSON file
        print(data_json)
        if data_json:
            data_content = data_json.read().decode('utf-8')  # Read the content as a string
            data = json.loads(data_content)  # Parse the JSON content
            print(data)

            for item in data:
                item_type = item.get('type')
                item_value = item.get('value')
                item_file = item.get('file')
                print(item_type, item_file)
                if item_type == 'URL' or item_type == 'File':
                    download_url = item_value
                else:
                    download_url = item_file
            print("download_url",download_url)
            download_pdf_from_url(download_url, folder_path)

        data_files = request.files.get('files')  # Get the uploaded JSON file
        print(data_files)
        if data_files:
            uploaded_files = request.files.getlist('files')
            for uploaded_file in uploaded_files:
                filename = secure_filename(uploaded_file.filename)
                file_path = os.path.join(folder_path, filename)

                # Read the Base64 content (as raw binary data)
                binary_content = uploaded_file.read()
                # Save the binary content to the file
                with open(file_path, 'wb') as f:
                    f.write(binary_content)

        prompts = [
            f'What is the research_problem for the paper? '
            f'In addition, what is the paper title for the current document? '
            f'Only provide the problem without any extra text. Your answer should be short and follow the JSON structure.'
            f'return all properties smalled and underscored (e.g, research_problem)'
         ]
        research_problem = get_annotated_data(folder_path, prompts)
        #print(research_problem)
        research_problems = extract_research_problems_and_query_orkg(research_problem)
        return jsonify(research_problems)

    except Exception as e:
        return jsonify({'error': 'An error occurred in processing the data', 'message': str(e)}), 500

@app.route('/api/add-comparison', methods=['POST'])
def get_possible_properties():
    #print(request.headers)  # Print request headers
    #print(request.data)  # Print raw request data

    data = request.get_json()
    print(data)
    prompts = [
        'Annotate the paper as a list of ONLY properties, find 3-5 properties, similar to ORKG comparison annotation',
        'I want only the properties names, no values, no extra information',
        'If a property has more than one value do not return the values comma separated. But you have to return the values as an object',
        'I want the properties in simple list like this {property1, property2, property3, property4..etc}',
        'ignore the metadata like doi, title, authors, publish_date...etc',
        'Your answer should ONLY include the property name and follow the JSON structure',
        'Only provide the data without any extra text.'
    ]
    properties_list = get_annotated_data(UPLOAD_FOLDER + '\\' + data['lastDirectory'], prompts)
    unique_properties = extract_unique_properties(properties_list)
    # print("unique_properties:", unique_properties)
    comparison_data = prepare_comparison_object(unique_properties,data)
    # comparison_data = [['paper:title', 'concept types', 'data domains', 'dataset name', 'has research problem', 'number of concepts', 'url', 'methods'], ['MCPL-Based FT-LSTM: A Medical Representation Learning-Based Clinical Prediction Model for Time Series Events', 'medical concepts', 'digital health, electronic medical records', 'not available', 'challenges of extracting useful patterns from electronic medical records', 'thousands', 'http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=8718497'], ['Optimized Deep Learning-Based Multimodal method for Irregular Medical Timestamped data', 'problem, treatment, and test', 'medical', 'i2b2-2010 NER Challenge', 'developing NLP approaches to automatically extract key medical entities from clinical documents', '20,423 unique sentences', 'not available'], ['Deep Learning for Named Entity Recognition: A Comprehensive Review', 'four entity types (Person, Location, Organization, and Miscellaneous)', 'formal documents (e.g., news articles)', 'CoNLL03 and OntoNotes datasets', 'challenges faced by NER systems and outline future directions in this area', 'multiple types', 'not available'], ['Deep Vision Multimodal Learning', 'image captioning, visual question answering, object detection, image retrieval, multimodal fusion', 'daily objects, complex scenes, emerging classes, visually impaired people', 'COCO Captions, Flickr30K Entities, Localized Narratives, TextCaps, VizWiz, Nocaps', 'image captioning, visual question answering, object detection, image retrieval, multimodal fusion', '5', 'not available']]
    return comparison_data

@app.route('/api/edit-comparison', methods=['POST'])
def edit_comparison():
    data = request.get_json()
    #print(data)
    print("propertiesNames: ", data['propertiesNames'])
    print("originalPropertiesNames:", data['originalPropertiesNames'])

    comparison_data = prepare_comparison_object(data['propertiesNames'],data)
    #print("comparison_data: ",comparison_data)
    final_object = update_headers_and_combine(data['originalPropertiesNames'], comparison_data )
    #final_object = [['paper:title', 'concept types', 'data domains', 'dataset name', 'has research problem', 'number of concepts', 'url', 'methods'], ['MCPL-Based FT-LSTM: A Medical Representation Learning-Based Clinical Prediction Model for Time Series Events', 'medical concepts', 'digital health, electronic medical records', 'not available', 'challenges of extracting useful patterns from electronic medical records', 'thousands', 'http://ieeexplore.ieee.org/stamp/stamp.jsp?tp=&arnumber=8718497'], ['Optimized Deep Learning-Based Multimodal method for Irregular Medical Timestamped data', 'problem, treatment, and test', 'medical', 'i2b2-2010 NER Challenge', 'developing NLP approaches to automatically extract key medical entities from clinical documents', '20,423 unique sentences', 'not available'], ['Deep Learning for Named Entity Recognition: A Comprehensive Review', 'four entity types (Person, Location, Organization, and Miscellaneous)', 'formal documents (e.g., news articles)', 'CoNLL03 and OntoNotes datasets', 'challenges faced by NER systems and outline future directions in this area', 'multiple types', 'not available'], ['Deep Vision Multimodal Learning', 'image captioning, visual question answering, object detection, image retrieval, multimodal fusion', 'daily objects, complex scenes, emerging classes, visually impaired people', 'COCO Captions, Flickr30K Entities, Localized Narratives, TextCaps, VizWiz, Nocaps', 'image captioning, visual question answering, object detection, image retrieval, multimodal fusion', '5', 'not available']]
    print("final_object:" , final_object);
    return final_object

def update_headers_and_combine(original_properties, extracted_data):
    updated_headers = ['paper:title'] + [original_properties.get(header, header) for header in original_properties]
    updated_data = [updated_headers] + extracted_data[1:]
    print("updated_data:", updated_data)
    return updated_data


def extract_unique_properties(data):
    unique_properties = set()
    rejected_properties = {"title"}  # Initialize a set to store rejected properties

    # List of additional properties to be rejected
    additional_rejected_properties = ["authors", "publication_venue", "contributions", "publication_date"]

    # Add the additional properties to the rejected_properties set
    rejected_properties.update(additional_rejected_properties)

    for response in data['file_responses']:
        chat_response = response['chat_response']

        # Check if the response contains the pattern "\n"
        if "\n" not in chat_response:
            continue  # Skip this response

        lines = chat_response.split('\n')

        for line in lines:
            if line.startswith("- "):
                property_name = line[2:].split(':', 1)[0].strip().lower().replace(" ", "_")
                if property_name not in rejected_properties:
                    unique_properties.add(property_name)

    return list(unique_properties)


def prepare_comparison_object(properties_list,data):
    print(data)
    prompts = [
        f'Annotate the paper using a property-value-based format with the following set of properties: {properties_list}.'
        f'You MUST also provide the following information for each property:'
        f'Sentence: The sentence where you found each property in the list.'
        f'Section: Is the section name, where the three sentences were found (e.g introduction, method...etc) . '
        f'Score: Is, how confident are you about the property value concerning the sentence you found it in. '
        f'You MUST provide all three sentences and the section for each individual property. '
        f'You MUST follow this structure:'
        f'"property_name": {{"value": "the suggested property values (a property-value-based format )", "Sentence": "some text here", "Section": "section name here", "Score":"the score value here in percentage"}}'
        f'"paper_title": The title of the current pdf document. This title Must be provided. You do not have to provide the three mentioned sentences for the title. But to maintain the same structure of the json object simply assign not available, or empty value for the three mentioned sentences'
        f'Your answer should be concise and follow the JSON structure. '
        f'Provide only the data without any extra text. '
        f'You MUST provide full object of your answer and AVOID incomplete objects structure'
    ]
    #f'"If a property has more than one value do not return the values in a comma separated format. But you have to return the values as an object'
    print(prompts)
    comparison_data = get_annotated_data(UPLOAD_FOLDER + '\\' + data['lastDirectory'], prompts)
    if 'comparisonId' not in data or not data['comparisonId']:
        write_chat_results_to_file(JSON_FOLDER, data['lastDirectory'], comparison_data)
        #comparison_data = read_comparison_data(JSON_FOLDER, data['lastDirectory'])
    else:
        write_chat_results_to_file(JSON_FOLDER, data['comparisonId'], comparison_data)
        #comparison_data = read_comparison_data(JSON_FOLDER, data['comparisonId'])
    print(comparison_data)
    final_comparison_object = extract_comparison_data(comparison_data)
    #print(json.dumps(final_comparison_object, indent=4))

    #for row in final_comparison_object:
    #    print(row)
    return final_comparison_object

# this function is important as some time the response is long and cannot be completly provided
def write_chat_results_to_file(directory, comparisonId, data):
    with open(directory + '\\' + comparisonId + '.json', 'w') as json_file:
        json.dump(data, json_file, indent=4)
    print("Comparison data written to 'comparison_data.json' file.")

def read_comparison_data(directory , comparisonId):
    with open(directory + '\\' + comparisonId +'.json', 'r') as json_file:
        data = json.load(json_file)

    # Parse chat_response values back into JSON objects
    for response in data["file_responses"]:
        print("Response ind read: ", response["chat_response"])
        #response["chat_response"] = json.loads(response["chat_response"])

    return data


def get_last_counter(folder):
    pattern = re.compile(rf'click_{re.escape(folder)}_(\d+)\.json')
    counters = [int(pattern.match(filename).group(1)) for filename in os.listdir(JSON_FOLDER) if pattern.match(filename)]
    if counters:
        return max(counters)
    return 0

@app.route('/api/save-updated-clicks', methods=['POST'])
def save_updated_clicks():
    data = request.json
    print(data)
    contribution_id = data.get('contributionId')
    property_id = data.get('propertyId')
    label = data.get('label')
    time = data.get('time')
    approved = data.get('approved')
    folder = data.get('folder')

    # Create the click data object
    click_data = {
        'contributionId': contribution_id,
        'propertyId': property_id,
        'label': label,
        'time': time,
        'approved': approved,
    }

    # Find the next available index for the filename
    index = get_last_counter(folder) + 1
    file_path = os.path.join(JSON_FOLDER, f'click_{folder}_{index}.json')

    # Write the click data to the new file
    with open(file_path, 'w') as f:
        json.dump([click_data], f, indent=4)

    return ''

@app.route('/api/merge-clicks-files', methods=['POST'])
def merge_clicks_files():
    data = request.json
    folder_name = data.get('folder_name')

    # Create an empty list to store JSON data from each file
    merged_data = []

    # Get a list of all files in the folder
    folder_path = os.path.join(os.getcwd(), JSON_FOLDER)
    file_list = os.listdir(folder_path)

    # Filter the file list to include only JSON files with the specified format
    json_files = [filename for filename in file_list if filename.startswith("click_")]
    json_files_to_merge = [filename for filename in json_files if filename.startswith(f"click_{folder_name}_")]

    # Sort the JSON files based on their incremental value
    json_files_to_merge.sort(key=lambda x: int(x.split("_")[-1].split(".")[0]))

    # Read and merge the JSON data from each file
    for json_file in json_files_to_merge:
        file_path = os.path.join(folder_path, json_file)
        with open(file_path, "r") as f:
            json_data = json.load(f)
            merged_data.extend(json_data)
    print(merged_data)

    return jsonify(merged_data)




def extract_comparison_data(comparison_data):
    extracted_data = []
    property_dict = {}  # Use a dictionary to store properties and their values

    for response in comparison_data["file_responses"]:
        chat_response = response["chat_response"]
        try:
            chat_data = json.loads(chat_response)
        except json.JSONDecodeError as e:
            print("JSON parsing error:", e)
            print("Problematic chat_response:", chat_response)
            chat_data = {}

        if "paper_title" in chat_data:
            extracted_row = [chat_data["paper_title"]["value"]]

            # Store property values in the dictionary
            for key, value in chat_data.items():
                if key != "paper_title" and isinstance(value, dict) and "value" in value:
                    property_dict[key] = value["value"]
                    extracted_row.append(value["value"])

            extracted_data.append(extracted_row)

    if extracted_data:
        property_list = sorted(list(property_dict.keys()))
        header_row = ["paper:title"] + property_list
        extracted_data.insert(0, header_row)

    print(extracted_data)
    return extracted_data


def get_annotated_data(folder_path, prompts):
    pdf_files = [f for f in os.listdir(folder_path) if f.endswith('.pdf')]

    source_ids = []
    for pdf_file in pdf_files:
        file_path = os.path.join(folder_path, pdf_file)
        source_id = upload_file_to_chatpdf(file_path)
        if source_id:
            source_ids.append((source_id, pdf_file))  # Append tuple with source_id and file name

    chat_responses = []

    for source_id, pdf_file in source_ids:
        chat_response = chat_pdf([source_id], prompts)
        if chat_response:
            chat_responses.append({
                'pdf_file': os.path.basename(folder_path)+'/'+ pdf_file,
                'chat_response': chat_response[0]
            })

    # Create a dictionary with the chat responses for each file
    merged_response = {'file_responses': chat_responses}
    print(merged_response)
    return merged_response  # Return the dictionary directly

def extract_research_problems_and_query_orkg(data_object):
    try:
        file_responses = data_object['file_responses']
        comparisons_by_problem = {}

        for file_response in file_responses:
            file_path = file_response['pdf_file']
            chat_response = file_response['chat_response']
            chat_response_json = json.loads(chat_response)
            research_problem = chat_response_json['research_problem']

            if research_problem not in comparisons_by_problem:
                comparisons_by_problem[research_problem] = {'directory': set(), 'comparisons': set()}

            last_directory = os.path.basename(os.path.dirname(file_path))
            comparisons_by_problem[research_problem]['directory'].add(last_directory)
            print("comparisons_by_problem:",comparisons_by_problem)
            endpoint_url = "https://sandbox.orkg.org/triplestore"
            query_template = """
                PREFIX orkgp: <http://orkg.org/orkg/predicate/>
                PREFIX orkgc: <http://orkg.org/orkg/class/>
                PREFIX orkgr: <http://orkg.org/orkg/resource/>

                SELECT DISTINCT ?comparisons
                WHERE {{
                    ?comparisons rdf:type orkgc:Comparison ;
                                orkgp:compareContribution ?contribution .
                    ?contribution orkgp:P32 ?problem .
                    ?problem rdfs:label ?problem_label .
                    FILTER regex(str(?problem_label), "{research_problem}", "i")
                }}
                """

            query = query_template.format(research_problem=research_problem)
            sparql = SPARQLWrapper(endpoint_url)
            sparql.setQuery(query)
            sparql.setReturnFormat(JSON)
            results = sparql.query().convert()

            for binding in results["results"]["bindings"]:
                comparison_id = binding["comparisons"]["value"]
                comparisons_by_problem[research_problem]['comparisons'].add(comparison_id)

        for research_problem, data in comparisons_by_problem.items():
            data['directory'] = list(data['directory'])
            data['comparisons'] = list(data['comparisons'])

        return comparisons_by_problem

    except Exception as e:
        return {'error': 'An error occurred', 'message': str(e)}

def get_doi_from_abstract(abstract):
    try:
        cr = habanero.Crossref(mailto="hassan.hussein@tib.eu")

        # Search for articles using the abstract text
        search_results = cr.works(query_title=abstract)
        data = search_results['message']['items'][0]
        return data.get("DOI", "N/A")

        #url = f'{CROSSREF_BASE_URL}?query.bibliographic={abstract}'
        #response = requests.get(url)
        #response.raise_for_status()
        #data = response.json()
        # Extract the DOI from the response
        #items = data.get('message', {}).get('items', [])
        #if items:
        #    first_item = items[0]
        #    doi = first_item.get('DOI')
        #    print(doi)
        #    return doi

        #return None  # No DOI found

    except requests.exceptions.RequestException as e:
        print('Error:', e)
        return None
    except Exception as e:
        print('An error occurred in finding the doi from the abstract:', e)
        return None

def get_pdf_from_abstract(abstract):
    x = 0

@app.route('/api/upload_files', methods=['POST'])
def upload_file():
    print("upload_file was called")
    try:
        filename = secure_filename(uploaded_file)
        print("Filename:", filename)
        file_path = os.path.join(folder_path, filename)
        print("File path:", file_path)

        # Read the file content
        file_content = uploaded_file.read()

        # Save the file content to the specified path
        with open(file_path, 'wb') as pdf_file:
            pdf_file.write(file_content)

        print('File saved:', file_path)
        return jsonify({'message': 'File uploaded and saved successfully', 'file_path': file_path})

    except Exception as e:
        print('Error saving file:', e)
        return jsonify({'error': 'An error occurred while saving the file'}), 500


def get_pdf_url_from_doi(doi):
    print("get_pdf_url_from_doi was called")
    url = f'{CROSSREF_BASE_URL}/{doi}/transform/application/vnd.crossref.unixsd+xml'
    try:
        response = requests.get(url)
        response.raise_for_status()
        xml_content = response.content
        documentTree = BeautifulSoup(xml_content, features="xml")
        collectionObject = documentTree.find("collection")
        if collectionObject:
            elements = collectionObject.find_all("resource")
            urls = [element.text for element in elements]
            return urls
        else:
            return None
    except requests.exceptions.RequestException as e:
        print('Error:', e)
        return None

# Function to fetch the PDF content from the URL or DOI
def fetch_pdf_content(pdf_url):
    print("fetch_pdf_content was called",pdf_url)
    try:
        if pdf_url.startswith('http'):
            response = requests.get(pdf_url, timeout=10)
            response.raise_for_status()
            pdf_content = response.content
        elif pdf_url.startswith('doi:'):
            doi = pdf_url[4:].strip()
            pdf_content = fetch_pdf_content_from_doi(doi)
        else:
            raise ValueError("Invalid PDF URL or DOI: " + pdf_url)
        return pdf_content
    except requests.exceptions.RequestException as e:
        print('Error:', e)
        return None
    except Exception as e:
        print('Error fetching PDF content:', e)
        return None


# Hypothetical function to fetch the PDF content using DOI
def fetch_pdf_content_from_doi(doi):
    pdf_url = get_pdf_url_from_doi(doi)
    if pdf_url:
        try:
            response = requests.get(pdf_url, timeout=10)
            response.raise_for_status()
            pdf_content = response.content
            return pdf_content
        except requests.exceptions.RequestException as e:
            print('Error:', e)
    else:
        print(f"No valid PDF URLs found for DOI: {doi}")
    return None

#######################################################################
################# ChatPDF Integeration ###############################
######################################################################
def upload_file_to_chatpdf(file_path):
    try:
        files = [('file', ('file.pdf', open(file_path, 'rb'), 'application/octet-stream'))]
        headers = {
            'x-api-key': X_API_KEY,
        }
        # This parameter is very important as sometime the returned object is truncated
        params = {
            'max_tokens': 1000000,
        }
        response = requests.post(f'{CHATPDF_API_BASE_URL}/sources/add-file', headers=headers, files=files, params=params)

        if response.status_code == 200:
            return response.json()['sourceId']
        else:
            print('Error uploading file:', response.text)
            return None
    except Exception as e:
        print('Error:', e)
        return None


def chat_pdf(source_ids, prompts):
    headers = {
        'x-api-key': X_API_KEY,
        'Content-Type': 'application/json',
    }

    chat_responses = []

    def process_chat(source_id_prompt_tuple):
        source_id, prompt = source_id_prompt_tuple
        data = {
            'sourceId': source_id,
            'messages': [
                {
                    'role': 'user',
                    'content': prompt
                }
            ]
        }
        try:
            response = requests.post(f'{CHATPDF_API_BASE_URL}/chats/message', headers=headers, json=data)

            # print('Chat API Request:', data)  # Print the request data
            # print('Chat API Response:', response.status_code)
            # print('Chat API Response Content:', response.text)

            response.raise_for_status()

            if response.status_code == 200:
                result = response.json()['content']
                print("Result:", result)
                chat_responses.append(result)
            else:
                print('Error in chat:', response.text)
        except Exception as e:
            print('Error in chat:', e)

    # print('Number of source IDs:', len(source_ids))
    # print('Number of prompts:', len(prompts))

    with ThreadPoolExecutor(max_workers=len(source_ids)) as executor:
        executor.map(process_chat, zip(source_ids, prompts))

    return chat_responses



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003)  # Change host and port as needed

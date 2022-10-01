'''
    api.py
    Ruofei Li
    Finalized 23 November 2020

    template information:
    books_webapp.py
    Jeff Ondich, 25 April 2016
    Updated 4 November 2020

    Tiny Flask API to support the tiny books web application.
'''
import sys
import flask
import json
import config
import psycopg2
import argparse

from config import user
from config import password
from config import database

api = flask.Blueprint('api', __name__)
#api = flask.Flask(__name__)

#==================Connection===============
try:
    connection = psycopg2.connect(database=database, user=user, port='5433', password=password)
except Exception as e:
    print("Error: problem with configuration", file=sys.stderr)
    exit()

#================Reusable Functions================

def send_query(query):
#Send the query statement and get the cursor.
    try:
        cursor = connection.cursor()
        cursor.execute(query)
    except Exception as e:
        print(e)
        exit()
    return cursor

def search_by_given_conditions(state_name):#?signs_of_mental_illness=True&flee=Car&gender=Female&...=none&...=none&.....
    '''
    One of the core utility functions.
    # Variable names of searching conditions:
    # ID, date, signs_of_mental_illness, threat_level, flee, body_camera, manner_of_death, arm_category,gender,race,sort
    # Returns a list of dictionaries of the cases. For details about the dictionary, see the function 'make_dictionary_from_tuple_full_case()'.
    '''
    query = '''SELECT incidents.id, incidents.date, signs_of_mental_illness.type, threat_level.type, flee.type, body_camera.type,
               manner_of_death.type, arm_category.type, states.state, locations.city, victims.full_name, victims.age, gender.type, race.type
               FROM incidents, signs_of_mental_illness, body_camera, threat_level, flee, manner_of_death, arm_category, states, locations, victims, gender, race
               WHERE incidents.id = locations.id
                 AND locations.state = states.id
                 AND victims.id = incidents.id
            '''
    query = build_query(query,state_name)
    cases_cursor = send_query(query) # type: cursor
    cases_list = []
    for case in cases_cursor:
        cases_list.append(make_dictionary_from_tuple_full_case(case))
    return cases_list

def get_summaries_from_cases_list(cases_list):
    '''
    One of the core utility functions.
    Do some countings given the complete list of cases.
    Counts include total in dataset, total in 2020 (before Jun.15), total unarmed,
    total unfleed, total threat level being non-attack, total race being non-whites,
    total victims' ages being smaller than 20.
    '''
    case_count = 0
    case_2020_count = 0
    unarmed_count = 0
    unfleed_count = 0
    non_attack_count = 0
    racial_minority_count = 0
    below_20_count = 0
    dic_to_return = {}

    for case in cases_list:
        case_count += 1
        date_this_case = case['incidents']['date'].split('-')
        year_this_case = int(date_this_case[0])
        if year_this_case == 2020:
            case_2020_count += 1
        if case['incidents']['arm_category'] == 'Unarmed':
            unarmed_count += 1
        if case['incidents']['flee'] == 'Not fleeing':
            unfleed_count += 1
        if case['incidents']['threat_level'] != 'Attack':
            non_attack_count += 1
        if case['victims']['race'] != 'White':
            racial_minority_count += 1
        if case['victims']['age'] < 20:
            below_20_count += 1

    dic_to_return['total_cases'] = case_count
    dic_to_return['total_cases_2020'] = case_2020_count
    dic_to_return['total_unarmed'] = unarmed_count
    dic_to_return['total_unfleed'] = unfleed_count
    dic_to_return['total_non_attack'] = non_attack_count
    dic_to_return['racial_minority_count'] = racial_minority_count
    dic_to_return['below_20_count'] = below_20_count

    return dic_to_return

def get_id_in_table(variable_name, variable_value):
    '''
    Returns the corresponding id in the form of string for a variable value.
    EX: The output of get_id_in_table(race,'Asian') will be '0'.
    '''
    query = 'SELECT id FROM ' + variable_name + " WHERE type = '"+ variable_value + "';"
    cursor = send_query(query)
    for case in cursor:
        return str(case[0])

def get_count_by_conditions(state_name, var_name, var_value):#Ex: Asian
    '''
    One of the core utility functions.
    # Variable names of searching conditions:
    # ID, date, signs_of_mental_illness, threat_level, flee, body_camera, manner_of_death, arm_category,gender,race,sort
    # Returns a list of dictionaries of the cases. For details about the dictionary, see the function 'make_dictionary_from_tuple_full_case()'.
    '''
    query = '''SELECT COUNT(*)
               FROM incidents, signs_of_mental_illness, body_camera, threat_level, flee, manner_of_death, arm_category, states, locations, victims, gender, race
               WHERE incidents.id = locations.id
                 AND locations.state = states.id
                 AND victims.id = incidents.id
            '''
    list_of_conditions = ['signs_of_mental_illness','threat_level','flee','body_camera','manner_of_death','arm_category','gender','race']
    for variable_name in list_of_conditions:
        if variable_name == 'gender' or variable_name == 'race':
            query += '\nAND victims.'+ variable_name +' = ' + variable_name + '.id'
        else:
            query += '\nAND incidents.'+ variable_name +' = ' + variable_name + '.id'
    if state_name != '': # If a state filter is given
        query += '\nAND states.state = ' + "'" + state_name + "'"
#    print(var_name)
#    print(get_id_in_table(var_name,var_value))
    query += '\n AND victims.' + var_name + ' = ' + get_id_in_table(var_name, var_value) + ';'# I'll use this function only for victims variables eg. race & gender
    #print(query)
    counts_cursor = send_query(query) # type: cursor
    for case in counts_cursor:
        return case[0]

def make_dictionary_from_tuple(case_tuple_from_cursor):
    '''
    Here we are making a dictionary for the 'incidents' table only. For details of the dictionary
    please go check the function below.
    This is separated from the function below for the convenience of testing.
    '''
    case_dict = {}
    case_dict['id'] = case_tuple_from_cursor[0]
    case_dict['date'] = case_tuple_from_cursor[1].isoformat()
    case_dict['signs_of_mental_illness'] = case_tuple_from_cursor[2]
    case_dict['threat_level'] = case_tuple_from_cursor[3]
    case_dict['flee'] = case_tuple_from_cursor[4]
    case_dict['body_camera'] = case_tuple_from_cursor[5]
    case_dict['manner_of_death'] = case_tuple_from_cursor[6]
    case_dict['arm_category'] = case_tuple_from_cursor[7]
    return case_dict

def make_dictionary_from_tuple_full_case(case_tuple_from_cursor):
    '''
    Here we are making a dictionary which contains all information we have for a case.
    It contains 3 keys corresponding to the table names: 'incidents', 'locations', 'victims',
    where the value for each is again a dictionary, of all variable names as keys and corresponding values from the table.
    This is used after the following command:
    SELECT incidents.id, incidents.date, signs_of_mental_illness.type, threat_level.type, flee.type, body_camera.type,
    manner_of_death.type, arm_category.type, states.state, locations.city, victims.full_name, victims.age, gender.type, race.type...
    Example output:[{"incidents": {"id": 2980, "date": "2018-03-12", "signs_of_mental_illness": "True", "threat_level": "Other",
     "flee": "Car", "body_camera": "True", "manner_of_death": "Shot", "arm_category": "Sharp Objects"},
     "locations": {"id": 2980, "date": "2018-03-12", "state": "IL", "city": "Elgin"},
     "victims": {"id": 2980, "date": "2018-03-12", "full_name": "Decynthia Clements", "age": 34, "gender": "Female", "race": "Black"}}]
    '''
    case_dict = {'incidents':'', 'locations':'', 'victims':''}
    case_dict['incidents'] = make_dictionary_from_tuple(case_tuple_from_cursor)
    dict_locations = {}
    dict_locations['id'] = case_tuple_from_cursor[0]
    dict_locations['date'] = case_tuple_from_cursor[1].isoformat()
    dict_locations['state'] = case_tuple_from_cursor[8]
    dict_locations['city'] = case_tuple_from_cursor[9]
    dict_victims = {}
    dict_victims['id'] = case_tuple_from_cursor[0]
    dict_victims['date'] = case_tuple_from_cursor[1].isoformat()
    dict_victims['full_name'] = case_tuple_from_cursor[10]
    dict_victims['age'] = case_tuple_from_cursor[11]
    dict_victims['gender'] = case_tuple_from_cursor[12]
    dict_victims['race'] = case_tuple_from_cursor[13]
    case_dict['locations']= dict_locations
    case_dict['victims']= dict_victims
    return case_dict

def build_query(base_query,state_name):
    '''
    Here we are building the sql query for sorting and searching.
    '''
    list_of_conditions = ['signs_of_mental_illness','threat_level','flee','body_camera','manner_of_death','arm_category','gender','race']
    query = base_query
    for var_name in list_of_conditions:
        var_value = flask.request.args.get(var_name)
        if var_name == 'gender' or var_name == 'race':
            query += '\nAND victims.'+ var_name +' = ' + var_name + '.id'
        else:
            query += '\nAND incidents.'+ var_name +' = ' + var_name + '.id'
        # Turn the int values stored in the TABLEs into their literal names. For example, the 'flee' column in the 'incidents' table
        # looks like flee: 0,0,1,2,0,0,0,1,...

        if var_value != 'none': # If the filter value is specified. Notice: using 'none' instead None to prevent potential confusion of type in Javascript.
            query += '\nAND '+ var_name + '.type = ' + "'" + var_value + "'"
    age_limit = flask.request.args.get('age')
    if age_limit != 'none': # argument ex: age=<=25. Special Case where the search goes by range.
        # print(age_limit)
        if '-' in age_limit:
            limits = age_limit.split('-') # limits : a list where the first element is the lower bound and second upper bound
            query += '\nAND victims.age > ' + limits[0]
            query += '\nAND victims.age <= ' + limits[1] # upper bound is inclusive.
        else:
            query += '\nAND victims.age ' + age_limit
    if state_name != '': # If a state filter is given
        query += '\nAND states.state = ' + "'" + state_name + "'"

    sort_type = flask.request.args.get('sort')
    if sort_type != 'none': # Available choices: every variable name
        if sort_type =='gender' or sort_type == 'race' or sort_type == 'age':
            query += '\nORDER BY victims.' + sort_type + ';'
        else:
            query += '\nORDER BY incidents.' + sort_type + ';'
    else: # sort by id by default
        query += '\nORDER BY incidents.id;'

    return query
#=================================== Endpoint Implements=============================================
@api.route('/test')
def test():
    '''
    This is just for the convenience of testings.
    '''
    return json.dumps(get_count_by_conditions('CA'))

@api.route('/total/cases') # EXAMPLE: ?signs_of_mental_illness=True&flee=Car&arm_category=none&body_camera=True&threat_level=none&manner_of_death=none&gender=Female&race=none&age=none&sort=none
# The order of variable names does not matter, but every one of them must appear exactly once. ('xxx=none' as the place holder).
def cases_by_search():
    '''
    RESPONSE: Return a json dictionary list of cases which meet the specified criteria.
    Each dictionary of cases contains the following fields: ID, date,
    signs_of_mental_illness, threat_level, flee, body_camera, manner_of_death,
    arm_category, state_abbreviation.

    For example output, see make_dictionary_from_tuple_full_case().

    Example queries and meanings: baseURL/total/cases?signs_of_mental_illness=none&flee=Car&arm_category=none
    &body_camera=none&threat_level=none&manner_of_death=none&gender=Female&race=none&age=none
    &sort=none will show all the cases where the female victim was fleeing by car.
    '''
    cases_total = search_by_given_conditions('') # type: cursor
    return json.dumps(cases_total)


@api.route('/total/cumulative') # EXAMPLE queries is the same as above.
def case_summaries_by_search():
    '''
    RESPONSE: Return a json dictionary of several critical counts of the cases which meet the specified criteria.
    The requirement of the queries is the same as above.

    Example output:{"total_cases": 1, "total_cases_2020": 0, "total_unarmed": 0,
    "total_unfleed": 0, "total_non_attack": 1, "racial_minority_count": 1, "below_20_count": 0}
    '''
    cases_total = search_by_given_conditions('') # type: cursor
    dic_to_return = get_summaries_from_cases_list(cases_total)
    return json.dumps(dic_to_return)

@api.route('/states/<state_abbreviation>/cases') # EXAMPLE queries is the same as above.
def case_state_by_search(state_abbreviation):
    '''
    RESPONSE: Return a json dictionary list of cases which meet the specified criteria.
    This is very similar to /total/cases but only looking at a specified state.

    Again: For example output, see make_dictionary_from_tuple_full_case().
    '''
    cases_list_for_the_state = search_by_given_conditions(state_abbreviation) # type: list of dicts
    return json.dumps(cases_list_for_the_state)

@api.route('/states/<state_abbreviation>/cumulative') # EXAMPLE queries is the same as above.
def case_state_summaries_by_search(state_abbreviation):
    '''
    RESPONSE: Return a json dictionary of several critical counts of the cases which meet the specified criteria.
    This is very similar to /total/cumulative but only looking at a specified state.

    For example output, also see /total/cumulative.
    '''
    cases_list_for_the_state = search_by_given_conditions(state_abbreviation) # type: list of dicts, so this method cannot be combined with the last.
    dic_to_return = get_summaries_from_cases_list(cases_list_for_the_state)
    return json.dumps(dic_to_return)

@api.route('/count/<state_abbreviation>')#?var = race
def composition_of_cases_by_variable(state_abbreviation):
    '''
    RESPONSE: Return an int, which is the count of the cases meeting the specified criteria.
    This is exactly the very first value in the dictionaries made by /.../cumulative.
    '''
    state_name = state_abbreviation
    if state_name == 'US':
        state_name = ''
    variable_name = flask.request.args.get('var')
    query = 'SELECT type FROM ' + variable_name +';'
    #print(query)
    values = send_query(query)
    composition_list = []
    options_list = []
#    print(composition_list)
    for option in values:# option[0] sample: Asian
        #print(variable_name)
        #print(option[0])
        composition_list.append(get_count_by_conditions(state_name, variable_name, option[0])) # Notice that 'option' is a list/tuple of length 1
    return json.dumps(composition_list)

@api.route('/options')
def dropdown_options():
    '''
    RESPONSE: This returns a json list of lists. It contains all possible values for all variables. Used for dropdowns.
    Output: [["False", "True"], ["Attack", "Other", "Undetermined"], [...],...]
    '''
    list_of_variables = ['signs_of_mental_illness','threat_level','flee','body_camera','manner_of_death','arm_category','gender','race']
    options = []

    for variable_name in list_of_variables:
        options_list = []
        query = "SELECT type FROM " + variable_name
        values = send_query(query)
        for option in values:
            options_list.append(option[0]) # Notice that 'option' is a list/tuple of length 1
        options.append(options_list)

    return json.dumps(options)

@api.route('/states')
def states_pairs():
    '''
    RESPONSE: This returns a json dictionary of state abbrev:full_name pairs. Used for dropdowns.
    Example output: {"AK": "Alaska", "AL": "Alabama", "AR": "Arkansas", "AZ": "Arizona", "CA": "California",...}
    '''
    states = {}
    query = "SELECT state,state_full_name FROM states"
    pairs_cursor = send_query(query)
    for pair in pairs_cursor:
        states[pair[0]] = pair[1] # Notice that 'option' is a list of length 1
    return json.dumps(states)

@api.route('/case/<case_id>')
def get_case_by_id(case_id):
    '''
    RESPONSE: This returns a json dictionary for the case which has the specified id.
    Again, for example outputs, see make_dictionary_from_tuple_full_case().
    '''
    query = '''SELECT incidents.id, incidents.date, signs_of_mental_illness.type, threat_level.type, flee.type, body_camera.type,
               manner_of_death.type, arm_category.type, states.state, locations.city, victims.full_name, victims.age, gender.type, race.type
               FROM incidents, signs_of_mental_illness, body_camera, threat_level, flee, manner_of_death, arm_category, states, locations, victims, gender, race
               WHERE incidents.id = locations.id
                 AND locations.state = states.id
                 AND victims.id = incidents.id
            '''
    list_of_incident_variables = ['signs_of_mental_illness','threat_level','flee','body_camera','manner_of_death','arm_category']

    for var_name in list_of_incident_variables:
        query += '\nAND incidents.'+ var_name +' = ' + var_name + '.id'
    query += '\nAND victims.gender = gender.id'
    query += '\nAND victims.race = race.id'
    query += '\nAND incidents.id = ' + case_id
    case_cursor = send_query(query)
    dic_to_return = {}
    for case in case_cursor:
        dic_to_return = make_dictionary_from_tuple_full_case(case)
    return json.dumps(dic_to_return)

# TEST ------ Can run api.py directly.
'''
if __name__ == '__main__':
    parser = argparse.ArgumentParser('Covid19_API')
    parser.add_argument('host', help='the host on which this application is running')
    parser.add_argument('port', type=int, help='the port on which this application is listening')
    arguments = parser.parse_args()
    api.run(host=arguments.host, port=arguments.port, debug=True)
'''

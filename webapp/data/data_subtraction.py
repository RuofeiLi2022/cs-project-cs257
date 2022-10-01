import csv
import os

file_name='incidents_duprm.csv'

state_abbreviations = []
state_to_print = []

def slim():
    with open(file_name,newline='') as csv_file:
        csv_reader = csv.reader(csv_file)
        for row in csv_reader:
            state_abbreviations.append(row[1])

    state_without_duplicates_with_states = list(set(state_abbreviations))
    for state in state_without_duplicates_with_states:
        if not state == 'state':
            state_to_print.append(state)
    state_to_print.sort()
    print(state_to_print)
    return state_to_print

########### NEXT ##############

def write_state(list):
    with open(file_name) as data_file:
        csv_reader = csv.reader(data_file)

    with open('incidents_norm.csv','w',newline='') as csv_file:
        writer = csv.writer(csv_file)
        i = 0
        for item in list:
            writer.writerow([i,item])
            i=i+1

#================================

def get_list_long(): # long
    list_to_return=[]
    with open('incidents.csv',newline='') as csv_file:
        csv_reader = csv.reader(csv_file)
        next(csv_reader)
        for row in csv_reader:
            list_to_return.append(row[3])
    return list_to_return

def get_list(col_num): # long
    list_to_return=[]
    with open('states.csv',newline='') as csv_file:
        csv_reader = csv.reader(csv_file)
        for row in csv_reader:
            list_to_return.append(row[col_num])
    return list_to_return

def make_dict(list_state,list_num):
    dict={}
    i = 0
    while i < len(list_state):
        dict[list_state[i]]=list_num[i]
        i=i+1
    return dict

def write_state(dict,list):
    with open('all-states.csv','w',newline='') as csv_file:
        writer = csv.writer(csv_file)
        for state_abrev in list:
            writer.writerow([dict[state_abrev]])

def main():
    write_state(slim_states())
    state_in_dict=get_list(1)
    print(state_in_dict)
    num_in_dict=get_list(0)
    print(num_in_dict)
    long_state_list=get_list_long()
    dictionary_state_num=make_dict(state_in_dict,num_in_dict)
    print(dictionary_state_num)
    write_state(dictionary_state_num,long_state_list)
main()

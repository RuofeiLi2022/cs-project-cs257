Web Application - US Police Shootings
23 November 2020

AUTHORS：Ruofei Li, Yiwen Luo in webapp.css

DATA: A data collection of the police shootings happened in the USA from Jan. 1, 2015 to Jun. 15, 2020.
Originally from https://www.kaggle.com/ahsen1330/us-police-shootings, all rights reserved for the original author/uploader.

STATUS: Everything should be working now!

NOTES: 
The homepage localhost:5000/ is index.html, where I've written a brief introduction of the database and provided accesses for the rest pages. I will not repeat the infos here. Also, index.html does not have any actual functionality. It is independent of the web application.

On the top of each of the two core web pages, I'm also having an introduction section. It might (or might not) include some helpful messages.

Some BUG fixes:

ISSUE: Pie Graphs - only load when inspecting. Nothing pops up in the console.

Fixed by rewriting the api (api.py) to let it arrange the data for the graph intead of graph.js. Still have no idea what had happened.

ISSUE: Pie Graphs - labels for the 0 values still show up on the graph.

Fixed by adding a function to remove the zeroes and their corresponding labels.
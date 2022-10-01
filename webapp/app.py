#!/usr/bin/env python3
'''
    app.py
    Ruofei Li
    23 November 2020

    Essentially renamed from:
    webapp.py
    Jeff Ondich
    6 November 2020
'''
import sys
import flask
import api

app = flask.Flask(__name__, static_folder='static', template_folder='templates')
app.register_blueprint(api.api, url_prefix='/api')

# This route delivers the user your site's home page.
@app.route('/')
def home():
    return flask.render_template('index.html')

@app.route('/search')
def search():
    return flask.render_template('page_search.html')

@app.route('/graph')
def graph():
    return flask.render_template('page_graph.html')

@app.route('/fullResponse')
def full_response():
    return flask.render_template('full_response.html')

# This route supports relative links among your web pages, assuming those pages
# are stored in the templates/ directory or one of its descendant directories,
# without requiring you to have specific routes for each page.
########### Running the website server ###########
if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('Usage: {0} host port'.format(sys.argv[0]), file=sys.stderr)
        exit()

    host = sys.argv[1]
    port = int(sys.argv[2])
    app.run(host=host, port=port, debug=True)

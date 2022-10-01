/*
 * shooting.js
 * Ruofei Li and Yiwen Luo, 27 April 2016
 * 11 November 2020
 *
 * We are temperarily using the api path ".../cases/total? *  * filter=mental_illness" and it means to be "cases/total? * filter=mental_illness&mental_illness=true". Will fix later.
 * A little bit of Javascript showing one small example of AJAX
 * within the "books and authors" sample for Carleton CS257.
 *
 * This example uses a very simple-minded approach to Javascript
 * program structure. We'll talk more about this after you get
 * a feel for some Javascript basics.
 */

window.onload = initialize;

function initialize() {
    var element = document.getElementById('get_mental_ill');
    element.onclick = getIllButtonClicked;
}

// Returns the base URL of the API, onto which endpoint components can be appended.
function getAPIBaseURL() {
    var baseURL = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/api';
    return baseURL;
}

function getIllButtonClicked() {
    var url = getAPIBaseURL() + '/cases/total?filter=mental_illness';

    // Send the request to the api
    fetch(url, {method: 'get'})

    // When the results come back, transform them from a JSON string into
    // a Javascript object (in this case, a list of author dictionaries).
    .then((response) => response.json())

    // Once you have your list of author dictionaries, use it to build
    // an HTML table displaying the author names and lifespan.
    .then(function(casesList) {
        // Build the table body.
        var tableBody = '';
        tableBody += '<tr><th>State Abbreviation</th>';
        tableBody += '<th>Date</th>';
        tableBody += '<th>Full Name</th>';
        tableBody += '<th>Gender</th>';
        tableBody += '<th>Race</th>';
        tableBody += '<th>Age</th>';
        tableBody += '<th>Signs of Mental Illness</th></tr>'
        for (var k = 0; k < casesList.length; k++) {
            tableBody += '</tr><td>'+casesList[k]['state_abbreviation'] + '</td>';
            tableBody += '<td>'+casesList[k]['date'] + '</td>';
            tableBody += '<td>'+casesList[k]['full_name'] + '</td>';
            tableBody += '<td>'+casesList[k]['gender'] + '</td>';
            tableBody += '<td>'+casesList[k]['race'] + '</td>';
            tableBody += '<td>'+casesList[k]['age'] + '</td>';
            tableBody += '<td>'+casesList[k]['signs_of_mental_illness'] + '</td></tr>';
        }

        // Put the table body we just built inside the table that's already on the page.
        var resultsTableElement = document.getElementById('results_table');
        if (resultsTableElement) {
            resultsTableElement.innerHTML = tableBody;
        }
    })

    // Log the error if anything went wrong during the fetch.
    .catch(function(error) {
        console.log(error);
    });
}
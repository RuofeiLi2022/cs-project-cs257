/*
 * full_response.js
 * Ruofei Li, 22 Nov 2020
 * 11 November 2020
 *
 * Script for full_response.html
 */

window.onload = initialize;

function initialize() {
    loadTable();
}

function getAPIBaseURL() {
    var baseURL = 'http://localhost:5000/api';
    return baseURL;
}

function loadTable(){
  var filterMap = {};
  var valuesList = ['signs_of_mental_illness','threat_level','flee','body_camera','manner_of_death','arm_category','gender','race','age','sort'];
  for (var k = 0; k < 10; k++) {
    var theKthList = window.opener.document.getElementById(k);
  //  console.log(theKthList.innerHTML)
    var index = theKthList.selectedIndex;
    filterMap[valuesList[k]] = theKthList.options[index].value;
  }
  var url = getAPIBaseURL() + '/total/cases?';
//    console.log(filterMap)
  url = buildURL(url,filterMap);
  // Send the request to the api
  fetch(url, {method: 'get'})
  .then((response) => response.json())
  .then(function(casesList) {
    // Build the table body.
    var tableBody = '<tr>';
    tableBody += '<th>id</th>';
    tableBody += '<th>Date</th>';
    tableBody += '<th>SMI</th>';
    tableBody += '<th>Threat Level</th>';
    tableBody += '<th>Flee</th>';
    tableBody += '<th>Body Camera</th>';
    tableBody += '<th>Manner of Death</th>';
    tableBody += '<th>Arms Category</th></tr>';
    var arrOfIncidentsVariables = ['id','date','signs_of_mental_illness','threat_level','flee','body_camera','manner_of_death','arm_category']
    var countCases = 0;
    while (countCases < casesList.length){
      tableBody += '<tr>';
      for (var i=0; i< arrOfIncidentsVariables.length; i++) { // {'flee':'Car', 'gender':'none'...}
        tableBody += '<td>'+casesList[countCases]['incidents'][arrOfIncidentsVariables[i]]+ '</td>';
      }
      tableBody += '</tr>';
      countCases++;
    }
    // Put the table body we just built inside the table that's already on the page.
    var resultsTableElement = document.getElementById('fullResponse');
    resultsTableElement.innerHTML = '';
    if (resultsTableElement) {
        resultsTableElement.innerHTML = tableBody;
    }
  })
}

function buildURL(baseURL,filterMap) {
  var url = baseURL;
  var valuesList = ['signs_of_mental_illness','threat_level','flee','body_camera','manner_of_death','arm_category','gender','race','age','sort'];
  var query = '';
  //console.log(filterMap);
  for (var k = 0; k < 10; k++) {
    key = valuesList[k];
    query += key + '=' + filterMap[key] + '&';
  }
//  console.log(query);
//    query += 'age=none&sort=none'
  url += query;
  return url;
}

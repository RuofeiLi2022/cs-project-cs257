/*
 * search.js
 * Ruofei Li
 * 11 November 2020
 *
 * Updated 17 November 2020.
 * Finalized 23 November 2020.
 */

window.onload = initialize;

function initialize() {
    dropdownSelector();
    //onSubmitButtonClicked();
    var submitbutton = document.getElementById('submit');
    submitbutton.onclick = onSubmitButtonClicked;
    var incibutton = document.getElementById('incident');
    incibutton.onclick = onIncidentButtonClicked;
    var vicbutton = document.getElementById('victim');
    vicbutton.onclick = onVictimButtonClicked;
    var spotbutton = document.getElementById('spot');
    spotbutton.onclick = onSpotButtonClicked;
    var searchbutton = document.getElementById('searchById');
    searchbutton.onclick = onSearchButtonClicked;
    var viewAllbutton = document.getElementById('fullResponse')
    viewAllbutton.onclick = onViewButtonClicked;
}

// Returns the base URL of the API, onto which endpoint components can be appended.
function getAPIBaseURL() {
    var baseURL = window.location.protocol + '//' + window.location.hostname + ':' + window.location.port + '/api';
    return baseURL;
}

function dropdownSelector() {
  var url = getAPIBaseURL() + '/options';

  fetch(url, {method: 'get'})

  .then((response) => response.json())

  .then(function(options) {
      for (var k=0; k < options.length; k++) {
        var optionSelector = document.getElementById(k);
        var optionSelectorBody = "<option value='none'>NO OPTIONS</option>\n";
        if (optionSelector) {
          //var valuesList = ['signs_of_mental_illness','threat_level','flee','body_camera','manner_of_death','arm_category','gender','race'];
          for (var i=0; i < options[k].length; i++) {
              var optionsList = options[k];
              optionSelectorBody += '<option value="' + optionsList[i] + '">' + optionsList[i] + '</option>\n';
          }
          optionSelector.innerHTML = optionSelectorBody;
          optionSelector.value = 'none';
        }
      }
      var filterMap = buildFilterMap()
      loadTotalSummaries(filterMap);
      loadFirst20CasesIncidents(filterMap);
  })
  .catch(function(error) {
      console.log(error);
  });
}

////////////////On Click Functions///////////////
function onViewButtonClicked() {
  var filterMap = buildFilterMap();
  //console.log(filterMap);
  window.open('/fullResponse')
}

function onSubmitButtonClicked() {
  var filterMap = buildFilterMap();
  //console.log(filterMap);
  loadTotalSummaries(filterMap);
  loadFirst20CasesIncidents(filterMap);
}

function onIncidentButtonClicked() {
  var filterMap = buildFilterMap();
  loadFirst20CasesIncidents(filterMap);
}

function onVictimButtonClicked() {
  var filterMap = buildFilterMap();
  loadFirst20CasesVictims(filterMap);
}

function onSpotButtonClicked() {
  var filterMap = buildFilterMap();
  loadFirst20CasesSpots(filterMap);
}

function onSearchButtonClicked() {
  var caseIDBox = document.getElementById('caseId');
  var id = caseIDBox.value;
  if (id < 0 || id > 4894 || id % 1 != 0) { // There are only CASE 0 to 4894 in my dataset.
    alert("Your ID number doesn't exist. Please try another one!" );
    caseIDBox.value = '';
  }
  else{
    var url = getAPIBaseURL() + '/case/'+ id; //This is safe since I'm only allowing numbers in this input box.
    fetch(url, {method: 'get'})
    .then((response) => response.json())
    .then(function(caseMap) {
      var tableBody = '<tr><th>Event Status</th>';
      tableBody += '<th>id</th>';
      tableBody += '<th>Date</th>';
      tableBody += '<th>SMI</th>';
      tableBody += '<th>Threat Level</th>';
      tableBody += '<th>Flee</th>';
      tableBody += '<th>Body Camera</th>';
      tableBody += '<th>Manner of Death</th>';
      tableBody += '<th>Arms Category</th></tr>';
      var arrOfIncidentsVariables = ['id','date','signs_of_mental_illness','threat_level','flee','body_camera','manner_of_death','arm_category']
      tableBody += '<tr><th>Entries</th>';
      for (var i=0; i< arrOfIncidentsVariables.length; i++) { // {'flee':'Car', 'gender':'none'...}
        tableBody += '<td>'+caseMap['incidents'][arrOfIncidentsVariables[i]]+ '</td>';
      }
      tableBody += '</tr><tr><th>Victim Personal Information</th>';
      tableBody += '<th>Full Name</th>';
      tableBody += '<th>Age</th>';
      tableBody += '<th>Gender</th>';
      tableBody += '<th>Race</th></tr>';
      var arrOfVictimsVariables = ['full_name','age','gender','race']
      tableBody += '<tr><th>Entries</th>';
      for (var i=0; i< arrOfVictimsVariables.length; i++) { // {'flee':'Car', 'gender':'none'...}
        tableBody += '<td>'+caseMap['victims'][arrOfVictimsVariables[i]]+ '</td>';
      }
      tableBody += '</tr><tr><th>Spot</th>';
      tableBody += '<th>State Abbreviation</th>';
      tableBody += '<th>City</th></tr>';
      var arrOfSpotVariables = ['state','city']
      tableBody += '<tr><th>Entries</th>';
      for (var i=0; i< arrOfSpotVariables.length; i++) { // {'flee':'Car', 'gender':'none'...}
        tableBody += '<td>'+caseMap['locations'][arrOfSpotVariables[i]]+ '</td>';
      }
      tableBody += '</tr>'

      // Put the table body we just built inside the table that's already on the page.
      changeTable('oneCaseTable',tableBody);
    })
  }
}

///////////////////Load Functions/////////////////////////////
function loadTotalSummaries(filterMap) {
    var url = getAPIBaseURL() + '/total/cumulative?';
//    console.log(filterMap)
//    var filterMap = filterMap
    url = buildURL(url,filterMap)
    // Send the request to the api
    fetch(url, {method: 'get'})

    // When the results come back, transform them from a JSON string into
    // a Javascript object (in this case, a list of author dictionaries).
    .then((response) => response.json())

    // Once you have your list of author dictionaries, use it to build
    // an HTML table displaying the author names and lifespan.
    .then(function(sumMap) {
      // Build the table body.
      var tableBody = '<tr><th></th>';
      tableBody += '<th>Total</th>';
      tableBody += '<th>Total in 2020</th>';
      tableBody += '<th>Unarmed</th>';
      tableBody += '<th>Unfleed</th>';
      tableBody += '<th>Non-Attack</th>';
      tableBody += '<th>Racial Minority</th>';
      tableBody += '<th>Age below 20</th></tr><tr><th># Cases</th>';
      for (var key in sumMap) {
          tableBody += '<td>'+sumMap[key]+ '</td>';
      }
      tableBody += '</tr>';
      // Put the table body we just built inside the table that's already on the page.
      changeTable('summaryTable',tableBody);
    })
    // Log the error if anything went wrong during the fetch.
    .catch(function(error) {
        console.log(error);
    });
}

function loadFirst20CasesIncidents(filterMap){
  var url = getAPIBaseURL() + '/total/cases?';
//    console.log(filterMap)
  url = buildURL(url,filterMap)
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
    tableBody += build20Cases(casesList,'incidents',arrOfIncidentsVariables);
    changeTable('20CasesTable',tableBody);
  })
}

function loadFirst20CasesVictims(filterMap){
  var url = getAPIBaseURL() + '/total/cases?';
  url = buildURL(url,filterMap)
  fetch(url, {method: 'get'})
  .then((response) => response.json())
  .then(function(casesList) {
    var tableBody = '<tr>';
    tableBody += '<th>id</th>';
    tableBody += '<th>Date</th>';
    tableBody += '<th>Full Name</th>';
    tableBody += '<th>Age</th>';
    tableBody += '<th>Gender</th>';
    tableBody += '<th>Race</th></tr>';
    var arrOfVictimsVariables = ['id','date','full_name','age','gender','race']
    tableBody += build20Cases(casesList,'victims',arrOfVictimsVariables);
    changeTable('20CasesTable',tableBody);
  })
}

function loadFirst20CasesSpots(filterMap){
  var url = getAPIBaseURL() + '/total/cases?';
//    console.log(filterMap)
  url = buildURL(url,filterMap)
  fetch(url, {method: 'get'})
  .then((response) => response.json())
  .then(function(casesList) {
    var tableBody = '<tr>';
    tableBody += '<th>id</th>';
    tableBody += '<th>Date</th>';
    tableBody += '<th>State Abbreviation</th>';
    tableBody += '<th>City</th></tr>';
    var arrOfSpotVariables = ['id','date','state','city'];
    tableBody += build20Cases(casesList,'locations',arrOfSpotVariables);
    changeTable('20CasesTable',tableBody);
  })
}
//////////// Utility functions ////////////

function buildURL(baseURL,filterMap) {
  var url = baseURL;
  var valuesList = ['signs_of_mental_illness','threat_level','flee','body_camera','manner_of_death','arm_category','gender','race','age','sort'];
  var query = '';
  //console.log(filterMap);
  for (var k = 0; k < 10; k++) {
    key = valuesList[k];
    query += key + '=' + filterMap[key] + '&';
  }
  url += query;
  return url;
}

function buildFilterMap() { // Note that this actually returns a LIST with a count of not-none arguments and the actual filter map.
  var filterMap = {};
  var valuesList = ['signs_of_mental_illness','threat_level','flee','body_camera','manner_of_death','arm_category','gender','race','age','sort'];
  for (var k = 0; k < 10; k++) {
    var theKthList = document.getElementById(k);
  //  console.log(theKthList.innerHTML)
    var index = theKthList.selectedIndex;
    filterMap[valuesList[k]] = theKthList.options[index].value;
  }
  return filterMap;
}

function build20Cases(casesList, tableName, arrOfVariableNames) {
  var countCases = 0;
  var tableBody = '';
  var arrOfVariables = arrOfVariableNames;
  while (countCases < 20){
    tableBody += '<tr>';
    for (var i=0; i< arrOfVariables.length; i++) { // {'flee':'Car', 'gender':'none'...}
      tableBody += '<td>'+casesList[countCases][tableName][arrOfVariables[i]]+ '</td>';
    }
    tableBody += '</tr>';
    countCases++;
    if (countCases >= casesList.length) {
      break;
    }
  }
  return tableBody;
}

function changeTable(tableID,tableBody){
  var resultsTableElement = document.getElementById(tableID);
  resultsTableElement.innerHTML = '';
  if (resultsTableElement) {
      resultsTableElement.innerHTML = tableBody;
  }
}

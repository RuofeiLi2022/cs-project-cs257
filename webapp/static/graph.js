/*
 * graph.js
 * Ruofei Li
 * 21 November 2020
 *
 * Finalized 23 November 2020
 *
 * Using Jeff's samples as templates.
 */

window.onload = initialize;

function initialize() {
    stateSelector();
    //onSubmitButtonClicked();
}

// Returns the base URL of the API, onto which endpoint components can be appended.
function getAPIBaseURL() {
    var baseURL = 'http://localhost:5000/api';
    return baseURL;
}

function stateSelector() {
    // Populate the the drop-down list with the list of states from the API.
    var url = getAPIBaseURL() + '/states';

    fetch(url, {method: 'get'})

    .then((response) => response.json())

    .then(function(states) {
        var stateSelector = document.getElementById('stateSelect');
        if (stateSelector) {
            // Populate it with states from the API
            var stateSelectorBody = '<option value="US">United States</option>';
            for (var key in states) {
                stateSelectorBody += '<option value="' + key+ '">' + states[key]+','+ key + '</option>';
            }
            //console.log(stateSelectorBody);
            stateSelector.innerHTML = stateSelectorBody;

            // Set the new-selection handler
            stateSelector.onchange = onStateSelectorChanged;

            // Start us out looking at Minnesota.
            stateSelector.value = 'US';
            loadStateSummaries(stateSelector.value);
            //createPieChart();
            createStatePieCharts(stateSelector.value);
        }

    })
    .catch(function(error) {
        console.log(error);
    });
}

function loadStateSummaries(stateAbbreviation) {
    var noFilter = '?signs_of_mental_illness=none&flee=none&arm_category=none&body_camera=none&threat_level=none&manner_of_death=none&gender=none&race=none&age=none&sort=none'
    if (stateAbbreviation == 'US'){
      var url = getAPIBaseURL() + '/total/cumulative'+noFilter;
    }
    else{
    var url = getAPIBaseURL() + '/states/'+ stateAbbreviation +'/cumulative'+noFilter;
    }
//    console.log(filterMap)
//    var filterMap = filterMap
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
      var resultsTableElement = document.getElementById('stateCumulative');
      resultsTableElement.innerHTML = '';
      if (resultsTableElement) {
        //console.log(tableBody);
        resultsTableElement.innerHTML = tableBody;
      }
    })
    // Log the error if anything went wrong during the fetch.
    .catch(function(error) {
        console.log(error);
    });
}

function onStateSelectorChanged() {
    var stateSelector = document.getElementById('stateSelect');
    if (stateSelector) {
        var stateAbbreviation = stateSelector.value;
        loadStateSummaries(stateAbbreviation);
        createStatePieCharts(stateAbbreviation);
    }
}

function getMapOfFilters(arrIndex, raceOrGender){ // The first parameter is the index of variable values in either race or gender array, the second is indicating gender or race (either 6 or 7).
    var valuesList = ['signs_of_mental_illness','threat_level','flee','body_camera','manner_of_death','arm_category','gender','race','age','sort'];
    var race = ['Asian','Black','Hispanic','Native','Other','White'];
    var gender = ['Female','Male'];
    filterMap = {};
    for (var i = 0; i < valuesList.length; i++) {
      if (i != raceOrGender) {
        filterMap[valuesList[i]] = 'none';
      }
      else if (i == raceOrGender && raceOrGender == 6){ // valuesList[6] == 'gender'
        filterMap[valuesList[i]] = gender[arrIndex];
      }
      else { // valuesList[7] == 'race'
        filterMap[valuesList[i]] = race[arrIndex];
      }
    }
    return filterMap;
}

function createStatePieCharts(stateAbbreviation) {
  var urlRace = getAPIBaseURL() + '/count/'+ stateAbbreviation +'?var=race';
  var urlGender = getAPIBaseURL() + '/count/'+ stateAbbreviation +'?var=gender';
  var options = {};
  eraseChart('pieRace');
  eraseChart('pieGender');
  //console.log(raceGenderSeriesList);
  fetch(urlRace, {method: 'get'})
  .then((response) => response.json())
  .then(function(compositionList){
    var labels = ['Asian','Black','Hispanic','Native','Other','White'];
    var series = compositionList;
    var arrZeroesRemoved = eraseZeroes(labels, series);
    var dataRace = {
      labels: arrZeroesRemoved[0],
      series: arrZeroesRemoved[1]
    }
    new Chartist.Pie('#pieRace', dataRace, options);
  })
  // Create the chart Race first
  // Create the chart Gender next
  fetch(urlGender, {method: 'get'})
  .then((response) => response.json())
  .then(function(compositionList){
    var labels = ['Male','Female'];
    var series = compositionList;
    var arrZeroesRemoved = eraseZeroes(labels, series);
    var dataGender = {
      labels: arrZeroesRemoved[0],
      series: arrZeroesRemoved[1]
    }
    new Chartist.Pie('#pieGender', dataGender, options);
  })
}
// JEFF'S SIMPLE SAMPLE METHOD--------FOR TESTING
function createPieChart() {
    var data = {
        labels: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
        series: { data : [17, 6, 4, 9, 11, 7, 2]}
    };

    var options = {}
    new Chartist.Bar('#pieRace', data, options);
    new Chartist.Bar('#pieGender', data, options);
}

//////// Utility Functions///////////
function eraseChart(chartID){
  var resultsContainerElement = document.getElementById(chartID);
  resultsContainerElement.innerHTML = '';
}

function eraseZeroes(arrayLabels,arrayData){
  var arrLabels = arrayLabels;
  var arrData = arrayData;
  var arrLabelsZeroesRemoved = [];
  var arrDataZeroesRemoved = [];
  for (var i = 0; i < arrData.length; i++) {
    if (arrData[i]!= 0) {
      arrLabelsZeroesRemoved.push(arrLabels[i]);
      arrDataZeroesRemoved.push(arrData[i]);
    }
  }
  var arrZeroesRemoved = [];
  arrZeroesRemoved.push(arrLabelsZeroesRemoved);
  arrZeroesRemoved.push(arrDataZeroesRemoved);
  return arrZeroesRemoved;
}

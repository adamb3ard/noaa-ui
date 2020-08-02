<template>
  <div id = "index">
    <h1 id = "main-heading">NOAA Data</h1>
    <div id = "info-container">
        <p>Enter a GHCN station Id to load its daily observations.</p>
    </div>
    <div id = "input-container">
        <input type = "text" id = "input-container" placeholder = "Enter Station ID" v-model = "stationId">
        <button type = "button" id = "submit-btn" pattern =" [a-z\d]*" @click = "getStation()">Get Data</button>
    </div>
    <div id = "result-container" v-if = "getStationClicked">
        <div v-if = "!loading && !error">
            <h2 id = "result-summary" >
                Station: {{resultId}} | Number of Observations: {{numberOfObservations}}
            </h2>
            <table id = "observation-table">
                <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>M Flag</th>
                    <th>Q Flag</th>
                    <th>S Flag</th>
                </tr>
                <tr v-for = "(observation, index) in resultObservations" :key="index">
                    <td>{{observation.recordedDate.split("T")[0]}}</td>
                    <td>{{observation.type}}</td>
                    <td>{{observation.value}}</td>
                    <td>{{observation.mflag == '' ? '-': observation.mflag}}</td>
                    <td>{{observation.qflag == '' ? '-': observation.qflag}}</td>
                    <td>{{observation.sflag == '' ? '-': observation.sflag}}</td>
                </tr>
            </table>
        </div>
        <h2 v-else-if = "!loading && error">
            {{errorMessage}}
        </h2>
        <div id = "loading-container" v-else>
            <h2 >Loading</h2>
            <div id = "spinning-container">
                <rotate-square2></rotate-square2>
            </div>   
        </div>
    </div>
  </div>
</template>

<script>
import {RotateSquare2} from 'vue-loading-spinner'

export default {
    name: 'Index',
    components: {
        RotateSquare2
    },
    data() {
        return {
            error: false,
            errorMessage: "",
            getStationClicked: false,
            loading: false,
            numberOfObservations: 0,
            resultId: '',
            resultObservations: [],
            station: {},
            stationId: ''
        }
    },
    methods: {
        /**
         * Calls the station endpoint to get observations for a given Id.
         */
        getStation() {
            if(this.stationId == '') {
                alert("Please enter a station identifier.");
            } else {
                this.loading = true;
                this.getStationClicked = true;
                let cleanStationId = this.stationId.replace(/[^0-9A-Za-z]/g, '');
                let uri = 'http://localhost:8080/api/v1/stations/' + cleanStationId;

                fetch(uri, {"method": "GET"}).then(response => {
                    if(response.ok) {
                        this.loading = false;
                        this.error = false;

                        response.json().then(responseBody => {
                            this.station = responseBody;
                            this.resultId = this.station.stationIdentifier;
                            this.numberOfObservations = this.station.observations.length;
                            this.resultObservations = this.station.observations;
                        });
                    } else if(response.status == 404) {
                        this.loading = false;
                        this.error = true;
                        this.errorMessage = "There are no observations for that Station Id.";
                    } else if(response.status == 422) {
                        this.loading = false;
                        this.error = true;
                        this.errorMessage = "422 Unprocessable Entity: Try a diffrent Station Id.";
                    } else if(response.status == 500) {
                        this.loading = false;
                        this.error = true;
                        this.errorMessage = "Internal Server Error - Try again later.";
                    }
                }).catch(err => {
                    alert("There was a problem: " + err);
                    this.loading = false;
                    this.getStationClicked = false;
                });
            }
        }
    }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css?family=Sen&display=swap');
@import url('https://fonts.googleapis.com/css?family=Roboto&display=swap');

* {
    margin: 0;
    padding: 0;
}

#index {
    width: 80%;
    margin: auto;
    text-align: center;
    padding: .1em; 
}

#main-heading {
    padding: .2em;
    width: 80%;
    margin: auto;
    font-family: 'Sen', sans-serif;
}

#info-container {
    padding: 1em;
}

#input-container {
    padding: .5em;
    border-radius: .5em;
}

#result-container {
    padding: 1em;
    margin-bottom: 2em;
    font-family: 'Roboto', sans-serif;
}

#result-summary {
    padding: 1em;
}

#submit-btn {
    padding: .5em .5em;
    background-color: #006aff;
    color: #fff;
    margin-left: .5em;
    border-radius: .5em;
}

#observation-table {
    width: 100%;
    margin: auto;
    text-align: center;
    border: 1px solid #000;
}

#loading-container {
    width: 100%;
    margin: auto;
    text-align: center;
}

#spinning-container {
    display: flex;
    justify-content: center;
    padding: 1.5em;
}

th {
    font-family: 'Roboto' sans-serif;
    font-family: 1em;
    padding: .5em;
    border-bottom: 1px solid #000;
}

td {
    font-family: 'Sen', sans-serif;
}

</style>

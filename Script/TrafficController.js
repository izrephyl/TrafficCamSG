mainApp.controller("TrafficController", function ($scope, $http) {

    $scope.cameraList = [];
    $scope.areaList = [];
    $scope.weatherList = [];
    $scope.selectedLoc = [];
    $scope.areaName = "";
    $scope.aWeather = "";

    var date = new Date();
    $scope.aDate = date;
    $scope.aTime = new Date(
        date.getFullYear(),
        date.getMonth() + 1,
        date.getDate(),
        date.getHours(),
        date.getMinutes());

    // $http.get("https://api.data.gov.sg/v1/transport/traffic-images")
    //     .then(function (response) {
    //         $scope.cameraList = response.data.items[0].cameras;
    //     });

    $scope.queryLocation = function () {
        var dateString = dateFormat($scope.aDate, "yyyy-mm-dd");
        var timestring = "T" + dateFormat($scope.aTime, "HH:MM:ss");
        var selectedDate = dateString + timestring;

        $http.get("https://api.data.gov.sg/v1/transport/traffic-images", {
            params: { date_time: selectedDate }
        }).then(function (response) {
            $scope.cameraList = response.data.items[0].cameras;
        });

        $http.get("https://api.data.gov.sg/v1/environment/2-hour-weather-forecast", {
            params: { date_time: selectedDate }
        }).then(function (response) {
            var result = response.data;
            $scope.areaList = result.area_metadata;
            $scope.weatherList = result.items[0].forecasts;
        });
    }

    $scope.locSelected = function (loc) {
        var parsedLoc = JSON.parse(loc);
        var cameraData = $scope.cameraList.filter(value => {
            return (value.location.latitude == parsedLoc.latitude &&
                value.location.longitude == parsedLoc.longitude)
        })
        //console.log(filteredData[0].image);
        var container = document.getElementById("screenShot")
        container.innerHTML = "";
        var screenShot = document.createElement("img")
        screenShot.src = cameraData[0].image;
        container.appendChild(screenShot);

        $scope.areaName = getNearestAreaName($scope.areaList, parsedLoc)
        
        var weatherData = $scope.weatherList.filter(value => {
            return value.area == $scope.areaName
        })
        // console.log(weatherData);

        $scope.aWeather = weatherData[0].forecast;

    }

    function getNearestAreaName(areaList, parsedLoc) {
        var areaName = areaList[0].name;
        var closest = areaList[0].label_location;
        var closest_distance = distance(closest, parsedLoc);
        for (var i = 1; i < areaList.length; i++) {
            if (distance(areaList[i].label_location, parsedLoc) < closest_distance) {
                closest_distance = distance(areaList[i].label_location, parsedLoc);
                closest = areaList[i].label_location;
                areaName = areaList[i].name;
            }
        }
        // console.log(closest)
        return areaName;
    }

    //To find distance between 2 points (Haversine formula):
    function distance(position1, position2) {
        var lat1 = position1.latitude;
        var lat2 = position2.latitude;
        var lon1 = position1.longitude;
        var lon2 = position2.longitude;
        var R = 6371000; // metres
        var φ1 = toRadians(lat1);
        var φ2 = toRadians(lat1);
        var Δφ = toRadians(lat2 - lat1);
        var Δλ = toRadians(lon2 - lon1);

        var a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        var d = R * c;
        return d;
    }

    function toRadians(Value) {
        /** Converts numeric degrees to radians */
        return Value * Math.PI / 180;
    }

})
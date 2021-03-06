angular.module('app.controllers', [])

.controller('linkVanHomeCtrl', function($scope, facilityService, $ionicPopup, ConnectivityMonitor, $ionicPlatform, $http) {
    var BASE = "https://linkvan.herokuapp.com/api/getchanges?localid=";
    var BASETEST = "http://localhost:3000/api/getchanges?localid=";
    var OK = 42; //success code

     //need to check if ready first before using cordova plugins
     $ionicPlatform.ready(function() {
       //ConnectivityMonitor.startWatching(); !!!research use
       if(ConnectivityMonitor.isOffline()) {

      /*   $ionicPopup.confirm({
           title: 'No Internet Connection',
           content: 'Sorry, no Internet connectivity detected. Please reconnect and try again.'
         })
         .then(function(result) {
           if(!result) {
             //ionic.Platform.exitApp();
             console.log('cancelled');
           }
         }); */

         console.log("OFFLINE");
       }else{
         //!!!change from BASETEST to BASE in prod
         $http.get(BASETEST + facilityService.getCurrentVersion()).then(function(resp) {
           var respObj = resp.data;

           if(respObj != OK){
             //if there are changes
             for(var i=0; i<Object.keys(respObj).length; i++){
               var key = Object.keys(respObj)[i];
               var value = respObj[key];
               var fid = Object.keys(value)[0];
               var fvalue = value[fid];

               //set last key to new local current version
               if(i == Object.keys(respObj).length - 1){
                 facilityService.setCurrentVersion(key);
               }

               if(fvalue == "D"){
                 facilityService.destroyFacility(fid);
               }else{
                 facilityService.createOrUpdateFacility(fid, fvalue);
               }
             }//end for loop
           }
         }), function(err) {
           console.error('HTTP ERR', err);
         // err.status will contain the status code
         }; //end of $http.get...
         console.log("ONLINE");
       }
     }); //end connectivity check

  $scope.getCategory = function(category){
    facilityService.setServiceArr(category);
  }

})

.controller('linkVanFilteredCtrl', function($scope, $state, $cordovaGeolocation, $location, $http, $ionicLoading, facilityService) {

  console.log(facilityService.getNearYes());

  console.log(facilityService.getNearNo());

  console.log(facilityService.getNameYes());

  console.log(facilityService.getNameNo());

  $ionicLoading.show({
    template: 'finding facilities'
  });
  $cordovaGeolocation.getCurrentPosition().then(function(position){
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    var category = $location.search().category;
    var BASE = 'https://linkvan.herokuapp.com/api/facilities/filter/';
    var nearyes, nearno, nameyes, nameno;
    var nearyesdistances, nearnodistances, nameyesdistances, namenodistances;

    //build query

    $http.get(BASE + category + '/?latitude=' + latitude + '&longitude=' + longitude).then(function(resp) {
      //console.log("RESP DATA = " + JSON.stringify(angular.fromJson(resp).data));
      //$scope.facilities = angular.fromJson(resp).data.nearyes;
      nearyes = angular.fromJson(resp).data.nearyes;
      nearno = angular.fromJson(resp).data.nearno;
      nameyes = angular.fromJson(resp).data.nameyes;
      nameno = angular.fromJson(resp).data.nameno;

      nearyesdistances = angular.fromJson(resp).data.nearyesdistances;
      nearnodistances = angular.fromJson(resp).data.nearnodistances;
      nameyesdistances = angular.fromJson(resp).data.nameyesdistances;
      namenodistances = angular.fromJson(resp).data.namenodistances;

      $scope.nearyesfinal = [];
      $scope.nearnofinal = [];
      $scope.nameyesfinal = [];
      $scope.namenofinal = [];
      $scope.facilitiesdisplayed = [];

      for(var i=0; i<nearyes.length; i++){
        $scope.nearyesfinal.push({
            name: nearyes[i].name,
            distance: nearyesdistances[i].toFixed(2),
            services: nearyes[i].services,
            id: nearyes[i].id
        });
      }

      for(var i=0; i<nearno.length; i++){
        $scope.nearnofinal.push({
            name: nearno[i].name,
            distance: nearnodistances[i].toFixed(2),
            services: nearno[i].services,
            id: nearno[i].id
        });
      }

      for(var i=0; i<nameyes.length; i++){
        $scope.nameyesfinal.push({
            name: nameyes[i].name,
            distance: nameyesdistances[i].toFixed(2),
            services: nameyes[i].services,
            id: nameyes[i].id
        });
      }

      for(var i=0; i<nameno.length; i++){
        $scope.namenofinal.push({
            name: nameno[i].name,
            distance: namenodistances[i].toFixed(2),
            services: nameno[i].services,
            id: nameno[i].id
        });
      }

      $scope.facilitiesdisplayed = $scope.nearyesfinal;


      $ionicLoading.hide();

      $scope.settingsList = [
        { text: "Nearby", checked: true },
        { text: "Open", checked: true }
      ];

      $scope.toggleChange = function(){
        var near = $scope.settingsList[0].checked;
        var open = $scope.settingsList[1].checked;

        if(near && open){
          $scope.facilitiesdisplayed = $scope.nearyesfinal;
        }else if(near && !open){
          $scope.facilitiesdisplayed = $scope.nearnofinal;
        }else if(!near && open){
          $scope.facilitiesdisplayed = $scope.nameyesfinal;
        }else{
          $scope.facilitiesdisplayed = $scope.namenofinal;
        }
      }

    }), function(err) {
      console.error('HTTP ERR', err);
    // err.status will contain the status code
    }; //end of $http.get...




  }, function(error){
    console.log("Could not get location");
  }) //ends $cordovaGeolocation.getCurrentPosition...





})

.controller('linkVanShowCtrl', function($scope, $state, $cordovaGeolocation, $location, $http, $ionicLoading, $ionicHistory) {

  var id = $location.search().id;
  var BASE = "https://linkvan.herokuapp.com/api/facilities/";

  $ionicLoading.show({
    template: 'loading facility'
  });

  $http.get(BASE + id).then(function(resp) {
    //console.log("RESP DATA = " + JSON.stringify(angular.fromJson(resp).data));
    //$scope.facilities = angular.fromJson(resp).data.nearyes;
    $scope.facility = angular.fromJson(resp).data;
    console.log($scope.facility.endsmon_at2);

    //converts from 2000-01-01T23:59:00.000Z format to 23:59
    function pretty(rawtime){
      if(rawtime){
        var ampm;
        var timearr = rawtime.slice(rawtime.indexOf("T")+1).split(":");

        if(timearr[0] == 12){
          ampm = "PM";
        }else if(timearr[0] > 12){
          ampm = "PM";
          timearr[0] -= 12;
        }else{
          ampm = "AM";
        }
        return timearr[0] + ":" + timearr[1] + ampm;
      }else{
        return rawtime;
      }
    }

    function parseHours(dayOfWeek){
      switch(dayOfWeek){
        case "mon":
          if($scope.facility.open_all_day_mon){
            $scope.mon = "OPEN";
          }else if($scope.facility.closed_all_day_mon){
            $scope.mon = "CLOSED";
          }else if($scope.facility.closed_all_day_mon === null && $scope.facility.open_all_day_mon === null){
            $scope.mon = "CLOSED";
            console.log("ERROR: mon hours is null");
          }else if($scope.facility.second_time_mon){
            $scope.mon = pretty($scope.facility.startsmon_at) + " to " + pretty($scope.facility.endsmon_at) + " and " + pretty($scope.facility.startsmon_at2) + " to " + pretty($scope.facility.endsmon_at2);
          }else{
            $scope.mon = pretty($scope.facility.startsmon_at) + " to " + pretty($scope.facility.endsmon_at);
          }
          break;
        case "tues":
          if($scope.facility.open_all_day_tues){
            $scope.tues = "OPEN";
          }else if($scope.facility.closed_all_day_tues){
            $scope.tues = "CLOSED";
          }else if($scope.facility.closed_all_day_tues === null && $scope.facility.open_all_day_tues === null){
            $scope.tues = "CLOSED";
            console.log("ERROR: tues hours is null");
          }else if($scope.facility.second_time_tues){
            $scope.tues = pretty($scope.facility.startstues_at) + " to " + pretty($scope.facility.endstues_at) + " and " + pretty($scope.facility.startstues_at2) + " to " + pretty($scope.facility.endstues_at2);
          }else{
            $scope.tues = pretty($scope.facility.startstues_at) + " to " + pretty($scope.facility.endstues_at);
          }
          break;
        case "wed":
          if($scope.facility.open_all_day_wed){
            $scope.wed = "OPEN";
          }else if($scope.facility.closed_all_day_wed){
            $scope.wed = "CLOSED";
          }else if($scope.facility.closed_all_day_wed === null && $scope.facility.open_all_day_wed === null){
            $scope.wed = "CLOSED";
            console.log("ERROR: wed hours is null");
          }else if($scope.facility.second_time_wed){
            $scope.wed = pretty($scope.facility.startswed_at) + " to " + pretty($scope.facility.endswed_at) + " and " + pretty($scope.facility.startswed_at2) + " to " + pretty($scope.facility.endswed_at2);
          }else{
            $scope.wed = pretty($scope.facility.startswed_at) + " to " + pretty($scope.facility.endswed_at);
          }
          break;
        case "thurs":
          if($scope.facility.open_all_day_thurs){
            $scope.thurs = "OPEN";
          }else if($scope.facility.closed_all_day_thurs){
            $scope.thurs = "CLOSED";
          }else if($scope.facility.closed_all_day_thurs === null && $scope.facility.open_all_day_thurs === null){
            $scope.thurs = "CLOSED";
            console.log("ERROR: thurs hours is null");
          }else if($scope.facility.second_time_thurs){
            $scope.thurs = pretty($scope.facility.startsthurs_at) + " to " + pretty($scope.facility.endsthurs_at) + " and " + pretty($scope.facility.startsthurs_at2) + " to " + pretty($scope.facility.endsthurs_at2);
          }else{
            $scope.thurs = pretty($scope.facility.startsthurs_at) + " to " + pretty($scope.facility.endsthurs_at);
          }
          break;
        case "fri":
          if($scope.facility.open_all_day_fri){
            $scope.fri = "OPEN";
          }else if($scope.facility.closed_all_day_fri){
            $scope.fri = "CLOSED";
          }else if($scope.facility.closed_all_day_fri === null && $scope.facility.open_all_day_fri === null){
            $scope.fri = "CLOSED";
            console.log("ERROR: fri hours is null");
          }else if($scope.facility.second_time_fri){
            $scope.fri = pretty($scope.facility.startsfri_at) + " to " + pretty($scope.facility.endsfri_at) + " and " + pretty($scope.facility.startsfri_at2) + " to " + pretty($scope.facility.endsfri_at2);
          }else{
            $scope.fri = pretty($scope.facility.startsfri_at) + " to " + pretty($scope.facility.endsfri_at);
          }
          break;
        case "sat":
          if($scope.facility.open_all_day_sat){
            $scope.sat = "OPEN";
          }else if($scope.facility.closed_all_day_sat){
            $scope.sat = "CLOSED";
          }else if($scope.facility.closed_all_day_sat === null && $scope.facility.open_all_day_sat === null){
            $scope.sat = "CLOSED";
            console.log("ERROR: sat hours is null");
          }else if($scope.facility.second_time_sat){
            $scope.sat = pretty($scope.facility.startssat_at) + " to " + pretty($scope.facility.endssat_at) + " and " + pretty($scope.facility.startssat_at2) + " to " + pretty($scope.facility.endssat_at2);
          }else{
            $scope.sat = pretty($scope.facility.startssat_at) + " to " + pretty($scope.facility.endssat_at);
          }
          break;
        case "sun":
          if($scope.facility.open_all_day_sun){
            $scope.sun = "OPEN";
          }else if($scope.facility.closed_all_day_sun){
            $scope.sun = "CLOSED";
          }else if($scope.facility.closed_all_day_sun === null && $scope.facility.open_all_day_sun === null){
            $scope.sun = "CLOSED";
            console.log("ERROR: sun hours is null");
          }else if($scope.facility.second_time_sun){
            $scope.sun = pretty($scope.facility.startssun_at) + " to " + pretty($scope.facility.endssun_at) + " and " + pretty($scope.facility.startssun_at2) + " to " + pretty($scope.facility.endssun_at2);
          }else{
            $scope.sun = pretty($scope.facility.startssun_at) + " to " + pretty($scope.facility.endssun_at);
          }

          break;
      }
    }

    parseHours("mon");
    parseHours("tues");
    parseHours("wed");
    parseHours("thurs");
    parseHours("fri");
    parseHours("sat");
    parseHours("sun");

    var latLng = new google.maps.LatLng($scope.facility.lat, $scope.facility.long);
    var mapOptions = {
      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
    var marker = new google.maps.Marker({
      map: $scope.map,
      animation: google.maps.Animation.DROP,
      position: latLng
    });

    $ionicLoading.hide();



    console.log($scope.facility);

  }), function(err) {
    console.error('HTTP ERR', err);
  // err.status will contain the status code
  };

  $scope.goDirections = function(){
    window.location = "#/directions?id=" + $scope.facility.id + "&name=" + $scope.facility.name + "&lat=" + $scope.facility.lat + "&long=" + $scope.facility.long;
  }



}) //end of show controller

.controller('linkVanDirectionsCtrl', function($http, $scope, $location, $ionicLoading, $cordovaGeolocation, $state, $ionicHistory) {
  var options = {timeout: 10000, enableHighAccuracy: true};
  var id = $location.search().id;
  var name = $location.search().name;
  var flat = $location.search().lat;
  var flong = $location.search().long;
  var ulat, ulong;

  $ionicLoading.show({
    template: 'loading directions'
  });

  $cordovaGeolocation.getCurrentPosition().then(function(position){
    ulat = position.coords.latitude;
    ulong = position.coords.longitude;

    var directionsDisplay, start, end;
    var directionsService = new google.maps.DirectionsService();
    var woodwards = new google.maps.LatLng(49.2825437, -123.1085684);
    var carnegie = new google.maps.LatLng(49.280966, -123.099672);
    var saller = new google.maps.LatLng(49.283799, -123.096927);
    var oppenheimer = new google.maps.LatLng(49.2827075, -123.0954157);
    var raycam = new google.maps.LatLng(49.281415, -123.083726);

    //YO HOST THESE ASSETS
    var landmark = 'https://linkvan.herokuapp.com/assets/blue_dot-389fca422ef93e351134817e9c5b67d4.png';
    var woodwardslandmark = 'https://linkvan.herokuapp.com/assets/woodward_marker-1496bd72f1b6cfe8285091f21f445279.png';
    var carnegielandmark = 'https://linkvan.herokuapp.com/assets/carnegie_marker-d0cc46c1b6eaf99e478071e993a3a256.png';
    var sallerlandmark = 'https://linkvan.herokuapp.com/assets/saller_marker-3b815fb050847f188c99866ab696f1a8.png';
    var oppenheimerlandmark = 'https://linkvan.herokuapp.com/assets/oppenheimer_marker-2f34ab471c89ca261f7d9949312e342d.png';
    var raycamlandmark = 'https://linkvan.herokuapp.com/assets/raycam_marker-3a80591adfb60c88a00f6eea0ac5bd2e.png';

    directionsDisplay = new google.maps.DirectionsRenderer();
    start = new google.maps.LatLng(ulat, ulong);
    end = new google.maps.LatLng(flat, flong);

    var mapOptions = {
      zoom: 14,
      center: start
    };

    $scope.map = new google.maps.Map(document.getElementById('map2'), mapOptions);

    woodwardsmarker = new google.maps.Marker({
      position: woodwards,
      map: $scope.map,
      icon: woodwardslandmark,
    });


    carnegiemarker = new google.maps.Marker({
      position: carnegie,
      map: $scope.map,
      icon: carnegielandmark,
    });

    sallermarker = new google.maps.Marker({
      position: saller,
      map: $scope.map,
      icon: sallerlandmark,
    });

    oppenheimermarker = new google.maps.Marker({
      position: oppenheimer,
      map: $scope.map,
      icon: oppenheimerlandmark,
    });

    raycammarker = new google.maps.Marker({
      position: raycam,
      map: $scope.map,
      icon: raycamlandmark,
    });


    google.maps.event.addListener($scope.map, 'zoom_changed', function() {
      var zoom = $scope.map.getZoom(); //fully zoomed out = 0

      if (zoom <= 13) {
        woodwardsmarker.setMap(null);
        carnegiemarker.setMap(null);
        sallermarker.setMap(null);
        oppenheimermarker.setMap(null);
        raycammarker.setMap(null);
      } else {
        woodwardsmarker.setMap($scope.map);
        carnegiemarker.setMap($scope.map);
        sallermarker.setMap($scope.map);
        oppenheimermarker.setMap($scope.map);
        raycammarker.setMap($scope.map);
    }
    });

    $scope.travelList = [
      { text: "WALKING", selected: true },
      { text: "TRANSIT", selected: false },
      { text: "BICYCLING", selected: false },
      { text: "DRIVING", selected: false }
    ];

    //define below so first menu option shows WALKING instead of empty
    $scope.travel = $scope.travelList[0];

    calcRoute($scope.travel.text);

    console.log("zoom level = " + $scope.map.getZoom());

    function calcRoute(travel){
      var request = {
          origin: start,
          destination: end,
          travelMode: google.maps.TravelMode[travel]
      };
      console.log("request = " + request.travelMode);
      directionsService.route(request, function(response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
          directionsDisplay.setDirections(response);
          //$scope.map.fitBounds(new google.maps.LatLngBounds(start, end));
        }
      });
      directionsDisplay.setMap($scope.map);
    }

    $scope.changeTravel = function(travel){
      console.log("calling calcRoute with " + travel);
      calcRoute(travel);
    }

    $ionicLoading.hide();


    //FIX DR. PETE HOURS
    //need to refresh for map to load -- done! $scope.map needs to get map2
    //fix centering after route displayed


  }, function(error){
    console.log("Could not get location");
  })

})

.controller('linkVanAboutUsCtrl', function($scope) {

})

.controller('linkVanDisclaimerCtrl', function($scope) {

})

.controller('linkVanSearchCtrl', function($scope) {

})

.controller('linkVanCrisisLinesCtrl', function($scope) {

})

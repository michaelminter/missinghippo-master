var map;
var markers = {};
var infowindow = new google.maps.InfoWindow({});

$(function(){
  $("#map_canvas").height($('.ui-page').height() - 57);
});

function success(position) {
  var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

  $('#flier_latitude').val(position.coords.latitude);
  $('#flier_longitude').val(position.coords.longitude);

  var myOptions = {
    zoom: 15,
    scrollwheel: true,
    center: latlng,
    scaleControl: true,
    MapTypeControlStyle: 'DROPDOWN_MENU',
    navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

  var styles = [
    {
      featureType: 'all',
      stylers: [
        { saturation: -100 },
        { gamma: 0.99 },
        { lightness: 60 }
      ]
    },{
      featureType: "poi",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    },{
      featureType: 'poi.park',
      stylers: [
        { hue: "#14CC00" },
        { saturation: 30 },
        { gamma: 0.50 },
        { lightness: 0 }
      ]
    },{
      featureType: 'poi.park',
      elementType: 'labels',
      stylers: [
        { visibility: 'on' }
      ]
    }
  ];
  map.setOptions({styles: styles});

  //addMarker(latlng, 'Home', '/image/icons/retro-home.png', 'default', '');

  load_pets();

  google.maps.event.addListener(map, 'mouseup', function(event) {
    load_pets();

    $('#flier_latitude').val(map.getCenter().lat());
    $('#flier_longitude').val(map.getCenter().lng());
  });
}

function error() {
  // disneyland
  var latlng = new google.maps.LatLng(33.8090, -117.9190);

  $('#flier_latitude').val(33.8090);
  $('#flier_longitude').val(-117.9190);

  var myOptions = {
    zoom: 15,
    scrollwheel: true,
    center: latlng,
    scaleControl: true,
    MapTypeControlStyle: 'DROPDOWN_MENU',
    navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

  var styles = [
    {
      featureType: 'all',
      stylers: [
        { saturation: -100 },
        { gamma: 0.99 },
        { lightness: 60 }
      ]
    },{
      featureType: "poi",
      elementType: "labels",
      stylers: [
        { visibility: "off" }
      ]
    },{
      featureType: 'poi.park',
      stylers: [
        { hue: "#14CC00" },
        { saturation: 30 },
        { gamma: 0.50 },
        { lightness: 0 }
      ]
    },{
      featureType: 'poi.park',
      elementType: 'labels',
      stylers: [
        { visibility: 'on' }
      ]
    }
  ];
  map.setOptions({styles: styles});

  //addMarker(latlng, 'Home', '/image/icons/retro-home.png', 'default', '');

  load_pets();

  google.maps.event.addListener(map, 'mouseup', function(event) {
    load_pets();

    $('#flier_latitude').val(map.getCenter().lat());
    $('#flier_longitude').val(map.getCenter().lng());
  });
}

function addMarker(location, title, icon, group, reference, address) {
  address = address || null;

  marker = new google.maps.Marker({
    position: location,
    map: map,
    title: title,
    icon: icon,
    reference: reference
  });
  try {
    markers[group].push(marker);
  }
  catch(err) {
    markers[group] = Array(marker);
  }
  var flier = jQuery.parseJSON(reference);

  var content = '<img src="http://res.cloudinary.com/' + CLOUDINARY_ID + '/image/upload/w_150,h_100,c_fill/' + flier.image_id + '.' + flier.image_format + '" width="100%" /><br /><strong>' + flier.name + '</strong><br />' + flier.breed + '<br /><br /><button onclick="open_contact_dialog(); return false;" id="confirm-contact-button" data-theme="a">Notify Owner</button></button>';

  //$('#confirm-contact-button').button('refresh');

  google.maps.event.addListener(markers[group][markers[group].length-1], 'click', function() {
    var place = this;

//    if (place.reference != '') {
//      var $request = $.ajax({
//        url: "/api/v1/location/" + place.reference,
//        type: "POST",
//        dataType: "JSON"
//      });
//      $request.success(function(data){
//        if (data.result.formatted_phone_number != null) {
//          content = content + '<br><br>' + data.result.formatted_phone_number;
//        }
//        if (data.result.website != null) {
//          content = content + '<br><a href="' + data.result.website + '" target="_blank">Website</a>';
//        }
//        infowindow.setContent(content);
//        infowindow.open(map, place);
//      });
//    } else {
//      infowindow.setContent(content);
//      infowindow.open(map, place);
//    }
    infowindow.setContent(content);
    infowindow.open(map, place);

    //$('#confirm-contact-button').button('refresh');

    localStorage.setItem('last_clicked', place.reference);

    // $.mobile.changePage('#report-dialog', {transition: 'pop', role: 'dialog'});
  });
}

// Removes the overlays from the map, but keeps them in the array
//function clearOverlays(group) {
//  if (markers[group]) {
//    for (i in markers[group]) {
//      markers[group][i].setMap(null);
//    }
//  }
//}
//
//// Shows any overlays currently in the array
//function showOverlays(group) {
//  if (markers[group]) {
//    for (i in markers[group]) {
//      markers[group][i].setMap(map);
//    }
//  }
//}
//
//// Deletes all markers in the array by removing references to them
//function deleteOverlays(group) {
//  if (markers[group]) {
//    for (var i in markers[group]) {
//      markers[group][i].setMap(null);
//    }
//    markers.length = 0;
//  }
//}

//function loadLocations() {
//  var lat = map.getCenter().lat();
//  var lng = map.getCenter().lng();
//
//  var $request = $.ajax({
//    url: "/api/v1/locations",
//    type: "POST",
//    data: { latitude: lat, longitude: lng, options: ['veterinary_clinics','pet_stores','animal_shelters'] },
//    dataType: "JSON"
//  });
//
//  $request.success(function(datas) {
//    if (datas.veterinary_clinics != null) {
//      for (var i in datas.veterinary_clinics.results) {
//        var facility = datas.veterinary_clinics.results[i];
//        if (facility.geometry != null) {
//          var location = new google.maps.LatLng(facility.geometry.location.lat, facility.geometry.location.lng);
//          addMarker(location, facility.name, '/image/icons/retro-vet.png', 'veterinary_clinics', facility.reference, facility.vicinity);
//        }
//      }
//    }
//    if (datas.pet_stores != null) {
//      for (var i in datas.pet_stores.results) {
//        var data     = datas.pet_stores.results[i];
//        if (data.geometry != null) {
//          var location = new google.maps.LatLng(data.geometry.location.lat, data.geometry.location.lng);
//          addMarker(location, data.name, '/image/icons/retro-bag.png', 'pet_stores', data.reference, data.vicinity);
//        }
//      }
//    }
//    if (datas.animal_shelters != null) {
//      for (var i in datas.animal_shelters.results) {
//        var data     = datas.animal_shelters.results[i];
//        if (data.geometry != null) {
//          var location = new google.maps.LatLng(data.geometry.location.lat, data.geometry.location.lng);
//          addMarker(location, data.name, '/image/icons/retro-shelter.png', 'animal_shelters', data.reference, data.vicinity);
//        }
//      }
//    }
//  });
//}

function load_pets() {
  var lat = map.getCenter().lat();
  var lng = map.getCenter().lng();

  var $request = $.ajax({
    url: "/api/v1/pets",
    type: "POST",
    data: { latitude: lat, longitude: lng },
    dataType: "JSON"
  });

  $request.success(function(datas) {
    for (var i in datas) {
      flier = datas[i];
      var location = new google.maps.LatLng(flier.latitude, flier.longitude);
      if (flier.image_url != null) {
        addMarker(location, flier.name, 'http://res.cloudinary.com/' + CLOUDINARY_ID + '/image/upload/w_48,h_48,c_fill,f_png,r_max/' + flier.image_id + '.' + flier.image_format, 'pets', JSON.stringify(flier), '');
      } else {
        // addMarker(location, flier.name, '/image/icons/retro-dog.png', 'pets', '', '');
      }
    }
//    if (datas.veterinary_clinics != null) {
//      for (var i in datas.veterinary_clinics.results) {
//        var facility = datas.veterinary_clinics.results[i];
//        if (facility.geometry != null) {
//          var location = new google.maps.LatLng(facility.geometry.location.lat, facility.geometry.location.lng);
//          addMarker(location, facility.name, '/image/icons/retro-vet.png', 'veterinary_clinics', facility.reference, facility.vicinity);
//        }
//      }
//    }
//    if (datas.pet_stores != null) {
//      for (var i in datas.pet_stores.results) {
//        var data     = datas.pet_stores.results[i];
//        if (data.geometry != null) {
//          var location = new google.maps.LatLng(data.geometry.location.lat, data.geometry.location.lng);
//          addMarker(location, data.name, '/image/icons/retro-bag.png', 'pet_stores', data.reference, data.vicinity);
//        }
//      }
//    }
//    if (datas.animal_shelters != null) {
//      for (var i in datas.animal_shelters.results) {
//        var data     = datas.animal_shelters.results[i];
//        if (data.geometry != null) {
//          var location = new google.maps.LatLng(data.geometry.location.lat, data.geometry.location.lng);
//          addMarker(location, data.name, '/image/icons/retro-shelter.png', 'animal_shelters', data.reference, data.vicinity);
//        }
//      }
//    }
  });
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(success, error);
} else {
  error();
}

$('.map-form-checkbox').click(function(){
  if ($(this)[0].checked == true) {
    showOverlays($(this).data('group'));
  } else {
    clearOverlays($(this).data('group'));
  }
});

$('#map-form-submit-button').click(function(){
  return false;
});

function miles_to_meters(miles) {
  var meters = miles * 1609.344;
  return meters;
}

function geocode_zip_code(zip_code) {
  // https://developers.google.com/maps/documentation/geocoding/
}

function progressHandlingFunction(e) {
  if (e.lengthComputable) {
    var done = e.position || e.loaded, total = e.totalSize || e.total;
    // $('#progress').show().html('Image Upload: ' + done + ' / ' + total + ' = ' + (Math.floor(done/total*1000)/10) + '%');
  }
}

function create_flier() {
  $('#submit-flier-button').html('PROCESSING...');

  // $('#errors-container').hide().find('ul').html('');

  var form_data = new FormData($('#flier_form')[0]);

  var $request = $.ajax({ url: '/', cache: false, type: 'POST', dataType: 'JSON', data: form_data, contentType: false, processData: false, xhr: function() {  // custom xhr
    var myXhr = $.ajaxSettings.xhr();
    if (myXhr.upload) { // check if upload property exists
      myXhr.upload.addEventListener('progress', progressHandlingFunction, false); // for handling the progress of the upload
    }
    return myXhr;
  } });

  $request.success(function(data){
    if (data.errors) {
      // console.log(data.errors);
//      $('#errors-container').show();
//      for (var i in data.errors) {
//        $('#errors-container').find('ul').append('<li>' + data.errors[i] + '</li>');
//      }
    } else {
      localStorage.setItem('last_flier_generated', data.uri);

      $('#submit-flier-button').html('CREATE FLIER');

      var location = new google.maps.LatLng(data.latitude, data.longitude);

      addMarker(location, data.name, 'http://res.cloudinary.com/' + CLOUDINARY_ID + '/image/upload/w_48,h_48,c_fill,f_png,r_max/' + data.image_id + '.' + data.image_format, 'pets', JSON.stringify(data), '');

      $.mobile.changePage('#map-page');

      load_pets();

      _gaq.push(['_trackEvent', 'create', 'flier', '99']);
    }
  });

  $request.error(function(){
    console.log('something went wrong');
  });

  return false;
}

function open_contact_dialog() {
  $.mobile.changePage('#report-dialog', {transition: 'pop', role: 'dialog'});
}

function report(type) {
  var flier = jQuery.parseJSON(localStorage.getItem('last_clicked'));
  var id    = flier.id;

  var form_data = new FormData($('#report_form')[0]);

  var $request = $.ajax({ url: '/api/v1/report/' + id + '/' + type, cache: false, type: 'POST', dataType: 'JSON', data: form_data, contentType: false, processData: false, xhr: function() {  // custom xhr
    var myXhr = $.ajaxSettings.xhr();
    if (myXhr.upload) { // check if upload property exists
      myXhr.upload.addEventListener('progress', progressHandlingFunction, false); // for handling the progress of the upload
    }
    return myXhr;
  } });

  $request.success(function(datas) {
    $.mobile.changePage('#map-page');
  });
}

function join_network() {
  var form = document.getElementById('join_form');

  var form_data = new FormData(form);

  var $request = $.ajax({ url: '/join', processData: false, contentType: false, type: 'POST', dataType: 'JSON', data: form_data });

  $request.success(function(data) {

  });

  $request.always(function(data){
    $.mobile.changePage('#map-page');
  });
}

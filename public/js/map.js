var map;
var markers = {};
var infowindow = new google.maps.InfoWindow({});
var highestZIndex = 100;

$(function(){
  $( window ).resize(function() {
    $("#map_canvas").height($(window).height() - 124);
  });

  $("#map_canvas").height($(window).height() - 124);

  if (supports_local_storage()) {
    if (localStorage['shown-getting-started-modal'] == null) {
      $('#getting-started-modal').modal('show');
    }
  } else {
    $('#getting-started-modal').modal('show');
  }

  $('#getting-started-modal').on('hidden.bs.modal', function (e) {
    if (supports_local_storage()) {
      localStorage.setItem('shown-getting-started-modal', 1);
    }
  });

  $('#clickable-help-icon').click(function(){
    $('#getting-started-modal').modal('show');
  });

  $('input[name=found]').change(function(){
    if ($('input[name=found]:checked').val() == 'true') {
      $('#flier_name_wrapper').hide();
      $('#flier_breed_wrapper').hide();
      $('#flier_gender_wrapper').hide();
      $('#flier_age_wrapper').hide();
      $('#flier_color_wrapper').hide();
      $('#flier_reward_wrapper').hide();
    } else {
      $('#flier_name_wrapper').show();
      $('#flier_breed_wrapper').show();
      $('#flier_gender_wrapper').show();
      $('#flier_age_wrapper').show();
      $('#flier_color_wrapper').show();
      $('#flier_reward_wrapper').show();
    }
  });

  $('#ad-container-hide-button').click(function(){
    $('#map-overlay-ad-container').hide();
  });
});

function success(position) {
  var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

  var myOptions = {
    zoom: 14,
    scrollwheel: false,
    center: latlng,
    scaleControl: true,
    MapTypeControlStyle: 'DROPDOWN_MENU',
    navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);

  var styles = [
      // https://developers.google.com/maps/documentation/javascript/reference#MapTypeStyleFeatureType
//    {
//      stylers: [
//        { hue: "#00ffe6" },
//        { saturation: -20 }
//      ]
//    },{
//      featureType: "road",
//      elementType: "geometry",
//      stylers: [
//        { lightness: 100 },
//        { visibility: "simplified" }
//      ]
//    },{
//      featureType: "road",
//      elementType: "labels",
//      stylers: [
//        { visibility: "off" }
//      ]
//    }
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

  // addMarker(latlng, 'Home', '/image/icons/retro-home.png', 'default', '');

  loadLocations();
  load_pets();

  $('#flier_latitude').val(position.coords.latitude);
  $('#flier_longitude').val(position.coords.longitude);

  google.maps.event.addListener(map, 'mouseup', function(event) {
    loadLocations();
    load_pets();

    $('#flier_latitude').val(map.getCenter().lat());
    $('#flier_longitude').val(map.getCenter().lng());
  });
}

function error() {
  // disneyland
  var latlng = new google.maps.LatLng(33.8090, -117.9190);

  var myOptions = {
    zoom: 14,
    scrollwheel: false,
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

  // addMarker(latlng, 'Home', '/image/icons/retro-home.png', 'default', '');

  loadLocations();
  load_pets();

  $('#flier_latitude').val(33.8090);
  $('#flier_longitude').val(-117.9190);

  google.maps.event.addListener(map, 'mouseup', function(event) {
    loadLocations();
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
    reference: reference,
    zIndex: (group == 'pets' ? 99 : 1)
  });
  try {
    markers[group].push(marker);
  }
  catch(err) {
    markers[group] = Array(marker);
  }

  if (group == 'pets') {
    var flier = jQuery.parseJSON(reference);

    var content = (flier.image_id == null ? '' : '<img src="http://res.cloudinary.com/' + CLOUDINARY_ID + '/image/upload/w_150,h_100/' + flier.image_id + '.' + flier.image_format + '" width="100%" /><br />') + '<strong>' + flier.name + '</strong>' + (flier.reward == true ? ' <img src="/image/icons/dollar.png" alt="USD" height="10" width="10" />' : '') + '<br />' + (flier.gender == '' ? '' : (flier.gender == 1 ? 'Male ' : 'Female ')) + flier.breed + '<br /><br />' + (flier.location == '' ? '' : flier.location + '<br /><br />') + '<button onclick="open_contact_dialog(); return false;" id="confirm-contact-button" data-theme="a">Contact Poster</button></button>';

    google.maps.event.addListener(markers[group][markers[group].length-1], 'click', function() {
      var place = this;

      place.setOptions({ zIndex : get_highest_zindex() });

      infowindow.setContent(content);
      infowindow.open(map, place);

      localStorage.setItem('last_clicked', place.reference);
    });
  } else {
    var content = '<strong>' + title + '</strong>';
    if (address != null) {
      content = content + '<br>' + address;
    }

    google.maps.event.addListener(markers[group][markers[group].length-1], 'click', function() {
      var place = this;

      place.setOptions({ zIndex : get_highest_zindex() });

      if (place.reference != '') {
        var $request = $.ajax({
          url: "/api/v1/location/" + place.reference,
          type: "POST",
          dataType: "JSON"
        });
        $request.success(function(data){
          if (data.result.formatted_phone_number != null) {
            content = content + '<br><br>' + data.result.formatted_phone_number;
          }
          if (data.result.website != null) {
            content = content + '<br><a href="' + data.result.website + '" target="_blank">Website</a>';
          }
          infowindow.setContent(content);
          infowindow.open(map, place);
        });
      } else {
        infowindow.setContent(content);
        infowindow.open(map, place);
      }
    });
  }
}

// Removes the overlays from the map, but keeps them in the array
function clearOverlays(group) {
  if (markers[group]) {
    for (i in markers[group]) {
      markers[group][i].setMap(null);
    }
  }
}

// Shows any overlays currently in the array
function showOverlays(group) {
  if (markers[group]) {
    for (i in markers[group]) {
      markers[group][i].setMap(map);
    }
  }
}

// Deletes all markers in the array by removing references to them
function deleteOverlays(group) {
  if (markers[group]) {
    for (var i in markers[group]) {
      markers[group][i].setMap(null);
    }
    markers.length = 0;
  }
}

function loadLocations() {
  var lat = map.getCenter().lat();
  var lng = map.getCenter().lng();

  var $request = $.ajax({
    url: "/api/v1/locations",
    type: "POST",
    data: { latitude: lat, longitude: lng, options: ['veterinary_clinics','pet_stores','animal_shelters'] },
    dataType: "JSON"
  });

  $request.success(function(datas) {
    if (datas.veterinary_clinics != null) {
      for (var i in datas.veterinary_clinics.results) {
        var facility = datas.veterinary_clinics.results[i];
        if (facility.geometry != null) {
          var location = new google.maps.LatLng(facility.geometry.location.lat, facility.geometry.location.lng);
          addMarker(location, facility.name, '/image/icons/retro-vet.png', 'veterinary_clinics', facility.reference, facility.vicinity);
        }
      }
    }
    if (datas.pet_stores != null) {
      for (var i in datas.pet_stores.results) {
        var data     = datas.pet_stores.results[i];
        if (data.geometry != null) {
          var location = new google.maps.LatLng(data.geometry.location.lat, data.geometry.location.lng);
          addMarker(location, data.name, '/image/icons/retro-bag.png', 'pet_stores', data.reference, data.vicinity);
        }
      }
    }
    if (datas.animal_shelters != null) {
      for (var i in datas.animal_shelters.results) {
        var data     = datas.animal_shelters.results[i];
        if (data.geometry != null) {
          var location = new google.maps.LatLng(data.geometry.location.lat, data.geometry.location.lng);
          addMarker(location, data.name, '/image/icons/retro-shelter.png', 'animal_shelters', data.reference, data.vicinity);
        }
      }
    }
  });
}

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
      var flier    = datas[i];

      if (flier.id == null) continue;

      var location = new google.maps.LatLng(flier.latitude, flier.longitude);

      if (flier.image_url != null) {
        addMarker(location, flier.name, 'http://res.cloudinary.com/' + CLOUDINARY_ID + '/image/upload/w_48,h_48,c_fill,f_png,r_max/' + flier.image_id + '.' + flier.image_format, 'pets', JSON.stringify(flier), '');
      } else {
        switch(flier.type) {
          case 1:
            addMarker(location, flier.name, '/image/icons/retro-dog.png', 'pets', JSON.stringify(flier), '');
          case 2:
            addMarker(location, flier.name, '/image/icons/retro-cat.png', 'pets', JSON.stringify(flier), '');
          default:
            addMarker(location, flier.name, '/image/icons/retro-other.png', 'pets', JSON.stringify(flier), '');
        }
      }
    }
  });
}

function progressHandlingFunction(e) {
  if (e.lengthComputable) {
    var done = e.position || e.loaded, total = e.totalSize || e.total;
    // $('#progress').show().html('Image Upload: ' + done + ' / ' + total + ' = ' + (Math.floor(done/total*1000)/10) + '%');
  }
}

function create_flier() {
  $('.modal-errors').html('').hide();

  $("#map-create-flier-button").hide();

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
      $('.modal-errors').show();
      for (var i in data.errors) {
        if (typeof(data.errors[i]) != 'function') {
          $('.modal-errors').append('<li>' + data.errors[i] + '</li>');
        }
      }
    } else {
      $('#myModal').modal('hide');

      $('.modal-errors').html('').hide();

      localStorage.setItem('last_flier_generated', data.uri);

      document.getElementById("flier_form").reset();

      var location = new google.maps.LatLng(data.latitude, data.longitude);

      addMarker(location, data.name, 'http://res.cloudinary.com/' + CLOUDINARY_ID + '/image/upload/w_48,h_48,c_fill,f_png,r_max/' + data.image_id + '.' + data.image_format, 'pets', JSON.stringify(data), '');

      // load_pets();

      _gaq.push(['_trackEvent', 'create', 'flier', '99']);
    }
  });

  $request.error(function(){
    throw 'Can not connect to server';
  });

  $request.always(function(){
    $("#map-create-flier-button").show();
  });

  return false;
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
    document.getElementById("report_form").reset();
  });

  $request.always(function(datas) {
    $('#notify-owner-modal').modal('hide');
  });
}

function open_contact_dialog() {
  $('#notify-owner-modal').modal('show');
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

function get_highest_zindex() {
//  if (highestZIndex == 0) {
//    if (markers.length > 0) {
//      for (var i = 0; i < markers.length; i++) {
//        tempZIndex = markers[i].getZIndex();
//        if (tempZIndex>highestZIndex) {
//          highestZIndex = tempZIndex;
//        }
//      }
//    }
//  }
  highestZIndex = highestZIndex + 1;
  return highestZIndex;
}

function supports_local_storage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch(e){
    return false;
  }
}

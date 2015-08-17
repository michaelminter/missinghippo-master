$(function(){
  setInterval(function() {
    var elements = document.getElementById("poster_form").elements

    var attributes = [];

    var attr_accessible = ['zip_code','name','breed','gender','age','color','location','note','reward','contact_name','contact_phone','contact_email'];

    for (var key in elements) {
      if (attr_accessible.contains(elements[key].name)) {
        attributes.push('poster[' + elements[key].name + ']=' + elements[key].value);
      }
    }
    $('#preview-container').attr('src','/preview?' + attributes.join('&'));
  }, 5100);

  $('#poster_image').change(function(){
    // alert($(this));
  });

  if (localStorage.getItem('last_flier_generated') != null && localStorage.getItem('last_flier_generated') != '{}') {
    $('#last_generated_flier_container').show();
  }
});

Array.prototype.contains = function(obj) {
  var i = this.length;
  while (i--) {
    if (this[i] === obj) {
      return true;
    }
  }
  return false;
}

function progressHandlingFunction(e) {
  if (e.lengthComputable) {
    var done = e.position || e.loaded, total = e.totalSize || e.total;
    $('#progress').show().html('Image Upload: ' + done + ' / ' + total + ' = ' + (Math.floor(done/total*1000)/10) + '%');
  }
}

function generate_flier() {
  $('#abstract-create-flier-button').hide();

  document.getElementById("abstract-create-flier-button").disabled = true;

  $('#errors-container').hide().find('ul').html('');

  var form_data = new FormData($('#poster_form')[0]);

  var $request = $.ajax({ url: '/', cache: false, type: 'POST', dataType: 'JSON', data: form_data, contentType: false, processData: false, xhr: function() {  // custom xhr
    var myXhr = $.ajaxSettings.xhr();
    if (myXhr.upload) { // check if upload property exists
      myXhr.upload.addEventListener('progress', progressHandlingFunction, false); // for handling the progress of the upload
    }
    return myXhr;
  } });

  $request.success(function(data){
    if (data.errors) {
      $('#errors-container').show();
      for (var i in data.errors) {
        if (typeof(data.errors[i]) != 'function') {
          $('#errors-container').find('ul').append('<li>' + data.errors[i] + '</li>');
        }
      }
    } else {
      localStorage.setItem('last_flier_generated', data.uri);

      $('#download_button').show();
      $('#share_button').show();
    }
    document.getElementById("abstract-create-flier-button").disabled = false;

    $('#progress').hide().html('');
    $('#download_button').html('DOWNLOAD PDF');

    _gaq.push(['_trackEvent', 'create', 'flier', '99']);
  });

  $request.error(function(){
    console.log('something went wrong');
  });

  $request.always(function(){
    $('#abstract-create-flier-button').show();
  });

  return false;
}

function download_flier(uri) {
  uri = typeof uri !== 'undefined' ? uri : localStorage.getItem('last_flier_generated');
  window.open('/' + uri + '.pdf', '_blank');
}

function facebook_share() {
  last_flier_generated = localStorage.getItem('last_flier_generated') || null;

  if (last_flier_generated != null) {
    window.open(
        'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent('http://missinghippo.com/' + last_flier_generated + '.html'),
        'facebook-share-dialog',
        'width=626,height=436');
  } else {
    alert("Must create template.\n\nClick DOWNLOAD PDF to generate content and continue Sharing.");
  }
  return false;
}

function reset_flier_form() {
  document.getElementById("poster_form").reset();
}

//$('#download_button').click(function() {
//  $('#download_button').html('PROCESSING...');
//
//  $('#errors-container').hide().find('ul').html('');
//
//  var form_data = new FormData($('#poster_form')[0]);
//
//  var $request = $.ajax({ url: '/', cache: false, type: 'POST', dataType: 'JSON', data: form_data, contentType: false, processData: false, xhr: function() {  // custom xhr
//    var myXhr = $.ajaxSettings.xhr();
//    if (myXhr.upload) { // check if upload property exists
//      myXhr.upload.addEventListener('progress', progressHandlingFunction, false); // for handling the progress of the upload
//    }
//    return myXhr;
//  } });
//
//  $request.success(function(data){
//    if (data.errors) {
//      $('#errors-container').show();
//      for (var i in data.errors) {
//        $('#errors-container').find('ul').append('<li>' + data.errors[i] + '</li>');
//      }
//    } else {
//      localStorage.setItem('last_flier_generated', data.uri);
//      LAST_FLYER_URI = data.uri;
//      window.open('/' + data.uri + '.pdf', '_blank');
//    }
//    $('#progress').hide().html('');
//    $('#download_button').html('DOWNLOAD PDF');
//  });
//
//  $request.error(function(){
//    console.log('something went wrong');
//  });
//
//  return false;
//});

//var progress = setInterval(function() {
//  var $max_width = $('#progress-bar').width();
//  var $bar       = $('.bar');
//  var $percentage= ($bar.width() / $max_width) * 100;
//
//  if ($bar.width() >= $max_width) {
//    clearInterval(progress);
//    $('.progress').removeClass('active');
//    $bar.text('100%');
//  } else {
//    $bar.width($bar.width()+40);
//    $bar.text(Math.floor($percentage) + "%");
//  }
//}, 300);

//function progressScroll() {
//  $('.bar').animate({
//    width: '200%',
//    easing: 'linear'
//  }, 5000, function() {
//    console.log($(this));
//      $( this ).width(0);
//  });
//}


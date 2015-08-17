$('#contact_form').submit(function() {
//  var form_data = new FormData($('#join_form')[0]);

  var form      = document.getElementById('contact_form');
  var form_data = new FormData(form);
  var $request  = $.ajax({ url: '/contact', processData: false, contentType: false, type: 'POST', dataType: 'JSON', data: form_data });

  $request.success(function(data) {
    $('#contact_form')[0].reset();
    $('#contact_confirmation').show();
  });
  return false;
});
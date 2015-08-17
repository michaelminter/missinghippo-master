$('#join_form').submit(function() {
//  var form_data = new FormData($('#join_form')[0]);

  var form = document.getElementById('join_form');

  var form_data = new FormData(form);

  // var request = new XMLHttpRequest();

  // request.open('POST', '/join');

  // request.send(new FormData(form));

//  console.log(form_data.email);
//
  var $request = $.ajax({ url: '/join', processData: false, contentType: false, type: 'POST', dataType: 'JSON', data: form_data });

  // TODO => figure out why no work
  $request.success(function(data) {
    $('#join_confirmation').html('<p>Thank you for joining the Missing Hippo Network. Together we can reconnect families all over.</p>').show();
  });

  $request.always(function(data){
    $('#join_confirmation').html('<p>Thank you for joining the Missing Hippo Network. Together we can reconnect families all over.</p>').show();
  });

  return false;
});
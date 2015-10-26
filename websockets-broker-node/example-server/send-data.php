<?php

  header('content-type: text/plain');
  
  include('lib/http.request.php');
  $config = json_decode(file_get_contents('../example-config.json'), true);

  $data[] = array(
      'type' => 'list',
      );

  print_r(httpRequest('http://localhost:'.$config['wsPort'].'/', array(
    'data' => json_encode($data))));

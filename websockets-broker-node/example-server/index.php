<?php
  
  date_default_timezone_set('UTC');
  error_reporting(E_ALL ^ E_NOTICE);
  ini_set('display_errors', 'on');
  ini_set('error_log', 'log/error.'.date('Y-m').'.log');
  ini_set('log_errors', true);

  header('Content-type: text/plain; charset=utf-8');
  
  $message = json_decode($_POST['message'], true);
  $connection = json_decode($_POST['connection'], true);
  
  $result = array();
  
  $typeHandler = 'commands/'.basename($message['type']).'.php';
  
  if(file_exists($typeHandler)) 
  {
    include($typeHandler);
  }
  else
  {
    $result[] = array( 
      'type' => 'log',
      'text' => 'request type "'.basename($message['type']).'" not supported');
  }
  
  print(json_encode($result));
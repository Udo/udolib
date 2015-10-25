<?php
  
# used for making requests from the server to the broker 
function brokerRequest($url, $command, $message = array())
{
  $req = httpRequest($url, array(
      'cmd' => $command,
      'message' => json_encode($message),
    ));
  $result = array();
  if(substr($req['body'], 0, 1) == '{' || substr($req['body'], 0, 1) == '[')
    $result = json_decode($req['body'], true);
  return($result);
}
  

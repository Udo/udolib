<?php
  
function httpRequest($url, $post = array(), $opt = array())
{
  $ch = curl_init();
  $resheaders = array();
  $resbody = array();
  curl_setopt($ch, CURLOPT_URL, $url);
  if(sizeof($post)>0) curl_setopt($ch, CURLOPT_POST, 1); 
  
  // this is a workaround for a parameter bug that prevents params starting with an @ from working correctly
  foreach($post as $k => $v) if(substr($v, 0, 1) == '@') $post[$k] = '\\'.$v;

  if(sizeof($post)>0) 
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post));
  curl_setopt($ch, CURLOPT_HEADER, 1);  
  @curl_setopt($ch, CURLOPT_TIMEOUT, $opt['timeout'] ? $opt['timeout'] : 2); 
  curl_setopt($ch, CURLOPT_RETURNTRANSFER  ,1);  
  $result = curl_exec($ch);
  curl_close($ch);
    
  $headerMode = true;
  $resBody = '';
  foreach(explode(chr(13), $result) as $line)
  {
    $line = trim($line);
    if($line == '') $headerMode = false;
    if ($headerMode)
    {
      if(substr($line, 0, 4) == 'HTTP')
      {
        $proto = nibble(' ', $line);
        $resheaders['result'] = trim($line);
        $resheaders['code'] = nibble(' ', $line);
        if(substr($resheaders['code'], 0, 1) == '1') $ignoreELine = true;
      }
      else
      {
        $hkey = nibble(':', $line);
        $resheaders[$hkey] = trim($line);
      }
    }
    else
      $resBody .= $line.chr(13);
  }
  
  return(array(
    'result' => $resheaders['code'],
    'headers' => $resheaders,
    'body' => trim($resBody)));
}

if(!is_callable('nibble'))
{
  // cut $cake at the first occurence of $segdiv, returns the slice
  function nibble($segdiv, &$cake)
  {
    $p = strpos($cake, $segdiv);
    if ($p === false)
    {
      $result = $cake;
      $cake = '';
    }
    else
    {
      $result = substr($cake, 0, $p);
      $cake = substr($cake, $p + strlen($segdiv));
    }
    return $result;
  }
}
  

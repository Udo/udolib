<html><?php

$cfg = json_decode(file_get_contents('example-config.json'), true);

$cfg['wsURL'] = 'ws://'.$_SERVER['HTTP_HOST'].':'.$cfg['wsPort'];

header('Content-type: text/html; charset=utf-8');
session_name('session_id');
session_start();

?>
<h2>WebSocket Test</h2>

<pre id="output"></pre>

<p>
  <input type="text" id="cmd" placeholder="message text"/>
  <input type="button" value="send" onClick="wsLink.send({ type : 'text', text : $('#cmd').val() });"/>
</p>

<script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
<script>
  
var logActivity = function(aType, aData) {
  if(!aData) aData = '';
  $('#output').append('<div><b>'+aType+'</b>: '+aData+'</div>');
  console.log(aType, aData);
}

var wsLink = {
  
  ws : false,
  
  init : function() {
    logActivity('* connecting', 'to <?= $cfg['wsURL'] ?>');
    wsLink.ws = new WebSocket('<?= $cfg['wsURL'] ?>');
    
    wsLink.ws.onopen = function(evt) { 
      logActivity('* connected');
      wsLink.send({ type : 'hello', content : 'there' });   
      };
      
    wsLink.ws.onclose = function(evt) { 
      logActivity('* disconnected');
      setTimeout(function() {
        wsLink.init();
        }, 2000);
      };
      
    wsLink.ws.onmessage = function(evt) { 
      try {
        var data = JSON.parse(evt.data);
        logActivity('- message', evt.data);
      } catch(err) {
        logActivity('! error decoding', evt.data);
      }
      };
      
    wsLink.ws.onerror = function(evt) { 
      logActivity('! connection error');
      };
      
    },

  connect : function() {

    },

  send : function(data) {
    logActivity('- sending', JSON.stringify(data));
    wsLink.ws.send(JSON.stringify(data));
    },

  }

wsLink.init();

</script>
</html>
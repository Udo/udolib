<?php
  
header('Content-Type: text/html; charset=utf-8');
  
include('u-markdown.php');

print_r(u_md_render(u_md_parse(file_get_contents('example.md'))));
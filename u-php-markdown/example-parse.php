<?php
  
header('Content-Type: text/plain; charset=utf-8');
  
include('u-markdown.php');

print_r(u_md_parse(file_get_contents('example.md')));
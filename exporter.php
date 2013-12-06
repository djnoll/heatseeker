<?php

  //make sure the data is correct
if(!isset($_POST['mapData'])){
  echo("BAD REQUEST");
  exit();
 }

//JSON?
try{
$data = json_decode($_POST['mapData']);
}
catch(Exception $e){
  echo("BAD REQUEST");
  exit();
 }

//AN OBJECT?

if(! is_object($data)){
  echo("BAD REQUEST");
  exit();
 }

//make sure it has the proper format
$val = array('description','date','formula','chart');
$len = count($val);
for($i = 0; $i < $len; $i++){
  if(! property_exists($data, $val[$i])){
      echo("BAD REQUEST");
  exit();
 }
 }

  //mapData.src is the file name
  //if it doesn't exist--create it, or try
  $file = "mapData.src";
  if(! file_exists($file)|| filesize($file) === 0){
    $f = array();
    $f = serialize($f);
    file_put_contents($file, $f);
  }

//we assume its good at this point
  
  $storage = file_get_contents($file);
  $storage = unserialize($storage);
array_push($storage, $data);
  $storage = serialize($storage);
  file_put_contents($file, $storage);
  echo('ACK');
  
  
  
  

?>

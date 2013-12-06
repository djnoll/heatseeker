<!DOCTYPE HTML>
<html>
<head>
<title>SAVED DATA</title>
<head>
<meta charset="utf-8" />
<link rel="stylesheet" href="records.css" />
</head>
<body>
<h2>SAVED DATA</h2>
<?php
$url = "import.php";


if(isset($_GET['query'])){
  echo(getList($url));
 }
 else if(isset($_GET['num'])){
   echo(showChart($_GET['num']));
 }
 else{
   echo("<h2>BAD REQUEST</h2>");
 }


function showChart($num){
  
    $out = '';
    $data = file_get_contents('mapData.src');
    if(! $data){
      $r = "THERE WAS AN ERROR RETRIEVING THE DATA";
      return $r;
    }
    $data = unserialize($data);
    $len = count($data);
    $err = "<h2>BAD REQUEST</h2>";

    //must be an integer
    $res = settype($num, "integer");
    if($res === false){
      return $err;
    }
    //record must exist
    if(($num < 0) || ($num >= $len)){
      return $err;
    }
    echo('<a href="' . $url . '?query=t"> BACK </a><br>');
    $v = $data[$num];
    $out = $v->description . " on ";
    $d = transDate($v->date);
    $out .= $d . '<br>FORMULA:<br> ';

    $f = get_object_vars($v->formula);
    foreach($f as $key=>$val){
      $val = round($val, 2);
      $out .="$key: $val <br> ";
    }
    $out .= "<h2>RESULTS:</h2>";
    $out .= $v->chart;

      
    
    return $out;
  }



  function getList($url){
    $out = '';
    $data = file_get_contents('mapData.src');
    if(! $data){
      $r = "THERE WAS AN ERROR RETRIEVING THE DATA";
      return $r;
    }
    $data = unserialize($data);
    
    $len = count($data);
    $out  = "NUMBER OF STORED RECORDS: " . $len . '<br>';

    for($i = 0; $i < $len; $i++){
      $ctr = '<a href="' . $url . '?num=' . $i . '">';
      $ctr .= $data[$i]->description . " ";
      $k = ($data[$i]->date);
      $d = transDate($k);
      $ctr .= $d;
      $ctr .='</a><br>';
      $out .= $ctr;
      
    }
    return $out;
  }

    function transDate($raw){
      $v = $raw % 1000;
      $raw -= $v;
      $raw = $raw/1000;
      $d = date("m-d-Y", $raw);
      $d = $d . " at " . date("H:i",$raw);
      return $d;
    }    

?>
</body>
</html>

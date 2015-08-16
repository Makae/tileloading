<?php
define('TILE_FOLDER', 'dummy-images');
function getTileFile($idx) {
  $files = scandir(TILE_FOLDER);
  $ctr = 0;
  $idx = $idx % 15;// ($idx + 6) > count($files) ? $idx % (count($files) - 1) : $idx;
  foreach($files as $file) {
    if(strpos($file, '.') === 0)
      continue;
    if($idx == $ctr)
      return $file;
    $ctr++;
  }
}

$idx = array_key_exists('tile_idx', $_REQUEST) ? $_REQUEST['tile_idx'] : 0;
$format = array_key_exists('format', $_REQUEST) ? $_REQUEST['format'] : 'binary';
$file = implode(DIRECTORY_SEPARATOR, array(TILE_FOLDER, getTileFile($idx)));
if($format == 'binary') {
  header('Content-Type: image/jpg');
  header('Content-transfer-encoding: binary');
  readfile($file);
} else {
  header('Content-Type: text/plain');
  header('Content-transfer-encoding: base64');
  $file = file_get_contents($file);
  echo base64_encode($file);
}

exit;
?>
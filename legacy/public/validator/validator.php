<?php

date_default_timezone_set('UTC');

header('Content-Type: text/html; charset=utf-8');

$uploads_dir = 'uploads';
if (!is_dir($uploads_dir)) {
  mkdir($uploads_dir, 0755, true);
}

function convertEncoding($string)
{
  return mb_convert_encoding($string, 'UTF-8', 'WINDOWS-1251');
}

function readCsv($input, $delimiter = ',', $enclosure = '"', $escape = '\\')
{
  $fiveMBs = 5 * 1024 * 1024;
  $fp = fopen("php://temp/maxmemory:$fiveMBs", 'r+');
  fputs($fp, $input);
  rewind($fp);

  $data = fgetcsv($fp, 0, $delimiter, $enclosure);
  fclose($fp);
  return $data;
}

function isDateValid($date)
{
  // Define regular expressions for the supported date formats
  $dateFormats = array(
    'd.m.y' => '/^\d{2}\.\d{2}\.\d{2}$/',
    'Y'     => '/^\d{4}$/'
  );

  foreach ($dateFormats as $format => $regex) {
    if (preg_match($regex, $date)) {
      if ($format === 'd.m.y') {
        // Use checkdate to validate the date in 'd.m.y' format
        $dateParts = explode('.', $date);
        $day = intval($dateParts[0]);
        $month = intval($dateParts[1]);
        $year = intval($dateParts[2]);

        if (checkdate($month, $day, $year)) {
          return true;
        }
      } elseif ($format === 'Y') {
        // Validate 'Y' format by checking if it's a valid 4-digit year
        $year = intval($date);

        if ($year >= 1000 && $year <= 9999) {
          return true;
        }
      }
    }
  }

  return false;
}

function isAreaValid($area)
{
  $validAreas = array("BRO", "BR.", "GOO", "GO.", "GRO", "GR.", "MIO", "MI.", "MOO", "MO.", "VIO", "VI.");
  return in_array($area, $validAreas, true);
}

function isOprValid($opr)
{
  return in_array($opr, array("V", "M", "B", "4"), true);
}

function isLocationValid($latitude, $longitude)
{
  return ($latitude >= 51 && $latitude <= 57) && ($longitude >= 23 && $longitude <= 33);
}

function checkRowValidity($row)
{
  $errors = array();

  $oprIndex = 1;
  $areaIndex = 3;
  $dateIndex = 16;
  $ozinIndex = 19;
  $ozieIndex = 20;

  if (isset($row[$oprIndex]) && !isOprValid($row[$oprIndex])) {
    $errors[] = 'Invalid (OPR: "' . $row[$oprIndex] . '")';
  }

  if (isset($row[$areaIndex]) && !isAreaValid($row[$areaIndex])) {
    $errors[] = 'Invalid (AREA: "' . $row[$areaIndex] . '")';
  }

  if (!empty($row[$dateIndex]) && !isDateValid($row[$dateIndex])) {
    $errors[] = 'Invalid (DATE: "' . $row[$dateIndex] . '")';
  }

  if (!empty($row[$ozinIndex]) && !empty($row[$ozieIndex]) && !isLocationValid($row[$ozinIndex], $row[$ozieIndex])) {
    $errors[] = 'Invalid (OZIN: "' . $row[$ozinIndex] . '", OZIE: "' . $row[$ozieIndex] . '")';
  }

  return $errors;
}

$results = array();

if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_FILES["filesToUpload"])) {
  foreach ($_FILES["filesToUpload"]["name"] as $key => $name) {
    ob_start();

    $target_file = $uploads_dir . '/' . basename($name);
    $fileType = strtolower(pathinfo($target_file, PATHINFO_EXTENSION));

    if ($fileType !== "csv") {
      echo "File " . htmlspecialchars($name) . " is not a CSV.<br>";
      continue;
    }

    if (move_uploaded_file($_FILES["filesToUpload"]["tmp_name"][$key], $target_file)) {
      echo "The file " . htmlspecialchars($name) . " has been uploaded.<br>";

      if (($handle = fopen($target_file, "r")) !== FALSE) {
        $lineNumber = 0;
        $errorsFound = false;

        while (($data = fgets($handle)) !== FALSE) {
          $lineNumber++;
          $decodedData = convertEncoding($data);

          if (trim($decodedData) === '' || strpos($decodedData, '/') === 0) {
            continue;
          }

          $row = readCsv($decodedData, ";");
          foreach ($row as $key => $value) {
            $row[$key] = trim($value);
          }

          $errors = array();
          if (count($row) != 22 && $lineNumber > 1) {
            $errors[] = 'Columns count != 22 (Found: ' . count($row) . ')';
          }

          if ($lineNumber > 1) {
            $errors = array_merge($errors, checkRowValidity($row));
          }

          if (!empty($errors)) {
            if (!$errorsFound) {
              echo "<table border='1'><tr><th>Line Number</th><th>Row Text</th><th>Error</th></tr>";
              $errorsFound = true;
            }
            echo "<tr><td>" . $lineNumber . "</td><td>" . htmlspecialchars($decodedData) . "</td><td>" . implode('<br>', $errors) . "</td></tr>";
          }
        }

        if (!$errorsFound) {
          echo "<strong>Everything is okay, no errors found.</strong><br>";
        } else {
          echo "</table>";
        }

        fclose($handle);

        if (unlink($target_file)) {
          echo "The file " . htmlspecialchars($name) . " has been deleted.<br>";
        } else {
          echo "Error deleting the file " . htmlspecialchars($name) . ".<br>";
        }
      } else {
        echo "Error uploading file " . htmlspecialchars($name) . ".<br>";
      }
    }

    $results[] = ob_get_clean();
  }

  echo json_encode($results);
}

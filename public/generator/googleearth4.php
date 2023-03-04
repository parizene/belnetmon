<?php

switch ($_REQUEST['generate']) {
    case 'on':
        GetDBList();
        generate();
        break;
    default:
        select();
        exit;
}

function select()
{
    echo file_get_contents("googleearth4.html");
}

function GetDBList()
{
    $w = 0;
    foreach ($_POST['op'] as $oper => $value1) {
        foreach ($_POST['reg'] as $region => $value2) {
            $db_files[$w++] = $oper . '_' . $region . '4.csv';
        }
    }
    return $db_files;
}

function Generate()
{
    $new_folder = '';
    $db_files = GetDBList();
    if (file_exists('google.zip')) unlink('google.zip');

    $h_out = fopen('bs.kml', 'a') or die('Ошибка создания файла bs.kml');
    fwrite($h_out, "<?xml version='1.0' encoding='UTF-8'?>\n<kml xmlns='http://earth.google.com/kml/2.2'>\n");
    fwrite($h_out, "<Document>\n<name>Места установки БС</name>\n<open>1</open>\n");
    // цвета aaBBGGRR
    fwrite($h_out, "<Style id='v'>\n<IconStyle>\n<color>ff0000ff</color>\n<scale>1.0</scale>\n<Icon>\n<href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href>\n</Icon>\n</IconStyle>\n</Style>\n");
    fwrite($h_out, "<Style id='m'>\n<IconStyle>\n<color>ffff0000</color>\n<scale>1.0</scale>\n<Icon>\n<href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href>\n</Icon>\n</IconStyle>\n</Style>\n");
    fwrite($h_out, "<Style id='b'>\n<IconStyle>\n<color>ff000055</color>\n<scale>1.0</scale>\n<Icon>\n<href>http://maps.google.com/mapfiles/kml/shapes/placemark_circle.png</href>\n</Icon>\n</IconStyle>\n</Style>\n");
    fwrite($h_out, "<Style id='4'>\n<IconStyle>\n<color>ff00ffff</color>\n<scale>1.0</scale>\n<Icon>\n<href>http://maps.google.com/mapfiles/kml/paddle/ylw-square.png</href>\n</Icon>\n</IconStyle>\n</Style>\n");

    foreach ($db_files as $key => $file) {
        if (($handle = fopen("../$file", 'r')) == FALSE) continue;
        switch ($file[0]) {
            case 'v':
                $op_name = 'A1';
                break;
            case 'm':
                $op_name = 'МТС';
                break;
            case 'b':
                $op_name = 'life:)';
                break;
            case '4':
                $op_name = 'beCloud (LTE)';
                break;
        }
        switch ($file) {
            case $file[0] . '_' . 'brest4.csv':
                $reg_name = 'Брестская область';
                break;
            case $file[0] . '_' . 'vitebsk4.csv':
                $reg_name = 'Витебская область';
                break;
            case $file[0] . '_' . 'gomel4.csv':
                $reg_name = 'Гомельская область';
                break;
            case $file[0] . '_' . 'grodno4.csv':
                $reg_name = 'Гродненская область';
                break;
            case $file[0] . '_' . 'mogilev4.csv':
                $reg_name = 'Могилевская область';
                break;
            case $file[0] . '_' . 'mio4.csv':
                $reg_name = 'Минская область';
                break;
            case $file[0] . '_' . 'minsk4.csv':
                $reg_name = 'Минск';
                break;
        }
        if ($new_folder != $file[0]) {
            if ($new_folder != '') fwrite($h_out, "</Folder>\n");
            fwrite($h_out, "<Folder>\n<name>$op_name</name>\n<visibility>1</visibility>\n");
            $new_folder = $file[0];
        }
        fwrite($h_out, "<Folder>\n<name>$reg_name</name>\n<visibility>1</visibility>\n");

        $array = array(array(
            'cid'  => '',
            'lac'  => '',
            'cid3' => '',
            'lac3' => '',
            'long' => '',
            'lati' => '',
            'descr' => ''
        ));
        $k = 0;

        while (!feof($handle)) {
            $s = fgets($handle);
            $s = iconv('CP1251', 'UTF-8', $s);
            $data = explode(';', $s);
            // убираем лишние пробелы (в начале, в конце)
            $state = trim($data[2]);
            $city = trim($data[4]);
            $lac  = trim($data[6]);
            $cid  = trim($data[7]);
            $lac3 = trim($data[10]);
            $cid3 = trim($data[11]);
            $adrs = trim($data[17]);
            $prim = trim($data[18]);
            $lati = trim($data[19]);
            $long = trim($data[20]);
            if ($data[0] == '$' and ($state[0] == 'R' or $state[0] == 'S') and strlen($lati) > 0 and strlen($long) > 0)  // только для БС со статусом "работает" или "строится" и имеющих координаты
            {
                if (($city != '') and (($adrs != '') or ($prim != ''))) $city = $city . ', ';
                if (($adrs != '') and ($prim != '')) $adrs = $adrs . ', ';
                if (($city == '') and ($adrs == '') and ($prim == '')) $city = '?';   // если все поля пустые, то пишем '?'
                $descr = $city . $adrs . $prim;

                if (($lac == '' or $cid == '') and $state[0] == 'R') $lac = '?';
                if ($state[0] == 'S') $lac = 'строится';

                $array[$k]['cid']  = $cid;
                $array[$k]['lac']  = $lac;
                $array[$k]['cid3'] = $cid3;
                $array[$k]['lac3'] = $lac3;
                $array[$k]['long'] = $long;
                $array[$k]['lati'] = $lati;
                $array[$k]['descr'] = $descr;
                ++$k;
            }
        }
        fclose($handle);
        usort($array, 'cmp');    // сортируем массив с данными по LAC, а затем по CID
        //  ShowArray($array);		// функция отображает таблицу с данными в массиве (используется при отладке скрипта)
        PrintPlacemark($h_out, $array, $file[0]);
        fwrite($h_out, "</Folder>\n");
    }
    fwrite($h_out, "</Folder>\n");
    fwrite($h_out, "</Document>\n</kml>\n");
    fclose($h_out);

    // архивируем базы
    $z = new ZipArchive;
    $z->open("google.zip", ZipArchive::CREATE);

    if (file_exists('bs.kml')) $z->addFile('bs.kml');

    $z->close();

    if (file_exists('bs.kml')) unlink('bs.kml');

    header('location: google.zip');
}

function ShowArray($array)
{
    //выводим содержимое массива на экран
    $records = sizeof($array);
    print "\n<table border='0' cellspacing='1' cellpadding='2' bgcolor='blue' align='center'>\n";
    print "<tr bgcolor='#F0F0FF' style='font: 9pt Arial'>
        <td style='text-align: center;'>CID</td>
        <td style='text-align: center;'>LAC</td>
        <td style='text-align: center;'>CID3</td>
        <td style='text-align: center;'>LAC3</td>
        <td style='text-align: center;'>DESC</td>
        <td style='text-align: center;'>LONG</td>
        <td style='text-align: center;'>LATI</td>
        </tr>\n";
    for ($i = 0; $i < $records; ++$i) {
        $cid  = $array[$i]['cid'];
        $lac  = $array[$i]['lac'];
        $cid3 = $array[$i]['cid3'];
        $lac3 = $array[$i]['lac3'];
        $long = $array[$i]['long'];
        $lati = $array[$i]['lati'];
        $descr = $array[$i]['descr'];
        print "<tr bgcolor='#F0F0FF' style='font: 9pt Arial'>\n
        <td style='text-align: right;'>$cid</td>
        <td style='text-align: center;'>$lac</td>
        <td style='text-align: right;'>$cid3</td>
        <td style='text-align: center;'>$lac3</td>
        <td style='text-align: left;'>$descr</td>
        <td style='text-align: left;'>$long</td>
        <td style='text-align: left;'>$lati</td>
        </tr>\n";
    }
    print "</table>\n";
}

function PrintPlacemark($h_out, $array, $opsos)
{
    $records = sizeof($array);
    $lac_indic = '';
    $name = '';
    for ($i = 0; $i < $records; ++$i) {
        $cid   = $array[$i]['cid'];
        $lac   = $array[$i]['lac'];
        $cid3  = $array[$i]['cid3'];
        $lac3  = $array[$i]['lac3'];
        $descr = $array[$i]['descr'];
        $long  = $array[$i]['long'];
        $lati  = $array[$i]['lati'];

        if (($lac_indic == '' or $lac_indic != $lac) and $opsos != 'l')    // открывает нужную папку

        {
            if ($lac_indic != '' and $lac_indic != $lac) fwrite($h_out, "</Folder>\n");
            if ($lac == '?' or $lac == '') fwrite($h_out, "<Folder>\n<name>необмерянные</name>\n<visibility>1</visibility>\n");
            elseif ($lac == 'строится') fwrite($h_out, "<Folder>\n<name>стройки</name>\n<visibility>1</visibility>\n");
            else fwrite($h_out, "<Folder>\n<name>$lac</name>\n<visibility>1</visibility>\n");
            $lac_indic = $lac;                        // запоминаем текущую папку
        }
        if (($lac_indic == '' or $lac_indic != $lac3) and $opsos == 'l')    // открывает нужную папку
        {
            if ($lac_indic != '' and $lac_indic != $lac3) fwrite($h_out, "</Folder>\n");
            if ($lac3 == '?' or $lac3 == '') fwrite($h_out, "<Folder>\n<name>необмерянные</name>\n<visibility>1</visibility>\n");
            elseif ($lac3 == 'строится') fwrite($h_out, "<Folder>\n<name>стройки</name>\n<visibility>1</visibility>\n");
            else fwrite($h_out, "<Folder>\n<name>$lac3</name>\n<visibility>1</visibility>\n");
            $lac_indic = $lac3;                        // запоминаем текущую папку
        }

        if ($lac == 'строится' or ($lac == '?' and $cid == '')) $name = $lac;
        else $name = $lac . '/' . $cid;
        if ($cid3 != '') $name = $lac . '/' . $cid . '|' . $lac3 . '/' . $cid3;
        if ($cid3 != '' and $opsos == 'l') $name = $lac3 . '/' . $cid3;

        fwrite($h_out, "<Placemark>\n<name>$name</name>\n<description>$descr</description>\n<LookAt>\n<longitude>$long</longitude>\n<latitude>$lati</latitude>\n<altitude>0</altitude>\n<range>0</range>\n</LookAt>\n<styleUrl>#$opsos</styleUrl>\n<Point>\n<coordinates>$long,$lati,0</coordinates>\n</Point>\n</Placemark>\n");
    }
    fwrite($h_out, "</Folder>\n");
}

function cmp($a, $b)
{
    if ($a['cid'] == $b['cid'] and $a['lac'] == $b['lac']) {
        return 0;
    }
    return ($a['lac'] > $b['lac'] or ($a['cid'] > $b['cid'] and $a['lac'] == $b['lac'])) ? 1 : -1;
}

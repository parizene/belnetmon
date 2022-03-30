<?php

if (isset($_REQUEST['generate'])) {
    generate();
    exit;
}

echo file_get_contents("generator4v.html");

function generate()
{
    $buffer = '';
    // убираем все говно после завершения работы скрипта
    $bases_tmp = array('btsinfo1.txt', 'btsinfo2.txt', 'btsinfo3.txt', '0257001F.dat', '0257002F.dat', '0257004F.dat', '25701.clf', '25702.clf', '25704.clf', '25701_v30.clf', '25702_v30.clf', '25704_v30.clf', 'lte_v30.clf', 'unite_v30.clf', 'cells.dat', 'groups.dat', 'database.zip');
    foreach ($bases_tmp as $key => $filename) if (file_exists("$filename")) unlink("$filename");

    // создаем массив 'db_files' с именами файлов таблиц, предназначенных для обработки
    $w = 0;
    foreach ($_POST['op'] as $oper => $value1) foreach ($_POST['reg'] as $region => $value2) $db_files[$w++] = $oper . '_' . $region . '4.csv';

    switch ($_POST['program'])    // в зависимости от программы выбираем названия выходных файлов
    {
        case 'gps':
            $velcom = '0257001F.dat';
            $mts = '0257002F.dat';
            $life = '0257004F.dat';
            break;
        case 'ct':
            $velcom = '25701.clf';
            $mts = '25702.clf';
            $life = '25704.clf';
            break;
        case 'andr':
            $velcom = '25701_v30.clf';
            $mts = '25702_v30.clf';
            $life = '25704_v30.clf';
            $lte = 'lte_v30.clf';
            $unite = 'unite_v30.clf';
            break;
        case 'sgh':
            $velcom = 'btsinfo1.txt';
            $mts = 'btsinfo2.txt';
            $life = 'btsinfo3.txt';
            break;
        case 'cps':
            $velcom = 'cells.dat';
            $mts = 'groups.dat';
            // создаем файл 'groups.dat'
            $head2 = fopen("groups.dat", "a") or die("Ошибка создания файла 'groups.dat'");
            fwrite($head2, "00000000;;;00000000;;;Брест\r\n00000000;;;00000000;;;Гомель\r\n00000000;;;00000000;;;Гродно\r\n00000000;;;00000000;;;Минск\r\n00000000;;;00000000;;;Минская обл.\r\n00000000;;;00000000;;;Могилев\r\n00000000;;;00000000;;;Витебск\r\n");
            fclose($head2);
            break;
        default:
            print "Ошибка в программе!";
            exit;
    }

    require_once('generator4v_mapper.php');
    $mapper = new Mapper();
    foreach ($db_files as $key => $file) {
        $buffer = '';
        if (($handle = fopen("../$file", 'r')) == FALSE) {
            print "<font color='red'>Не найден файл '$file'</font><br>\n";
            continue;
        }

        if ($_POST['program'] == 'cps') $h_out = fopen("$velcom", 'a') or die("Ошибка создания файла '$velcom'");
        else switch ($file[0]) {
            case 'v':
                $h_out = fopen("$velcom", 'a') or die("Ошибка создания файла '$velcom'");
                $opsos = '25701';
                break;
            case 'm':
                $h_out = fopen("$mts", 'a') or die("Ошибка создания файла '$mts'");
                $opsos = '25702';
                break;
            case 'b':
                $h_out = fopen("$life", 'a') or die("Ошибка создания файла '$life'");
                $opsos = '25704';
                break;
            case '4':
                $h_out = fopen("$lte", 'a')  or die("Ошибка создания файла '$lte'");
                #$opsos='25706';    // нафиг не надо, т.к. сам оператор абонентам услуг не оказывает
                break;
            default:
                print "Ошибка в программе!";
                exit;
        }
        while (!feof($handle)) {
            $data = explode(';', fgets($handle));
            if ($data[0] == '$' and $data[2][0] == 'R' and ($data[7] != '' or $data[11] != '' or $data[14] != ''))  // только для БС со статусом "работает"
            {
                // только для БС со статусом "работает"

                // убираем лишние пробелы
                $city     = trim($data[4]);
                $lac_dec2 = trim($data[6]);
                $cid2     = trim($data[7]);
                $adrs     = trim($data[17]);
                $prim     = trim($data[18]);
                $sectors2 = str_replace(" ", "", $data[8]) . str_replace(" ", "", $data[9]);

                $lac_dec3 = trim($data[10]);
                $cid3     = trim($data[11]);
                $sectors3 = str_replace(" ", "", $data[12]);

                $lac_decu9 = trim($data[13]);
                $cidu9    = trim($data[14]);
                $sectorsu9 = trim($data[15]);

                $lat     = substr(trim($data[19]), 0, 7);        // широта
                $lon     = substr(trim($data[20]), 0, 7);        // долгота

                // для LAC 2G
                $lac_hex2 = strtoupper(dechex(intval($lac_dec2)));            // переводим dec в hex, и в верхний регистр
                for ($i = strlen($lac_hex2); $i < 4; ++$i) $lac_hex2 = '0' . $lac_hex2;    // добавляем нули до длинны LAC в 4 символа
                for ($i = strlen($lac_dec2); $i < 5; ++$i) $lac_dec2 = '0' . $lac_dec2;    // добавляем нули до длинны LAC в 4 символа

                // для LAC 3G
                $lac_hex3 = strtoupper(dechex(intval($lac_dec3)));            // переводим dec в hex, и в верхний регистр
                for ($i = strlen($lac_hex3); $i < 4; ++$i) $lac_hex3 = '0' . $lac_hex3;    // добавляем нули до длинны LAC в 4 символа
                for ($i = strlen($lac_dec3); $i < 5; ++$i) $lac_dec3 = '0' . $lac_dec3;    // добавляем нули до длинны LAC в 4 символа

                // для LAC U900
                $lac_hexu9 = strtoupper(dechex(intval($lac_decu9)));            // переводим dec в hex, и в верхний регистр
                for ($i = strlen($lac_hexu9); $i < 4; ++$i) $lac_hexu9 = '0' . $lac_hexu9;    // добавляем нули до длинны LAC в 4 символа
                for ($i = strlen($lac_decu9); $i < 5; ++$i) $lac_decu9 = '0' . $lac_decu9;    // добавляем нули до длинны LAC в 4 символа

                if ($_POST['unknown'] == TRUE and ($city == '' or strpbrk($city, '?'))) continue;    // защита от БС с неизвестным нас.пунктом

                if (($city != '') and (($adrs != '') or ($prim != ''))) $city = $city . ', ';
                if (($adrs != '') and ($prim != '')) $adrs = $adrs . ', ';
                if (($city == '') and ($adrs == '') and ($prim == '')) $city = '?';   // если все поля пустые, то пишем '?'

                if ($_POST["band2"] == true) {
                    $buffer .= $mapper->get2g($data, $opsos, $lac_dec2, $lac_hex2, $cid2, $sectors2, $lat, $lon, $city, $adrs, $prim);
                }
                if ($_POST["band3"] == true) {
                    $buffer .= $mapper->get3g($data, $opsos, $lac_dec3, $lac_hex3, $cid2, $cid3, $sectors3, $lat, $lon, $city, $adrs, $prim);
                }
                if ($_POST["u9"] == true) {
                    $buffer .= $mapper->getU900($data, $opsos, $lac_hexu9, $cid2, $cidu9, $sectorsu9, $lat, $lon, $city, $adrs, $prim);
                }
                if ($_POST["program"] == "andr" and $_POST["op"][4] == true and $file[0] == "4") {
                    $info = $mapper->get4gB20Info($data, $city, $adrs, $prim);
                    $buffer .= $mapper->getLte($lac_hex2, $cid2, $sectors2, $lat, $lon, $info, false);

                    $info = $mapper->get4gInfo($data, $city, $adrs, $prim);
                    $buffer .= $mapper->getLte($lac_hex3, $cid3, $sectors3, $lat, $lon, $info, true);

                    $info = $mapper->get4gB7Info($data, $city, $adrs, $prim);
                    $buffer .= $mapper->getLte($lac_hexu9, $cidu9, $sectorsu9, $lat, $lon, $info, false);
                }
            }
        }
        fclose($handle);
        if ($_POST['program'] == 'ct' or $_POST['program'] == 'andr') fwrite($h_out, iconv('CP1251', 'UTF-8', $buffer));
        else fwrite($h_out, $buffer);
        fclose($h_out);
    }

    if ((isset($_POST['unite'])) and ($_POST['program'] == 'andr')) // объединяем базы в один файл
    {
        if (file_exists("$velcom")) file_put_contents("unite_v30.clf", file_get_contents("25701_v30.clf"), FILE_APPEND);
        if (file_exists("$mts"))    file_put_contents("unite_v30.clf", file_get_contents("25702_v30.clf"), FILE_APPEND);
        if (file_exists("$life"))   file_put_contents("unite_v30.clf", file_get_contents("25704_v30.clf"), FILE_APPEND);
        if (file_exists("$lte"))   file_put_contents("unite_v30.clf", file_get_contents("lte_v30.clf"), FILE_APPEND);
    }
    if (isset($_POST['arc']))    // архивируем базы
    {
        $z = new ZipArchive;
        $z->open("database.zip", ZipArchive::CREATE);

        if ((isset($_POST['unite'])) and ($_POST['program'] == 'andr')) // смотрим что отдавать юзеру
        {
            if (file_exists("$unite")) $z->addFile("$unite"); // а надо ли тут условие?
        } else {
            if (file_exists("$velcom")) $z->addFile("$velcom");
            if (file_exists("$mts"))    $z->addFile("$mts");
            if (file_exists("$life"))   $z->addFile("$life");
        }
        //  if (file_exists("$lte"))    $z -> addFile("$lte"); //таблицу пользователю не отдаём 

        $z->close();

        if (file_exists("$velcom")) unlink("$velcom");
        if (file_exists("$mts"))    unlink("$mts");
        if (file_exists("$life"))   unlink("$life");
        if (file_exists("$lte"))    unlink("$lte");

        header('location: database.zip');        // отдаем пользователю архив с базами
    } else {
        if (file_exists("$velcom")) {
            header("Content-type: application/force-downloadn");
            header("Content-Disposition: attachment; filename=$velcom");
            echo file_get_contents($velcom);
        }
        if (file_exists("$mts")) {
            header("Content-type: application/force-downloadn");
            header("Content-Disposition: attachment; filename=$mts");
            echo file_get_contents($mts);
        }
        if (file_exists("$life")) {
            header("Content-type: application/force-downloadn");
            header("Content-Disposition: attachment; filename=$life");
            echo file_get_contents($life);
        }
        if (file_exists("$lte")) {
            header("Content-type: application/force-downloadn");
            header("Content-Disposition: attachment; filename=$lte");
            echo file_get_contents($lte);
        }
    }
}

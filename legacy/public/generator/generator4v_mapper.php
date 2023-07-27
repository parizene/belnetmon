<?php

class Mapper
{
    function getMnc($data)
    {
        $mnc = null;
        switch (trim($data[1])) {
            case "V":
                $mnc = "01";
                break;
            case "M":
                $mnc = "02";
                break;
            case "B":
                $mnc = "04";
                break;
        }
        return $mnc;
    }

    function getReg($data)
    {
        $reg = null;
        switch (trim($data[3])) {
            case "BR.":
                $reg = "0";
                break;
            case "BRO":
                $reg = "0";
                break;
            case "GO.":
                $reg = "1";
                break;
            case "GOO":
                $reg = "1";
                break;
            case "GR.":
                $reg = "2";
                break;
            case "GRO":
                $reg = "2";
                break;
            case "MI.":
                $reg = "3";
                break;
            case "MIO":
                $reg = "4";
                break;
            case "MO.":
                $reg = "5";
                break;
            case "MOO":
                $reg = "5";
                break;
            case "VI.":
                $reg = "6";
                break;
            case "VIO":
                $reg = "6";
                break;
        }
        return $reg;
    }

    private function getSectors($test)
    {
        $result = array();
        $test = trim($test);
        if (strstr($test, ":")) {
            $testSplitted = explode(":", $test);
            for ($i = 0; $i < count($testSplitted); $i++) {
                $str = $testSplitted[$i];
                if ($i == 0) {
                    if ($str !== '') {
                        $arr = str_split($str);
                        for ($j = 0; $j < count($arr); $j++) {
                            $sector = $arr[$j];
                            if (is_numeric($sector)) {
                                array_push($result, intval($sector));
                            }
                        }
                    }
                } else if ($str !== '' and is_numeric($str)) {
                    array_push($result, intval($str));
                }
            }
        } else if ($test !== '') {
            $str = str_replace(' ', '', $test);
            $arr = str_split($str);
            for ($j = 0; $j < count($arr); $j++) {
                $sector = $arr[$j];
                if (is_numeric($sector)) {
                    array_push($result, intval($sector));
                }
            }
        }
        return $result;
    }

    function getAddedLeadingZerosString($str, $length)
    {
        return str_pad($str, $length, "0", STR_PAD_LEFT);
    }

    function get2g($data, $opsos, $lac_dec2, $lac_hex2, $cid2, $sectors2, $lat, $lon, $city, $adrs, $prim)
    {
        $buffer = "";
        //защита от БС 4G
        if ($sectors2 !== '' && $cid2 <= 7000) {
            $sectorsArray = $this->getSectors($sectors2);
            for ($i = 0; $i < count($sectorsArray); $i++) {
                $sector = $sectorsArray[$i];
                $cell_dec2 = $cid2 . $sector;
                $cell_hex2 = strtoupper(dechex(intval($cell_dec2))); // переводим dec в hex, и в верхний регистр
                $cell_hex2 = $this->getAddedLeadingZerosString($cell_hex2, 4);
                $cell_dec2 = $this->getAddedLeadingZerosString($cell_dec2, 5);

                switch ($_POST["program"] // для области
                ) {
                    case "gps":
                        $buffer .=
                            $lac_hex2 .
                            "," .
                            $cell_hex2 .
                            "," .
                            $this->get2gGpsInfo($data, $city, $adrs, $prim) .
                            "\r\n"; // if (!preg_match('/^3G/',$prim))
                        break;
                    case "ct":
                        $buffer .=
                            $cell_hex2 .
                            $lac_hex2 .
                            $opsos .
                            "\t" .
                            $this->get2gCtInfo($data, $city, $adrs, $prim) .
                            "\r\n";
                        break;
                    case "andr":
                        $buffer .= $this->getClf30HexLine(
                            $opsos,
                            $lac_hex2,
                            $cell_hex2,
                            $lat,
                            $lon,
                            $this->get2gAndrInfo($data, $city, $adrs, $prim)
                        );
                        break;
                    case "cps":
                        $mnc = $this->getMnc($data);
                        $reg = $this->getReg($data);
                        $buffer .=
                            "257;" .
                            $mnc .
                            ";" .
                            $lac_dec2 .
                            ";" .
                            $cell_dec2 .
                            ";" .
                            $reg .
                            ";" .
                            $this->get2gCpsInfo($data, $city, $adrs, $prim) .
                            "\r\n";
                        break;
                    case "sgh":
                        $buffer .= pack(
                            "n2",
                            $cell_dec2,
                            $lac_dec2
                        );
                        if (isset($_POST["ext_sgh"])) {
                            $ext_data =
                                $cid2 .
                                "." .
                                $sector .
                                "/" .
                                (int) $lac_dec2 .
                                " ";
                        } else {
                            $ext_data = "";
                        }
                        $str = iconv(
                            "CP1251",
                            "UTF-8",
                            $this->get2gSghInfo($data, $ext_data, $city, $adrs, $prim)
                        );
                        for ($i = 0; $i < strlen($str); ++$i) {
                            $buffer .= pack("C", ord($str[$i]));
                        }
                        for ($i; $i < 64; ++$i) {
                            $buffer .= pack("C", 0x00);
                        }
                        #                                          $buffer.=pack("C8",0x00,0x00,0x00,0x00,0xD9,0x8B,0x36,0x7E);	// смысл не ясен!
                        break;
                };
            }
        }
        return $buffer;
    }

    private function get2gGpsInfo($data, $city, $adrs, $prim)
    {
        if ($data[3][2] == "O" or $_POST["oc_sel"] == true) { // для области
            return $city . $adrs . $prim;
        } else { // для областного центра
            return $adrs . $prim;
        }
    }

    private function get2gCtInfo($data, $city, $adrs, $prim)
    {
        if ($data[3][2] == "O" or $_POST["oc_sel"] == true) { // для области
            return substr($city . $adrs . $prim, 0, 100);
        } else { // для областного центра
            return substr($adrs . $prim, 0, 100);
        }
    }

    private function get2gAndrInfo($data, $city, $adrs, $prim)
    {
        if ($data[3][2] == "O" or $_POST["oc_sel"] == true) { // для области
            return substr($city . $adrs . $prim, 0, 100);
        } else { // для областного центра
            return substr($adrs . $prim, 0, 100);
        }
    }

    private function get2gCpsInfo($data, $city, $adrs, $prim)
    {
        if ($data[3][2] == "O" or $_POST["oc_sel"] == true) { // для области
            return $city . $adrs . $prim;
        } else { // для областного центра
            return $adrs . $prim;
        }
    }

    private function get2gSghInfo($data, $ext_data, $city, $adrs, $prim)
    {
        if ($data[3][2] == "O" or $_POST["oc_sel"] == true) { // для области
            return substr(
                $ext_data . $city . $adrs . $prim,
                0,
                32
            );
        } else { // для областного центра
            return substr(
                $ext_data . $adrs . $prim,
                0,
                32
            );
        }
    }

    function get3g($data, $opsos, $lac_dec3, $lac_hex3, $cid2, $cid3, $sectors3, $lat, $lon, $city, $adrs, $prim)
    {
        $buffer = "";
        //защита от БС 4G
        if ($sectors3 !== '' && $cid3 <= 7000) {
            $sectorsArray = $this->getSectors($sectors3);
            for ($i = 0; $i < count($sectorsArray); $i++) {
                $sector = $sectorsArray[$i];
                $cell_dec3 = $cid3 . $sector;
                $cell_hex3 = strtoupper(dechex(intval($cell_dec3))); // переводим dec в hex, и в верхний регистр
                $cell_hex3 = $this->getAddedLeadingZerosString($cell_hex3, 4);
                $cell_dec3 = $this->getAddedLeadingZerosString($cell_dec3, 5);

                $prim1 = $prim;
                if ($cid2 != $cid3 and strlen($cid3) > 0) {
                    // выводим доп.комментарий для допов  (by Stalker)
                    $length = strlen($cid2);
                    if ($length >= 1 && $length <= 4) {
                        $prim1 = $prim . " (" . $this->getAddedLeadingZerosString($cid2, 4) . ")";
                    }
                }

                switch ($_POST["program"] // для области
                ) {
                    case "gps":
                        $buffer .=
                            $lac_hex3 .
                            "," .
                            $cell_hex3 .
                            "," .
                            $this->get3gGpsInfo($data, $city, $adrs, $prim) .
                            "\r\n"; // if (!preg_match('/^3G/',$prim))
                        break;
                    case "ct":
                        $buffer .=
                            $cell_hex3 .
                            $lac_hex3 .
                            $opsos .
                            "\t" .
                            $this->get3gCtInfo($data, $city, $adrs, $prim) .
                            "\r\n";
                        break;
                    case "andr":
                        $buffer .= $this->getClf30HexLine(
                            $opsos,
                            $lac_hex3,
                            $cell_hex3,
                            $lat,
                            $lon,
                            $this->get3gAndrInfo($data, $city, $adrs, $prim1)
                        );
                        break;
                    case "cps":
                        $mnc = $this->getMnc($data);
                        $reg = $this->getReg($data);
                        $buffer .=
                            "257;" .
                            $mnc .
                            ";" .
                            $lac_dec3 .
                            ";" .
                            $cell_dec3 .
                            ";" .
                            $reg .
                            ";" .
                            $this->get3gCpsInfo($data, $city, $adrs, $prim) .
                            "\r\n";
                        break;
                    case "sgh":
                        $buffer .= pack(
                            "n2",
                            $cell_dec3,
                            $lac_dec3
                        );
                        if (isset($_POST["ext_sgh"])) {
                            $ext_data =
                                $cid3 .
                                "." .
                                $sector .
                                "/" .
                                (int) $lac_dec3 .
                                " ";
                        } else {
                            $ext_data = "";
                        }
                        $str = iconv(
                            "CP1251",
                            "UTF-8",
                            $this->get3gSghInfo($data, $ext_data, $city, $adrs, $prim)
                        );
                        for ($i = 0; $i < strlen($str); ++$i) {
                            $buffer .= pack("C", ord($str[$i]));
                        }
                        for ($i; $i < 64; ++$i) {
                            $buffer .= pack("C", 0x00);
                        }
                        #                                          $buffer.=pack("C8",0x00,0x00,0x00,0x00,0xD9,0x8B,0x36,0x7E);	// смысл не ясен!
                        break;
                };
            };
        }
        return $buffer;
    }

    private function get3gGpsInfo($data, $city, $adrs, $prim)
    {
        if ($data[3][2] == "O" or $_POST["oc_sel"] == true) { // для области
            return $city . $adrs . $prim;
        } else { // для областного центра
            return $adrs . $prim;
        }
    }

    private function get3gCtInfo($data, $city, $adrs, $prim)
    {
        if ($data[3][2] == "O" or $_POST["oc_sel"] == true) { // для области
            return substr(
                "3G," . $city . $adrs . $prim,
                0,
                100
            );
        } else { // для областного центра
            return substr("3G," . $adrs . $prim, 0, 100);
        }
    }

    private function get3gAndrInfo($data, $city, $adrs, $prim1)
    {
        if ($data[3][2] == "O" or $_POST["oc_sel"] == true) { // для области
            return substr(
                "3G," . $city . $adrs . $prim1,
                0,
                100
            );
        } else { // для областного центра
            return substr("3G," . $adrs . $prim1, 0, 100);
        }
    }

    private function get3gCpsInfo($data, $city, $adrs, $prim)
    {
        if ($data[3][2] == "O" or $_POST["oc_sel"] == true) { // для области
            return $city . $adrs . $prim;
        } else { // для областного центра
            return $adrs . $prim;
        }
    }

    private function get3gSghInfo($data, $ext_data, $city, $adrs, $prim)
    {
        if ($data[3][2] == "O" or $_POST["oc_sel"] == true) { // для области
            return substr(
                $ext_data . $city . $adrs . $prim,
                0,
                32
            );
        } else { // для областного центра
            return substr(
                $ext_data . $adrs . $prim,
                0,
                32
            );
        }
    }

    function getU900($data, $opsos, $lac_hexu9, $cid2, $cidu9, $sectorsu9, $lat, $lon, $city, $adrs, $prim)
    {
        $buffer = "";
        //защита от БС 4G
        if ($sectorsu9 !== '' && $cidu9 <= 7000) {
            $sectorsArray = $this->getSectors($sectorsu9);
            for ($i = 0; $i < count($sectorsArray); $i++) {
                $sector = $sectorsArray[$i];
                $cell_decu9 = $cidu9 . $sector;
                $cell_hexu9 = strtoupper(dechex(intval($cell_decu9))); // переводим dec в hex, и в верхний регистр
                $cell_hexu9 = $this->getAddedLeadingZerosString($cell_hexu9, 4);

                $prim1 = $prim;
                if ($cid2 != $cidu9 and strlen($cidu9) > 0) {
                    // выводим доп.комментарий для допов  (by Stalker)
                    $length = strlen($cid2);
                    if ($length >= 1 && $length <= 4) {
                        $prim1 = $prim . " (" . $this->getAddedLeadingZerosString($cid2, 4) . ")";
                    }
                }

                switch ($_POST["program"]) {
                    case "andr":
                        $buffer .= $this->getClf30HexLine(
                            $opsos,
                            $lac_hexu9,
                            $cell_hexu9,
                            $lat,
                            $lon,
                            $this->getU900AndrInfo($data, $city, $adrs, $prim1)
                        );
                        //$buffer.='25702;0x'.$cell_hexu9.';0x'.$lac_hexu9.';0x0000;'.$lat.';'.$lon.';-1;'.substr('U9,'.$city.$adrs.$prim,0,100).";0\r\n";
                        //$buffer.='25704;0x'.$cell_hex3.';0x'.$lac_hex3.';0x0000;'.$lat.';'.$lon.';-1;'.substr('LTE,'.$city.$adrs.$prim,0,100).";0\r\n";
                        break;
                    case "ct":
                        $buffer .=
                            $cell_hexu9 .
                            $lac_hexu9 .
                            $opsos .
                            "\t" .
                            $this->getU900CtInfo($data, $city, $adrs, $prim) .
                            "\r\n";
                        break;
                };
            };
        }
        return $buffer;
    }

    private function getU900AndrInfo($data, $city, $adrs, $prim1)
    {
        if ($data[3][2] == "O" or $_POST["oc_sel"] == true) { // для области
            return substr(
                "U9," . $city . $adrs . $prim1,
                0,
                100
            );
        } else { // для областного центра
            return substr("U9," . $adrs . $prim1, 0, 100);
        }
    }

    private function getU900CtInfo($data, $city, $adrs, $prim)
    {
        if ($data[3][2] == "O" or $_POST["oc_sel"] == true) { // для области
            return substr(
                "U9," . $city . $adrs . $prim,
                0,
                100
            );
        } else { // для областного центра
            return substr("U9," . $adrs . $prim, 0, 100);
        }
    }

    function getLte($lacHex, $cid, $sectors, $lat, $lon, $info, $limitSectors)
    {
        $buffer = "";
        if ($sectors !== '') {
            $sectorsArray = $this->getSectors($sectors);
            for ($i = 0; $i < count($sectorsArray); $i++) {
                $sector = $sectorsArray[$i];
                $cidHex = strtoupper(dechex(intval($cid) * 256 + $sector));
                $cidHex = $this->getAddedLeadingZerosString($cidHex, 4);

                if ($_POST["lt1"] == true) {
                    $buffer .= $this->getClf30HexLine("25701", $lacHex, $cidHex, $lat, $lon, $info);
                }
                if ($_POST["lt2"] == true and (!$limitSectors or $sector < 50)) {
                    $buffer .= $this->getClf30HexLine("25702", $lacHex, $cidHex, $lat, $lon, $info);
                }
                if ($_POST["lt4"] == true and (!$limitSectors or $sector < 50)) {
                    $buffer .= $this->getClf30HexLine("25704", $lacHex, $cidHex, $lat, $lon, $info);
                }
                if ($_POST["lt6"] == true) {
                    $buffer .= $this->getClf30HexLine("25706", $lacHex, $cidHex, $lat, $lon, $info);
                }
            }
        }
        return $buffer;
    }

    function get4gB20Info($data, $city, $adrs, $prim)
    {
        if ($data[3][2] == "O" or $_POST["oc_sel"] == true) { // для области
            return substr(
                "LTE B20," . $city . $adrs . $prim,
                0,
                100
            );
        } else { // для областного центра
            return substr(
                "LTE B20," . $adrs . $prim,
                0,
                100
            );
        }
    }

    function get4gInfo($data, $city, $adrs, $prim)
    {
        if ($data[3][2] == "O" or $_POST["oc_sel"] == true) { // для области
            return substr(
                "LTE," . $city . $adrs . $prim,
                0,
                100
            );
        } else { // для областного центра
            return substr(
                "LTE," . $adrs . $prim,
                0,
                100
            );
        }
    }

    function get4gB7Info($data, $city, $adrs, $prim)
    {
        if ($data[3][2] == "O" or $_POST["oc_sel"] == true) { // для области
            return substr(
                "LTE B7," . $city . $adrs . $prim,
                0,
                100
            );
        } else { // для областного центра
            return substr(
                "LTE B7," . $adrs . $prim,
                0,
                100
            );
        }
    }

    private function getClf30HexLine($mccMnc, $lac, $cid, $lat, $lon, $info)
    {
        return $mccMnc .
            ";0x" .
            $cid .
            ";0x" .
            $lac .
            ";0x0000;" .
            $lat .
            ";" .
            $lon .
            ";-1;" .
            $info .
            ";0\r\n";
    }
}

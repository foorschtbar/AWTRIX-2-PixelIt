<?php

if (!empty($_POST['id'])) {

    $url = 'https://awtrix.blueforcer.de/icon';
    $data = array('reqType' => 'getIcon', 'ID' => $_POST['id']);

    $payload = json_encode($data);

    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

    // Set HTTP Header for POST request 
    curl_setopt(
        $ch,
        CURLOPT_HTTPHEADER,
        array(
            'Content-Type: application/json',
            'Content-Length: ' . strlen($payload)
        )
    );

    // Submit the POST request
    $result = curl_exec($ch);

    curl_close($ch);

    header("Content-Type: application/json");
    die($result);
} elseif (isset($_FILES['file'])) {

    $verifyimg = getimagesize($_FILES['file']['tmp_name']);
    $w = $verifyimg[0];
    $h = $verifyimg[1];

    if ($verifyimg['mime'] != 'image/png') {
        echo json_encode(array("error" => "Only PNG images are allowed!"));
        exit;
        /*} elseif ($w !== $h) {
        echo json_encode(array("error" => "Only square images allowed are allowed!"));
        exit;*/
    } elseif ($w != 8 || $h != 8) {
        echo json_encode(array("error" => "Only 8x8 pixel images allowed are allowed!"));
        exit;
    } else {

        /* Create new object */
        $im = new Imagick($_FILES['file']['tmp_name']);

        /*$im->setImageAlphaChannel(Imagick::ALPHACHANNEL_DEACTIVATE);
        $im->resizeImage(8, 8, Imagick::FILTER_UNDEFINED, 1);*/

        /* Export the image pixels */
        $rgbArray = $im->exportImagePixels(0, 0, $w, $h, "RGB", Imagick::PIXEL_CHAR);

        //echo json_encode($rgbArray);

        for ($i = 0; $i < count($rgbArray); $i += 3) {
            $rgb565[] = ((($rgbArray[$i + 0] & 0xf8) << 8) + (($rgbArray[$i + 1] & 0xfc) << 3) + ($rgbArray[$i + 2] >> 3));
            $rgb888[] = dechex($rgbArray[$i + 0]) . dechex($rgbArray[$i + 1]) . dechex($rgbArray[$i + 2]);
        }

        echo json_encode(array("rgb565" => $rgb565, "rgb888" => $rgb888));
    }

    //echo json_encode($_FILES);
}

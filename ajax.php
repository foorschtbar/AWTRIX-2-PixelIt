<?php

if (!empty($_POST['id']) && $_POST['type'] == "awtrix") {

    $id = $_POST['id'];
    die(file_get_contents('./awtrix/'. $id. ".json"));
    

    // $url = 'https://awtrix.blueforcer.de/icon';
    // $data = array('reqType' => 'getIcon', 'ID' => $_POST['id']);

    // $payload = json_encode($data);

    // $ch = curl_init();

    // curl_setopt($ch, CURLOPT_URL, $url);
    // curl_setopt($ch, CURLOPT_POST, true);
    // curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    // curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);

    // // Set HTTP Header for POST request 
    // curl_setopt(
    //     $ch,
    //     CURLOPT_HTTPHEADER,
    //     array(
    //         'Content-Type: application/json',
    //         'Content-Length: ' . strlen($payload)
    //     )
    // );

    // // Submit the POST request
    // $result = curl_exec($ch);

    // curl_close($ch);

    // header("Content-Type: application/json");
    // die($result);
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
} elseif (!empty($_POST['id']) && $_POST['type'] == "lametric") {

    //$url = "https://corsproxy.io/?https://developer.lametric.com/content/apps/icon_thumbs/". $_POST['id'];
    $url = "https://developer.lametric.com/content/apps/icon_thumbs/". $_POST['id'];

    _log("url: " . $url ."\n");

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_HEADER, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);


    // Submit the GET request
    $response = curl_exec($ch);

    // Get content type
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);

    // Get HTTP status code
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    $headers = substr($response, 0, $header_size);
    $body = substr($response, $header_size);

    if (curl_errno($ch)) {
        _log('Curl error: ' . curl_error($ch). "\n");
        exit;
    }

    // Close cURL session handle
    curl_close($ch);

    _log("result: ".$httpCode . " | " . $contentType."\n");

    _log("extracting frames\n");

    $imagick = new Imagick();
    $imagick->readImageBlob($body);
    $result = image2rg565($imagick);        
    print_r($result);


   

}

 function image2rg565($imagick) {

        $frames = [];

        // Get the number of frames in the image
        $numFrames = $imagick->getNumberImages();

        _log("Number of Frames: ".$numFrames."\n");

        $delay = 0;

        // Loop through each frame and do something with it (e.g., display or process)
        for ($frameNo = 0; $frameNo < $numFrames; $frameNo++) {
            // Set the iterator index to the current frame
            $imagick->setIteratorIndex($frameNo);

            // Get the current frame image
            $frame = $imagick->getImage();

            $w = $frame->getImageWidth();
            $h = $frame->getImageHeight();
            if($delay == 0) {
                $delay = $frame->getImageDelay();
            }

            /* Export the image pixels */
            $rgbArray = $frame->exportImagePixels(0, 0, $w, $h, "RGB", Imagick::PIXEL_CHAR);

            //echo json_encode($rgbArray);
            $rgb565 = [];

            for ($i = 0; $i < count($rgbArray); $i += 3) {
                $rgb565[] = ((($rgbArray[$i + 0] & 0xf8) << 8) + (($rgbArray[$i + 1] & 0xfc) << 3) + ($rgbArray[$i + 2] >> 3));
            }

            _log("Frame ".$frameNo."/".$numFrames." (delay: ".$delay."): ".json_encode($rgb565)."\n");

            $frames[] = $rgb565;

            // Destroy the frame to free up memory
            $frame->destroy();
        }

        // Destroy the Imagick object to free up memory
        $imagick->destroy();

        if($numFrames == 1) {
            $result = $frames[0];
        } else {
            $result = array("data" => $frames, "tick" => $delay*10);
        }

        return json_encode($result);
    }

function _log($msg) {
	$msg = "myApp - " . date("c") . ": " . $msg;
	$out = fopen('php://stdout', 'w');
	fputs($out, $msg);
	fclose($out);
}
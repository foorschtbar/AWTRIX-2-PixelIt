<?php

// Error Reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

scan();

// $data = download(1990);
// print_r($data);


function scan() {
   // Use glob to get all files in the folder
    $allFiles = glob('*');

    // Use preg_grep to filter files based on the regular expression
    $filteredFiles = preg_grep('/^(\d*)$/', $allFiles);

    echo "Found " . count($filteredFiles) . " files<br>";

    // Loop through the filtered files
    foreach($filteredFiles as $file) {
        ob_start();
        $id = $file;
        if(file_exists($id . '.json')) {
            echo "Skip " . $id . '...';
            echo "done<br>";
        } else {
            echo "Download " . $id . '...';
            $data = download($id);
            write($id, $data);
            echo "done<br>";
        }
        ob_flush();
    }

}

function write($id, $data) {
    $file = $id . '.json';
    file_put_contents($file, $data);
}

function download($id) {

    $url = 'https://awtrix.blueforcer.de/icon';
    $data = array('reqType' => 'getIcon', 'ID' => $id);

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

    return $result;

}








?>
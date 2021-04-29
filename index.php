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
} else {

?>

    <!DOCTYPE html>
    <html>

    <head>
        <meta charset="utf-8">
        <title>AWTRIX2PixelIt</title>
        <script src="https://code.jquery.com/jquery-3.6.0.min.js" integrity="sha256-/xUj+3OJU5yExlq6GSYGSHk7tPXikynS7ogEvDej/m4=" crossorigin="anonymous"></script>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/css/bootstrap.min.css" integrity="sha384-B0vP5xmATw1+K9KRQjQERJvTumQW0nPEzvF6L/Z6nronJ3oUOFUFpCjEUQouq2+l" crossorigin="anonymous">
        <style>
            .btn-outline-primary:focus,
            .btn-outline-primary:active {
                box-shadow: none !important;
                outline: 0px !important;
            }

            .card-body {
                padding: 1rem 1rem 0 1rem;
            }
        </style>

    </head>

    <body><br />
        <div class="mx-auto">
            <div class="mx-auto col-md-5">
                <div class="card box-shadow">
                    <div class="card-header text-monospace">
                        <h3>AWETRIX2PixelIt</h3>
                    </div>
                    <div class="card-body">
                        <form class="needs-validation">
                            <div class="input-group mb-3">
                                <input type="text" pattern="[0-9]+" class="form-control text-center" placeholder="AWTRIX Icon ID" id="id" required>
                                <div class="input-group-append"><button type="submit" id="convert" class="btn btn-outline-primary">Convert</button></div>
                            </div>
                            <div id="msgbox" style="display:none"></div>

                            <div id="result" style="display:none">

                                <div class="input-group mb-3">
                                    <!-- <label for="canvas">Preview</label> -->
                                    <div class="mx-auto" style="width: 320px;">

                                        <canvas width="320" height="320" id="canvas" class="border border-secondary"></canvas>
                                    </div>
                                </div>

                                <div class="input-group mb-3">
                                    <!-- <label for="output">PixelIt Bitmap</label> -->
                                    <div class="input-group-prepend">
                                        <span class="input-group-text">Bitmap</span>
                                    </div>
                                    <textarea id="output" rows="6" class="form-control"></textarea>
                                    <div class="input-group-append"><button id="copy" class="btn btn-outline-secondary">Copy</button></div>
                                </div>
                                <div class="form-row mb-3" id="animationinfo">
                                    <div class="input-group col-md-4">
                                        <div class="input-group-prepend">
                                            <span class="input-group-text">Frames</span>
                                        </div>
                                        <input type="text" class="form-control text-center disabled" id="frames">
                                        <div class="input-group-append"><button id="reduce" class="btn btn-outline-primary">Reduce</button></div>

                                    </div>
                                    <div class="input-group col-md-4">
                                        <div class="input-group-prepend">
                                            <span class="input-group-text">Tick</span>
                                        </div>
                                        <input type="text" class="form-control text-center" id="tick">
                                    </div>
                                    <div class="input-group col-md-4">
                                        <div class="input-group-prepend">
                                            <span class="input-group-text">Size</span>
                                        </div>
                                        <input type="text" class="form-control text-center" id="size">
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="card-footer text-muted">
                        <a href="https://awtrix.blueforcer.de/icons.html">AWTRIX Icon Database</a> |
                        <a href="https://pixelit.bastelbunker.de/PixelCreator">PixelCreator</a> |
                        <a href="https://pixelit.bastelbunker.de/PixelGallery">PixelGallery</a>

                    </div>
                </div>
            </div>
        </div>
        <br />
        <script src="script.js"></script>
    </body>

    </html><?php

        }

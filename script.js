$(document).ready(function () {

    var animation;

    var empty = new Array();
    for (var i = 0; i < 64; i++) {
        empty[i] = "#000000";
    }

    $("#copy").click(function (e) {
        e.preventDefault();
        $("#output").focus();
        $("#output").select();
        try {
            let successful = document.execCommand('copy');
            let msg = successful ? 'successful' : 'unsuccessful';
            //alert('Copy text command was ' + msg);
        } catch (err) {
            //alert('Unable to copy');
        }
    });


    $("#reduce").click(function (e) {
        e.preventDefault();
        RGB565IntArrayPaint(true);
        $("#tick").val($("#tick").val() * 2)
    });

    $("#output, #tick").on("keyup", function (e) {
        RGB565IntArrayPaint();
    });

    $("#convert").click(function (e) {
        e.preventDefault();

        id = $("#id").val();

        var regex = new RegExp('^[0-9]+$');

        if (regex.test(id)) {

            $(".form-control, button").prop("disabled", true);
            $("#result").hide();

            showMsg("Downloading...", "secondary");

            body = {
                reqType: "getIcon",
                ID: id
            };
            $.post(".", {
                id: id
            }, function (data, status) {
                //console.log("Data: " + data + "\nType: " + typeof data + "\nLenght: " + data.length + "\nStatus: " + status);
                //console.log("Data", data)

                framesRGB = new Array();
                framesInt = new Array();

                $("#result").fadeIn();

                // Animation
                if (data.tick !== undefined) {
                    $("#tick").val(data.tick);
                    data.data.forEach(element => {
                        framesRGB.push(convertData(element))
                        framesInt.push(element)
                    });
                } else {
                    framesRGB[0] = convertData(data);
                    framesInt[0] = data;

                }

                drawOnCanvas(framesRGB);
                setOutput(framesInt);


                showMsg("Converting finished", "success");

            }, "json").fail(function () {
                showMsg("Icon with ID " + id + " not found", "danger");
            }).always(function () {
                $(".form-control, button").prop("disabled", false);
            });
        } else {
            showMsg("Invalid ID", "danger");
        }



    });
});

var showMsg = function (text, type) {
    var item = $("#msgbox");
    item.removeClass();
    item.addClass("alert mb-3");
    item.show();
    item.addClass("alert-" + type);
    item.html(text);
}

var convertData = function (data) {

    var dataConverted = new Array(data.length);
    for (var i = 0; i < data.length; i++) {
        var rgb = RGB565IntToRGB(data[i]);
        dataConverted[i] = RGBToHEX(rgb[0], rgb[1], rgb[2]);
    }
    return dataConverted;
}


var drawOnCanvas = function (frames) {

    console.log("Frames: " + frames.length)

    var curFrame = 0;

    if (typeof animation !== 'undefined') {
        clearInterval(animation);
    }


    function animate() {

        if (curFrame >= frames.length) curFrame = 0

        draw(frames[curFrame++]);
    }

    function draw(frame) {

        var canvas = document.getElementById('canvas');
        var ctx = canvas.getContext('2d');
        var canvasWidth = canvas.width;
        var canvasHeight = canvas.height;
        var i = 0;
        size = canvasWidth / 8;

        ctx.clearRect(0, 0, canvasWidth, canvasHeight); // clear canvas

        var width = 8;
        var height = 8;

        for (var y = 0; y < height; y++) {
            for (var x = 0; x < width; x++) {
                color = frame[i++];
                ctx.fillStyle = color;
                ctx.fillRect(x * size, y * size, size, size);

            }
        }

    }

    if (frames.length == 1) {
        // Single Frame
        draw(frames[0]);
        $("#animationinfo").hide();
    } else {
        // Animaton
        animate();
        animation = setInterval(animate, $("#tick").val());
        $("#animationinfo").show();
        $("#frames").val(frames.length);
    }

}

function setOutput(frames) {

    var arrays = new Array();
    frames.forEach(element => {
        arrays.push(JSON.stringify(element))
    });

    $("#output").val(arrays.join(","));
    $("#size").val($("#output").val().length)

}

function RGB565IntToRGB(color) {
    var r = ((((color >> 11) & 0x1F) * 527) + 23) >> 6;
    var g = ((((color >> 5) & 0x3F) * 259) + 33) >> 6;
    var b = (((color & 0x1F) * 527) + 23) >> 6;
    return [r, g, b];
}

function RGBToHEX(red, green, blue) {
    var rgb = blue | (green << 8) | (red << 16);
    return '#' + (0x1000000 + rgb).toString(16).slice(1)
}

function RGB565IntArrayPaint(reduce = false) {
    var input = $("#output").val();

    const regex = /\[.*?\]/gm;
    matches = input.match(regex)

    if (matches.length == 1) {
        drawOnCanvas(convertData(JSON.parse(matches[0])));
        setOutput(JSON.parse(matches[0]));
    } else {
        var framesRGB = new Array();
        var framesInt = new Array();
        var skip = false;
        matches.forEach(element => {
            if (!reduce || (reduce && !skip)) {
                framesRGB.push(convertData(JSON.parse(element)))
                framesInt.push(JSON.parse(element))
            }
            skip = !skip;
        });
        drawOnCanvas(framesRGB);
        setOutput(framesInt);
    }
}
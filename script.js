var drawObj;

$(document).ready(function () {

    var icondb = [];

    drawObj = new drawOnCanvas(new Array());

    var empty = new Array();
    for (var i = 0; i < 64; i++) {
        empty[i] = "#000000";
    }

    // Load AWTRIX Icons
    fetch('awtrix/meta.json')
        .then(response => response.json())
        .then(data => {
            // The 'data' variable now contains the parsed JSON content
            console.log("Fetched " + data.length + " AWTRIX icons");
            icondb = data;

            if ($("#searchTerm").val() != "") {
                searchIconDB();
            }
        })
        .catch(error => console.error('Error loading JSON:', error));


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

    $("#frameCtrl").on("click", function (e) {
        e.preventDefault();
        if (drawObj == undefined) return;
        var cmd = $(e.target).attr("data-cmd")
        if (cmd != undefined) {
            if (cmd == "prev") {
                drawObj.playback(false);
                drawObj.prevFrame();
            } else if (cmd == "next") {
                drawObj.playback(false);
                drawObj.nextFrame();
            }
        } else if ($(e.target).hasClass("frameID")) {
            drawObj.playback(false);
            drawObj.setCurFrame($(e.target).attr("data-frame"));
        }

    });

    $("#frameCmd, #playbackCmd").click(function (e) {
        e.preventDefault();
        if (drawObj == undefined) return;
        var cmd = $(e.target).attr("data-cmd")
        console.log("Frame Command: " + cmd);
        switch (cmd) {
            case "play":
                drawObj.playback(true);
                break;
            case "pause":
                drawObj.playback(false);
                break;
        }
    });

    var wto;
    $('#searchTerm').on('keyup', function () {
        clearTimeout(wto);
        wto = setTimeout(function () {
            searchIconDB();
        }, 200);
    });

    function searchIconDB() {
        var searchTerm = $("#searchTerm").val().trim();
        if (searchTerm.length >= 1) {
            console.log("Search for " + searchTerm)

            var result = icondb.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

            showMsg("Found " + result.length + " icons", "info");

            var iconlist = $("#iconlist");
            $("#result").hide();
            iconlist.empty();
            iconlist.show();
            result.forEach((element) => {

                const html = '<div class="icon"><img src="' + "awtrix/" + element.id + '" data-id="' + element.id + '" data-name="' + element.name + '"></img></div>'
                iconlist.append(html);

            });
        }
    }

    $("#iconlist").on("mouseover", ".icon", function (e) {
        const element = $(this).find("img");
        var iconlist = $("#iconlist");
        console.log(element)
        const text = "ID: " + element.attr('data-id') + "<br /><b>" + element.attr('data-name') + "</b>";

        // Create and position the tooltip
        const tooltip = $('<div class="icontooltip">' + text + '</div>')
        tooltip.appendTo("body")

        const position = element.offset();
        const tooltipHeight = tooltip.outerHeight();
        const tooltipWidth = tooltip.outerWidth();

        tooltip.css({
            top: position.top - tooltipHeight - 10,
            left: position.left + (element.outerWidth() - tooltipWidth) / 2,
            display: 'block'
        });
    });

    $("#iconlist").on("mouseout", ".icon", function (e) {
        $('.icontooltip').remove();
    });

    $("#iconlist").on("click", ".icon", function (e) {
        const element = $(this).find("img");
        $("#iconlist").hide();
        convertIcon(element.attr('data-id'), "awtrix");
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

        convertIcon(id, "lametric");



    });

    function convertIcon(id, type) {
        var regex = new RegExp('^[0-9]+$');

        if (regex.test(id)) {

            $(".form-control, button").prop("disabled", true);
            $("#result").hide();

            showMsg("Downloading...", "secondary");

            $.post("ajax.php", {
                id: id,
                type: type
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

                drawObj.setFrames(framesRGB);
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
    }

    // preventing page from redirecting
    $("html").on("dragover", function (e) {
        e.preventDefault();
        e.stopPropagation();
        $("h1").text("Drag here");
    });

    $("html").on("drop", function (e) { e.preventDefault(); e.stopPropagation(); });

    // Drag enter
    $('.upload-area').on('dragenter', function (e) {
        e.stopPropagation();
        e.preventDefault();
        //$("h3").text("Drop");
        //console.log("Drag enter");
        $(this).addClass("drag");
        hideMsg();
    });

    // Drag over
    $('.upload-area').on('dragover', function (e) {
        e.stopPropagation();
        e.preventDefault();
        //$("h3").text("Drop");
        //console.log("Drag over");
        $(this).addClass("drag");
        hideMsg();
    });

    // Drag leave 
    $('.upload-area').on('dragleave', function (e) {
        e.stopPropagation();
        e.preventDefault();
        //$("h3").text("Drag leave");
        //console.log("Drag leave");
        $(this).removeClass("drag");
        hideMsg();
    });

    // Drop
    $('.upload-area').on('drop', function (e) {
        e.stopPropagation();
        e.preventDefault();

        //$("h3").text("Upload");
        //console.log("Drop");
        $(this).removeClass("drag failed success").addClass("pending");
        showMsg("Uploading and converting...", "info");

        var file = e.originalEvent.dataTransfer.files;
        var fd = new FormData();

        fd.append('file', file[0]);

        uploadData(fd);
    });

    // Open file selector on div click
    $("#uploadfile").click(function (e) {
        e.preventDefault();
        $("#file").click();
    });

    // file selected
    $("#file").change(function () {
        var fd = new FormData();

        var files = $('#file')[0].files[0];

        fd.append('file', files);

        uploadData(fd);
    });


});

// Sending AJAX request and upload file
function uploadData(formdata) {

    $.ajax({
        url: 'ajax.php',
        type: 'post',
        data: formdata,
        contentType: false,
        processData: false,
        dataType: 'json',
        success: function (response) {
            $(".upload-area").removeClass("pending drag failed success");
            if (response.error) {
                showMsg(response.error, "danger");
            } else {
                showMsg("Upload done", "success");
                $("#result").fadeIn();
                framesRGB = new Array();
                framesInt = new Array();
                framesRGB[0] = convertData(response.rgb565);
                framesInt[0] = response.rgb565;
                drawObj.setFrames(framesRGB);
                setOutput(framesInt);
            }

            //console.log("success");
        },
        error: function (response) {
            $(".upload-area").removeClass("pending drag success").addClass("failed");
            showMsg("Upload failed", "danger");
            console.log("failed");
        }
    });
}

var showMsg = function (text, type) {
    var item = $("#msgbox");
    item.removeClass();
    item.addClass("alert mb-3");
    item.show();
    item.addClass("alert-" + type);
    item.html(text);
}

var hideMsg = function () {
    var item = $("#msgbox");
    item.removeClass();
    item.hide();
}

var convertData = function (data) {

    var dataConverted = new Array(data.length);
    for (var i = 0; i < data.length; i++) {
        var rgb = RGB565IntToRGB(data[i]);
        dataConverted[i] = RGBToHEX(rgb[0], rgb[1], rgb[2]);
    }
    return dataConverted;
}

class drawOnCanvas {
    #frames;
    #animation;
    #curFrame;
    #play;

    constructor(frames) {
        this.#curFrame = 0;
        this.#animation = undefined;
        this.#frames = new Array();
        this.setFrames(frames);
        this.#play = false;
    }

    setFrames = function (frames) {
        this.#frames = frames;
        console.log("Frames: " + this.#frames.length);

        if (typeof this.#animation !== 'undefined') {
            clearInterval(this.#animation);
        }

        if (this.#frames.length == 1) {
            // Single Frame
            draw(_frames[0]);
            $("#animationinfo").hide();
        } else {
            // Animaton
            this.playback(true);
            this.animate();
            this.#animation = setInterval(this.animate.bind(this), $("#tick").val());
            $("#animationinfo").show();
            $("#frames").val(this.#frames.length);
        }

    }

    playback = function (play) {
        if (play) {
            this.#play = true;
            $("#playbackCmd button").removeClass("active");
            $("#playbackCmd button[data-cmd='play']").addClass("active");
        } else {
            this.#play = false;
            $("#playbackCmd button").removeClass("active");
            $("#playbackCmd button[data-cmd='pause']").addClass("active");
        }
    }


    setCurFrame = function (idx) {
        console.log("Set Frame: " + idx);
        this.#curFrame = idx;
        this.draw();
    }

    animate = function () {
        if (this.#play) {
            this.nextFrame();
        }
    }

    nextFrame = function () {
        this.#curFrame++;
        if (this.#curFrame >= this.#frames.length) this.#curFrame = 0
        this.draw();
    }

    prevFrame = function () {
        this.#curFrame--;
        if (this.#curFrame < 0) this.#curFrame = this.#frames.length - 1;
        this.draw();
    }

    draw = function () {


        if (this.#frames.length > 0) {

            console.log("Draw Frame: " + this.#curFrame);

            var frame = this.#frames[this.#curFrame];
            var canvas = document.getElementById('canvas');
            var ctx = canvas.getContext('2d');
            var canvasWidth = canvas.width;
            var canvasHeight = canvas.height;
            var i = 0;
            var size = canvasWidth / 8;

            ctx.clearRect(0, 0, canvasWidth, canvasHeight); // clear canvas

            var width = 8;
            var height = 8;

            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    var color = frame[i++];
                    ctx.fillStyle = color;
                    ctx.fillRect(x * size, y * size, size, size);
                }
            }



            $(".frameID").removeClass("active");
            $(".frameID").eq(this.#curFrame).addClass("active");
        }

    }

}

function setOutput(frames) {

    // Remove frames from control
    $("#frameCtrl .frameID").remove();

    var arrays = new Array();
    frames.forEach((element, index) => {
        arrays.push(JSON.stringify(element))
        $('<button class="btn btn-outline-secondary frameID" data-frame="' + ((frames.length - index) - 1) + '">' + (frames.length - index) + '</button>').insertAfter("#frameCtrl button:first-child");
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
        drawObj.setFrames(convertData(JSON.parse(matches[0])));
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
        drawObj.setFrames(framesRGB);
        setOutput(framesInt);
    }
}
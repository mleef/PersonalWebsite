var socket;
var ENDPOINT = 'http://ec2-54-152-59-214.compute-1.amazonaws.com:4567';
var GET_CHANNELS = ENDPOINT + '/channel/list';
var GET_VIEWERS = ENDPOINT + '/channel/count/';
var curChannel = "1";
var prevChannel = null;

var videos = {
    ESPN : "mejFtEY5faU",
    CNN : "JHk1uAvc4Vw",
    TNT : "3-zItZwHS0Y",
    NBC : "H-DSfvYCKwY",

}

var makeID = function() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 6; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

window.onload = function () {
    //var id = prompt("Please enter a username for the chat", "username");
    var id = makeID();

    var registration = {
        registrationMessage: {
            previousChannel: null,
            newChannel: {id: "1"},
            television: {id: id}
        }
    };
    var chime1 = {
        chimeMessage : {
            channel : {id: "1"},
            television : {id : "Web TV"},
            message : "I tried so hard.",
            timeSent : "1000"
        }
    };

    var chime2 = {
        chimeMessage : {
            channel : {id: "1"},
            television : {id : "Web TV"},
            message : "And got so far",
            timeSent : "1001"
        }
    };


    socket = new WebSocket('ws://ec2-54-152-59-214.compute-1.amazonaws.com:4445');
    socket.onopen = function () {
        console.log("connection opened.");
        //socket.send(JSON.stringify(registration));
        //socket.send(JSON.stringify(chime1));
        //socket.send(JSON.stringify(chime2));
    }

    socket.onmessage = function (message) {
        console.log("response received");
        messageObj = JSON.parse(message.data);
        console.log(messageObj);
        //$("marquee").append(' ' + messageObj.message);
        $("#ticker").append("<marquee id=\"ticker\" behavior=\"scroll\" direction=\"left\" height=\"20px\" loop=\"1\">"
        + messageObj.message + "</marquee>");
    }


    var updateChannels = function() {
        $.get( GET_CHANNELS, function( data ) {
            var list = JSON.parse(data);
            for(var i = 0; i < list.length; i++) {
                $('#channelList')
                    .append($("<option></option>")
                        .text(list[i].id));
            }
        });
    }

    var updateInfo = function() {
        $.get( GET_VIEWERS + curChannel, function( data ) {
            var num = JSON.parse(data);
            console.log(num);
            $("#viewers").text("Watching: " + num);
        });
    }

    updateChannels();
    //setInterval(updateChannels, 10000);

    $('#channelList').change(function() {
        curChannel = $('select[id=channelList]').val();
        $('#ticker').empty();
        console.log(curChannel);
        console.log(prevChannel);
        var registration = {
            registrationMessage: {
                previousChannel: {id: prevChannel},
                newChannel: {id: curChannel},
                television: {id: id}
            }
        };
        prevChannel = curChannel;
        socket.send(JSON.stringify(registration));

        updateInfo();
        $('#video').empty();
        $('#video').append("<div id=\"player\"></div>");

        var player = new YT.Player('player', {
            height: '390',
            width: '640',
            playerVars: { 'controls': 0 },
            videoId: videos[curChannel],
            events: {
                'onReady': function(event) { event.target.playVideo(); }
            }
        });

    })

    $('#send').change(function() {
        var chime = {
            chimeMessage : {
                channel : {id: curChannel},
                television : {id : id},
                message : $('#send').val(),
                timeSent : new Date().getTime().toString()
            }
        };
        $('#send').val("");
        socket.send(JSON.stringify(chime));
    })
};
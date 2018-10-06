require("mraa");
var groveSensor = require("jsupm_grove");
var sensorModule = require('jsupm_ttp223');
var requestify = require('requestify');
var upmBuzzer = require("jsupm_buzzer");

var temp = new groveSensor.GroveTemp(0);
var luz = new groveSensor.GroveLight(1);
var touch = new sensorModule.TTP223(2);
var button = new groveSensor.GroveButton(3);
var myBuzzer = new upmBuzzer.Buzzer(5);
var thing = "DM120ThiagoLydia";
var urlForPost = "https://dweet.io:443/dweet/for/" + thing;
var celsius, botao, toque, light;

console.log(myBuzzer.name());

readData();

function readData() {
    celsius = temp.value();
    light = luz.value();
    toque = touch.isPressed();
    botao = button.value();

    console.log("\n");
    console.log("Temperatura em Celsius " + celsius);
    console.log("Luminosidade em Lux " + light);
    if (toque) {
        console.log("Touch is pressed");
    } else {
        console.log("Touch is not pressed");
    }
    console.log("Button value is " + botao);

    var urlForGet = "https://dweet.io:443/get/latest/dweet/for/" + thing;
    requestify.get(urlForGet).then(function (response) {
        var content = response.getBody().with[0].content;
        if (content.Buzzer === 1) {
            melody();
        }
       
        if (content.Temperatura > 30 && content.Luminosidade === 0) {
            post("Inativo", content.Buzzer);
        } else {
            post("Ativo", content.Buzzer);
        }
    });

    //Chama a função a cada 1 segundo
    setTimeout(readData, 1000);
}

function melody() {
    myBuzzer.playSound(1000, 50000);
}

function post(message, buzzer) {
    if (buzzer == null) {
        buzzer = 0;
    }

    requestify.post(urlForPost, {
        Temperatura: celsius,
        Luminosidade: light,
        Touch: touch.isPressed(),
        Button: button.value(),
        Buzzer: buzzer,
        Status: message
    }).then(function (response) {
        // Obtem resposta do servidor
        response.getBody();
        console.log(response.body)
    });
}

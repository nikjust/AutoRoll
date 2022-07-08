const WIFI_NAME = "";
const WIFI_OPTIONS = {password: ""};

const fullWindowSteps = 55000
const StepperPins = [D14, D12, D13, D15]

setBusyIndicator(D2)



var wifi = require("Wifi");
function connectWifi() {

    wifi.connect(WIFI_NAME, WIFI_OPTIONS, function (err) {
        if (err) {
            console.log("Connection error: " + err);
            connectWifi()
            return;
        }
        console.log("Connected!");
    });
}
connectWifi()



function onPageRequest(req, res) {
    var a = url.parse(req.url, true);
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write(`
<!DOCTYPE HTML>
<html>
						<head>
						<meta name="http-equiv" content="Content-type: text/html; charset=UTF-8">
						<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
						<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
						
						<style>
                            @media (min-width: 768px) {
                                .btn-half{
                                    width: calc(50% - 13px);
                                    margin: 5px;
                                }
                                .btn-full{
                                    width: calc(100% - 13px);
                                    margin-top: 20px !important;
                                    margin: 5px;
                                }
                                }
                            }						
                        </style>
						
						</head>
						<body CLASS="container">
<h1>AutoRoll</h1>
<br/><a href="?move=${fullWindowSteps}" class="btn btn-primary btn-half"> open </a>
<a href="?move=${fullWindowSteps/2}" class="btn btn-primary btn-half">1/2 open </a>
<br/><a href="?move=-${fullWindowSteps}" class="btn btn-primary btn-half">close</a>
<a href="?move=-${fullWindowSteps/2}" class="btn btn-primary btn-half">1/2 close</a>
`);


    res.end('</body></html>');
    if (a.query && "led" in a.query)
        digitalWrite(D2, a.query["led"]);

    if (a.query && "move" in a.query)
        motorMove(parseInt(a.query["move"]))

    if (a.query && "reload" in a.query)
        E.reboot()
}

require("http").createServer(onPageRequest).listen(80);


var StepperMotor = require("StepperMotor");
var motor = new StepperMotor({
    pins: StepperPins,
    stepsPerSec: 50,
    pattern: [0b0001,0b0011,0b0010,0b0110,0b0100,0b1100,0b1000,0b1001]
});

function FastenMotor() {
    if (motor.stepsPerSec < 0) {
        motor.stepsPerSec += 1
        print(motor.stepsPerSec)
        setTimeout(() => {
            FastenMotor()
        }, 500)
    }


}

function motorMove(pos) {
    if (pos < 0) {
        motor.stepsPerSec = 400
    } else {
        motor.stepsPerSec = 100
    }

    motor.moveTo(motor.getPosition() + pos, undefined, () => {
            setTimeout(() => {
                print("timeout")
                digitalWrite(StepperPins, 0b0000)
                digitalWrite(StepperPins, 0b1111)
                digitalWrite(StepperPins, 0b0000)
                motor.stepsPerSec = 50
            }, 2000)
        }
    )

}
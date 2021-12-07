function reset() {
    rec = false
    if (bt_c) {
        bluetooth.uartWriteLine("G")
    }
    for (let index = 0; index < 3; index++) {
        basic.showLeds(`
            # # # # #
            # # # # #
            # # # # #
            # # # # #
            # # # # #
            `)
        basic.clearScreen()
        basic.pause(200)
    }
    total = 0
    base = pins.analogReadPin(AnalogPin.P2)
    p_val = base
    p_read = 0
    p_dis = 0
    p_send = 0
    rec = true
}
bluetooth.onBluetoothConnected(function () {
    bt_c = true
})
bluetooth.onBluetoothDisconnected(function () {
    bt_c = false
})
function read() {
    let signal = pins.analogReadPin(AnalogPin.P2)
    let area = (signal + p_val) / 2 - (base + noise)
    p_val = signal
    if (area > 0) {
        total += area
    }
}
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    let data = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    if (data.charAt(0) == 'R'){
        let ng = parseInt(data.slice(1))
        if(ng > 0){
            goal = ng
        }
        reset()
    }
})
function disp_tot () {
    led.plot(0, 0)
    let lit_leds: number = 0
    lit_leds = Math.round(Math.map(total, 0, goal, 0, 25))
    for (let y = 0; y <= 4; y++) {
        for (let x = 0; x <= 4; x++) {
            if (5 * y + x <= lit_leds) {
                led.plot(x, y)
            }
        }
    }
}
function snd_tot () {
    if (bt_c) {
        let perc: number = 0;
        perc = Math.round(100 * (total / goal))
        if(perc > 100){
            perc = 100
        }
        bluetooth.uartWriteLine(convertToText(perc))
    }
}

let p_val = 0
let p_send = 0
let p_dis = 0
let p_read = 0
let base = 0
let total = 0
let bt_c = false
let goal = 3000
let noise = 4
let rec = false
bluetooth.startUartService()
basic.showNumber(pins.analogReadPin(AnalogPin.P2))
reset()
basic.forever(function () {
    if(rec){
        if (input.runningTime() > p_read + 20) {
            p_read = input.runningTime()
            read()
        }
        if (input.runningTime() > p_dis + 500) {
            p_dis = input.runningTime()
            disp_tot()
        }
        if (input.runningTime() > p_send + 500) {
            p_send = input.runningTime()
            snd_tot()
        }
        if (total >= goal) {
            reset()
        }
    }
})

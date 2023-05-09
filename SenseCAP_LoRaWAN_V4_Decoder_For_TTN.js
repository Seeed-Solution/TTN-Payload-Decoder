function decodeUplink (input) {
    var bytes = input['bytes']
    var bytesString = bytes2HexString(bytes).toLocaleUpperCase()
    var decoded = {
        valid: true,
        err: 0,
        payload: bytesString,
        messages: []
    }
    let measurement = messageAnalyzed(bytesString)
    decoded.messages = measurement
    return { data: decoded }
}

function messageAnalyzed (messageValue) {
    try {
        let frames = unpack(messageValue)
        let measurementResultArray = []
        for (let i = 0; i < frames.length; i++) {
            let item = frames[i]
            let dataId = item.dataId
            let dataValue = item.dataValue
            let measurementArray = deserialize(dataId, dataValue)
            measurementResultArray.push(measurementArray)
        }
        return measurementResultArray
    } catch (e) {
        return e.toString()
    }
}

function unpack (messageValue) {
    let frameArray = []

    for (let i = 0; i < messageValue.length; i++) {
        let remainMessage = messageValue
        let dataId = remainMessage.substring(0, 2)
        let dataValue
        let dataObj = {}
        switch (dataId) {
            case '01':
                dataValue = remainMessage.substring(2, 94)
                messageValue = remainMessage.substring(94)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '02':
                dataValue = remainMessage.substring(2, 32)
                messageValue = remainMessage.substring(32)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '03':
                break
            case '04':
                dataValue = remainMessage.substring(2, 20)
                messageValue = remainMessage.substring(20)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '05':
                dataValue = remainMessage.substring(2, 10)
                messageValue = remainMessage.substring(10)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '06':
                dataValue = remainMessage.substring(2, 44)
                messageValue = remainMessage.substring(44)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '07':
                dataValue = remainMessage.substring(2, 76)
                messageValue = remainMessage.substring(76)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '08':
                dataValue = remainMessage.substring(2, 70)
                messageValue = remainMessage.substring(70)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '09':
                dataValue = remainMessage.substring(2, 36)
                messageValue = remainMessage.substring(36)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '0A':
                dataValue = remainMessage.substring(2, 68)
                messageValue = remainMessage.substring(68)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '0B':
                dataValue = remainMessage.substring(2, 62)
                messageValue = remainMessage.substring(62)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '0C':
                break
            default:
                dataValue = ''
                break
        }
        if (dataValue.length < 2) {
            break
        }
        frameArray.push(dataObj)
    }
    return frameArray
}

function deserialize (dataId, dataValue) {
    let measurementArray = []
    switch (dataId) {
        case '01':
            measurementArray = getUpShortInfo(dataValue)
            break
        case '02':
            measurementArray = getUpShortInfo(dataValue)
            break
        case '05':
            measurementArray = [
                {measurementId: '3000', type: 'Battery', measurementValue: getBattery(dataValue.substring(0, 2))}
            ]
            break
        case '06':
            measurementArray = [
                {measurementId: '4197', type: 'Longitude', measurementValue: getSensorValue(dataValue.substring(16, 24), 1000000)},
                {measurementId: '4198', type: 'Latitude', measurementValue: getSensorValue(dataValue.substring(24, 32), 1000000)},
                {measurementId: '4097', type: 'Air Temperature', measurementValue: getSensorValue(dataValue.substring(32, 36), 10)},
                {measurementId: '4199', type: 'Light', measurementValue: getSensorValue(dataValue.substring(36, 40))},
                {measurementId: '3000', type: 'Battery', measurementValue: getBattery(dataValue.substring(40, 42))}
            ]
            break
        case '09':
            measurementArray = [
                {measurementId: '4197', type: 'Longitude', measurementValue: getSensorValue(dataValue.substring(16, 24), 1000000)},
                {measurementId: '4198', type: 'Latitude', measurementValue: getSensorValue(dataValue.substring(24, 32), 1000000)},
                {measurementId: '3000', type: 'Battery', measurementValue: getBattery(dataValue.substring(32, 34))}
            ]
            break
    }
    return measurementArray
}

function getUpShortInfo (messageValue) {
    return [
        {
            measurementId: '3000', type: 'Battery', measurementValue: getBattery(messageValue.substring(0, 2))
        },
        {
            measurementId: '3001', type: 'Hardware Version', measurementValue: getSoftVersion(messageValue.substring(2, 6))
        },
        {
            measurementId: '3502', type: 'Firmware Version', measurementValue: getHardVersion(messageValue.substring(6, 10))
        },
        {
            measurementId: '3940', type: 'Heartbeat Interval', measurementValue: getOneWeekInterval(messageValue.substring(14, 18))
        },
        {
            measurementId: '3911', type: 'Uplink Interval', measurementValue: getOneWeekInterval(messageValue.substring(18, 22))
        }
    ]
}
function getBattery (batteryStr) {
    return loraWANV2DataFormat(batteryStr)
}
function getSoftVersion (softVersion) {
    return `${loraWANV2DataFormat(softVersion.substring(0, 2))}.${loraWANV2DataFormat(softVersion.substring(2, 4))}`
}
function getHardVersion (hardVersion) {
    return `${loraWANV2DataFormat(hardVersion.substring(0, 2))}.${loraWANV2DataFormat(hardVersion.substring(2, 4))}`
}

function getOneWeekInterval (str) {
    return loraWANV2DataFormat(str)
}
function getSensorValue (str, dig) {
    if (str === '8000') {
        return null
    } else {
        return loraWANV2DataFormat(str, dig)
    }
}

function bytes2HexString (arrBytes) {
    var str = ''
    for (var i = 0; i < arrBytes.length; i++) {
        var tmp
        var num = arrBytes[i]
        if (num < 0) {
            tmp = (255 + num + 1).toString(16)
        } else {
            tmp = num.toString(16)
        }
        if (tmp.length === 1) {
            tmp = '0' + tmp
        }
        str += tmp
    }
    return str
}
function loraWANV2DataFormat (str, divisor = 1) {
    let strReverse = bigEndianTransform(str)
    let str2 = toBinary(strReverse)
    if (str2.substring(0, 1) === '1') {
        let arr = str2.split('')
        let reverseArr = arr.map((item) => {
            if (parseInt(item) === 1) {
                return 0
            } else {
                return 1
            }
        })
        str2 = parseInt(reverseArr.join(''), 2) + 1
        return '-' + str2 / divisor
    }
    return parseInt(str2, 2) / divisor
}

function bigEndianTransform (data) {
    let dataArray = []
    for (let i = 0; i < data.length; i += 2) {
        dataArray.push(data.substring(i, i + 2))
    }
    return dataArray
}

function toBinary (arr) {
    let binaryData = arr.map((item) => {
        let data = parseInt(item, 16)
            .toString(2)
        let dataLength = data.length
        if (data.length !== 8) {
            for (let i = 0; i < 8 - dataLength; i++) {
                data = `0` + data
            }
        }
        return data
    })
    let ret = binaryData.toString()
        .replace(/,/g, '')
    return ret
}
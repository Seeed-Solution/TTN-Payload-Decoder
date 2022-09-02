/**
 * Entry, decoder.js
 */

function Decoder(bytes, port) {
    // data split
    let splitArray = dataSplit(bytes);
    console.log('end data split >>>>>>>>>>>>>>>>', splitArray)
    // data decoder
    let measurementResultArray = []
    for (let i = 0; i < splitArray.length; i++) {
        let item = splitArray[i]
        let dataId = item.dataId
        let dataValue = item.dataValue
        let measurementArray = dataIdAndDataValueJudge(dataId, dataValue)
        measurementResultArray.push(measurementArray)
    }
    console.log(`end data decode >>>>>>>>>>>>${JSON.stringify(measurementResultArray)}`)
    return measurementResultArray
}

/**
 * data splits
 * @param bytes
 * @returns {*[]}
 */
function dataSplit(bytes) {
    let frameArray = []
    for (let i = 0; i < bytes.length; i++) {
        let remainingValue = bytes
        let dataId = remainingValue.substring(0, 2)
        let dataValue
        let dataObj = {}
        switch (dataId) {
            case '40' :
            case '41' :
            case '42' :
            case '43' :
            case '44' :
            case '45' :
                dataValue = remainingValue.substring(2, 22)
                bytes = remainingValue.substring(22)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            default:
                dataValue = '9'
                console.log(`!!!!!Illegal Data Id`)
                break
        }
        if (dataValue.length < 2) {
            break
        }
        frameArray.push(dataObj)
    }
    return frameArray
}

function dataIdAndDataValueJudge(dataId, dataValue) {
    let measurementArray = []
    switch (dataId) {
        case '40':
        case '41':
            // lightIntensity
            let lightIntensity = dataValue.substring(0, 4)
            // loudness
            let loudness = dataValue.substring(4, 8)
            // X
            let accelerateX = dataValue.substring(8, 12)
            // Y
            let accelerateY = dataValue.substring(12, 16)
            // Z
            let accelerateZ = dataValue.substring(16, 20)
            measurementArray = [{
                value: loraWANV2DataFormat(lightIntensity), measurementId: '4193'
            }, {
                value: loraWANV2DataFormat(loudness), measurementId: '4192'
            }, {
                value: loraWANV2DataFormat(accelerateX, 100), measurementId: '4150'
            }, {
                value: loraWANV2DataFormat(accelerateY, 100), measurementId: '4151'
            }, {
                value: loraWANV2DataFormat(accelerateZ, 100), measurementId: '4152'
            }]
            break
        case '42':
            // airTemperature
            let airTemperature = dataValue.substring(0, 4)
            // AirHumidity
            let AirHumidity = dataValue.substring(4, 8)
            // tVOC
            let tVOC = dataValue.substring(8, 12)
            // CO2eq
            let CO2eq = dataValue.substring(12, 16)
            // Z
            let soilMoisture = dataValue.substring(16, 20)
            measurementArray = [{
                value: loraWANV2DataFormat(airTemperature, 100), measurementId: '4097'
            }, {
                value: loraWANV2DataFormat(AirHumidity, 100), measurementId: '4098'
            }, {
                value: loraWANV2DataFormat(tVOC), measurementId: '4200'
            }, {
                value: loraWANV2DataFormat(CO2eq), measurementId: '4201'
            }, {
                value: loraWANV2DataFormat(soilMoisture), measurementId: '4103'
            }]
            break
        case '43':
        case '44':
            // Vision AI:
            // AI the first frame
            console.log(`!!! AI the first frame ${dataValue}`)
            let initDevkitMeasurementId = 4175
            for (let i = 0; i < dataValue.length; i += 4) {
                let modelId = loraWANV2DataFormat(dataValue.substring(i, i + 2))
                let detectionType = loraWANV2DataFormat(dataValue.substring(i + 2, i + 4))
                let aiHeadValues = `${modelId}.${detectionType}`
                measurementArray.push({
                    value: aiHeadValues, measurementId: initDevkitMeasurementId
                })
                initDevkitMeasurementId++
            }
            break
        case '45':
            // Vision AI:
            // AI output frame
            console.log(`!!! AI output frame ${dataValue}`)
            let initTailDevKitMeasurementId = 4180
            for (let i = 0; i < dataValue.length; i += 4) {
                console.log(`version ai pending info ${dataValue}`)
                let modelId = loraWANV2DataFormat(dataValue.substring(i, i + 2))
                let detectionType = loraWANV2DataFormat(dataValue.substring(i + 2, i + 4))
                let aiTailValues = `${modelId}.${detectionType}`
                measurementArray.push({
                    value: aiTailValues, measurementId: initTailDevKitMeasurementId
                })
                initTailDevKitMeasurementId++
            }
            break
        default:
            console.error(`!!!!!!!!!illegal request`)
            break
    }
    return measurementArray
}

/**
 *
 * data formatting
 * @param str
 * @param divisor
 * @returns {string|number}
 */
function loraWANV2DataFormat(str, divisor = 1) {
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

/**
 * Handling big-endian data formats
 * @param data
 * @returns {*[]}
 */
function bigEndianTransform(data) {
    let dataArray = []
    for (let i = 0; i < data.length; i += 2) {
        dataArray.push(data.substring(i, i + 2))
    }
    // array of hex
    return dataArray
}

/**
 * Convert to an 8-digit binary number with 0s in front of the number
 * @param arr
 * @returns {string}
 */
function toBinary(arr) {
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

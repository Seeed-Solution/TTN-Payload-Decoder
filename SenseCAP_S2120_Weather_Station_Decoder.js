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
            //S2120
            case '01' :
                dataValue = remainingValue.substring(2, 22)
                bytes = remainingValue.substring(22)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            //S2120 (8 in 1)，Data acquisition output frame
            case '02':
                dataValue = remainingValue.substring(2, 18)
                bytes = remainingValue.substring(18)
                dataObj = {
                    'dataId': '02', 'dataValue': dataValue
                }
                break
            //S2120 (8 in 1),03 report power;06 error code
            case '03' :
            case '06':
                dataValue = remainingValue.substring(2, 4)
                bytes = remainingValue.substring(4)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            case '04':
                dataValue = remainingValue.substring(2, 20)
                bytes = remainingValue.substring(20)
                dataObj = {
                    'dataId': dataId, 'dataValue': dataValue
                }
                break
            //S2120 (8 in 1),Report sensor collection interval, GPS collection interval
            case '05' :
                dataValue = bytes.substring(2, 10)
                bytes = remainingValue.substring(10)
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
        case '01':
            // temperature
            let temperature = dataValue.substring(0, 4)
            // humidity
            let humidity = dataValue.substring(4, 6)
            // illumination
            let illumination = dataValue.substring(6, 14)
            // uv
            let uv = dataValue.substring(14, 16)
            // windSpeed
            let windSpeed = dataValue.substring(16, 20)
            measurementArray = [{
                value: loraWANV2DataFormat(temperature, 10), measurementId: '4097',
            }, {
                value: loraWANV2DataFormat(humidity), measurementId: '4098',
            }, {
                value: loraWANV2DataFormat(illumination), measurementId: '4099',
            }, {
                value: loraWANV2DataFormat(uv, 10), measurementId: '4190',
            }, {
                value: loraWANV2DataFormat(windSpeed, 10), measurementId: '4105',
            }]
            break
        case '02':
            // windDirection
            let windDirection = dataValue.substring(0, 4)
            // rainfall
            let rainfall = dataValue.substring(4, 12)
            // airPressure
            let airPressure = dataValue.substring(12, 16)
            measurementArray = [{
                value: loraWANV2DataFormat(windDirection), measurementId: '4104',
            }, {
                value: loraWANV2DataFormat(rainfall, 1000), measurementId: '4113',
            }, {
                value: loraWANV2DataFormat(airPressure, 0.1), measurementId: '4101',
            }]
            break
        case '03':
            // electricity
            let electricity = dataValue
            measurementArray = [{
                '3000': loraWANV2DataFormat(electricity), dataId: 3
            }]
            break
        case '04':
            // electricity whether
            let electricityWhether = dataValue.substring(0, 2)
            // hardware version
            let hwv = dataValue.substring(2, 6)
            //Software version
            let bdv = dataValue.substring(6, 10)
            // Sensor acquisition interval
            let sensorAcquisitionInterval = dataValue.substring(10, 14)
            // gps Collection interva
            let gpsAcquisitionInterval = dataValue.substring(14, 18)
            measurementArray = [{
                dataId: 4,
                '3000': loraWANV2DataFormat(electricityWhether),
                '3001': `${loraWANV2DataFormat(hwv.substring(0, 2))}.${loraWANV2DataFormat(hwv.substring(2, 4))}`,
                '3502': `${loraWANV2DataFormat(bdv.substring(0, 2))}.${loraWANV2DataFormat(bdv.substring(2, 4))}`,
                '3900': parseInt(loraWANV2DataFormat(sensorAcquisitionInterval)) * 60,
                '3911': parseInt(loraWANV2DataFormat(gpsAcquisitionInterval)) * 60
            }]
            break
        case '05':
            // Sensor acquisition interval
            let sensorAcquisitionIntervalFive = dataValue.substring(0, 4)
            // gps Collection interval
            let gpsAcquisitionIntervalFive = dataValue.substring(4, 8)
            measurementArray = [{
                dataId: 5,
                '3900': parseInt(loraWANV2DataFormat(sensorAcquisitionIntervalFive)) * 60,
                '3911': parseInt(loraWANV2DataFormat(gpsAcquisitionIntervalFive)) * 60
            }]
            break
        case '06':
            // errorCode
            let errorCode = dataValue
            let descZh
            switch (errorCode) {
                case '02':
                    descZh = 'CCL_SENSOR_WAKEUP_ERROR'
                    break
                case '03':
                    descZh = 'CCL_SENSOR_NOT_RESPONSE'
                    break
                case '04':
                    descZh = 'CCL_SENSOR_DATA_EMPTY'
                    break
                case '05':
                    descZh = 'CCL_SENSOR_DATA_HEAD_ERROR'
                    break
                case '06':
                    descZh = 'CCL_SENSOR_DATA_CRC_ERROR'
                    break
                case '07':
                    descZh = 'CCL_SENSOR_DATA_B1_NO_VALID'
                    break
                case '08':
                    descZh = 'CCL_SENSOR_DATA_B2_NO_VALID'
                    break
                case '09':
                    descZh = 'CCL_SENSOR_RANDOM_NOT_MATCH'
                    break
                case '0A':
                    descZh = 'CCL_SENSOR_PUBKEY_SIGN_VERIFY_FAILED'
                    break
                case '0B':
                    descZh = 'CCL_SENSOR_DATA_SIGN_VERIFY_FAILED'
                    break
                default:
                    descZh = 'CC_OTHER_FAILED'
                    break
            }
            measurementArray = [{
                measurementId: '4101', errCode: errorCode, descZh: descZh
            }]
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

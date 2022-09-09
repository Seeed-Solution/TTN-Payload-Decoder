/**
 * Entry, decoder.js
 */
function Decoder (bytes, port) {
  // data split
  let splitArray = dataSplit(bytes)
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
function dataSplit (bytes) {
  let frameArray = []

  for (let i = 0; i < bytes.length; i++) {
    let remainingValue = bytes
    let dataId = remainingValue.substring(0, 2)
    let dataValue
    let dataObj = {}
    switch (dataId) {
      case '01' :
      case '20' :
      case '21' :
      case '30' :
      case '31' :
      case '33' :
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
      case '02':
        dataValue = remainingValue.substring(2, 18)
        bytes = remainingValue.substring(18)
        dataObj = {
          'dataId': '02', 'dataValue': dataValue
        }
        break
      case '03' :
      case '06':
        dataValue = remainingValue.substring(2, 4)
        bytes = remainingValue.substring(4)
        dataObj = {
          'dataId': dataId, 'dataValue': dataValue
        }
        break
      case '05' :
      case '34':
        dataValue = bytes.substring(2, 10)
        bytes = remainingValue.substring(10)
        dataObj = {
          'dataId': dataId, 'dataValue': dataValue
        }
        break
      case '04':
      case '10':
      case '32':
      case '35':
      case '36':
      case '37':
      case '38':
      case '39':
        dataValue = bytes.substring(2, 20)
        bytes = remainingValue.substring(20)
        dataObj = {
          'dataId': dataId, 'dataValue': dataValue
        }
        break
      default:
        dataValue = '9'
        console.log(`!!!!!!!!!!!!!!illegal data id`)
        break
    }
    if (dataValue.length < 2) {
      break
    }
    frameArray.push(dataObj)
  }
  return frameArray
}

function dataIdAndDataValueJudge (dataId, dataValue) {
  let measurementArray = []
  switch (dataId) {
    case '01':
      let temperature = dataValue.substring(0, 4)
      let humidity = dataValue.substring(4, 6)
      let illumination = dataValue.substring(6, 14)
      let uv = dataValue.substring(14, 16)
      let windSpeed = dataValue.substring(16, 20)
      measurementArray = [{
        value: loraWANV2DataFormat(temperature, 10), measurementId: '4097'
      }, {
        value: loraWANV2DataFormat(humidity), measurementId: '4098'
      }, {
        value: loraWANV2DataFormat(illumination), measurementId: '4099'
      }, {
        value: loraWANV2DataFormat(uv, 10), measurementId: '4190'
      }, {
        value: loraWANV2DataFormat(windSpeed, 10), measurementId: '4105'
      }]
      break
    case '02':
      let windDirection = dataValue.substring(0, 4)
      let rainfall = dataValue.substring(4, 12)
      let airPressure = dataValue.substring(12, 16)
      measurementArray = [{
        value: loraWANV2DataFormat(windDirection), measurementId: '4104'
      }, {
        value: loraWANV2DataFormat(rainfall, 1000), measurementId: '4113'
      }, {

        value: loraWANV2DataFormat(airPressure, 0.1), measurementId: '4101'
      }]
      break
    case '03':
      let Electricity = dataValue
      measurementArray = [{
        '3000': loraWANV2DataFormat(Electricity)
      }]
      break
    case '04':
      let electricityWhether = dataValue.substring(0, 2)
      let hwv = dataValue.substring(2, 6)
      let bdv = dataValue.substring(6, 10)
      let sensorAcquisitionInterval = dataValue.substring(10, 14)
      let gpsAcquisitionInterval = dataValue.substring(14, 18)
      measurementArray = [{
        '3000': loraWANV2DataFormat(electricityWhether),
        '3001': `${loraWANV2DataFormat(hwv.substring(0, 2))}.${loraWANV2DataFormat(hwv.substring(2, 4))}`,
        '3502': `${loraWANV2DataFormat(bdv.substring(0, 2))}.${loraWANV2DataFormat(bdv.substring(2, 4))}`,
        '3900': parseInt(loraWANV2DataFormat(sensorAcquisitionInterval)) * 60,
        '3911': parseInt(loraWANV2DataFormat(gpsAcquisitionInterval)) * 60
      }]
      break
    case '05':
      let sensorAcquisitionIntervalFive = dataValue.substring(0, 4)
      let gpsAcquisitionIntervalFive = dataValue.substring(4, 8)
      measurementArray = [{
        '3900': parseInt(loraWANV2DataFormat(sensorAcquisitionIntervalFive)) * 60,
        '3911': parseInt(loraWANV2DataFormat(gpsAcquisitionIntervalFive)) * 60
      }]
      break
    case '06':
      let errorCode = dataValue
      let descZh
      switch (errorCode) {
        case '00':
          descZh = 'CCL_SENSOR_ERROR_NONE'
          break
        case '01':
          descZh = 'CCL_SENSOR_NOT_FOUND'
          break
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
        case '0C':
          descZh = 'CCL_SENSOR_DATA_VALUE_HI'
          break
        case '0D':
          descZh = 'CCL_SENSOR_DATA_VALUE_LOW'
          break
        case '0E':
          descZh = 'CCL_SENSOR_DATA_VALUE_MISSED'
          break
        case '0F':
          descZh = 'CCL_SENSOR_ARG_INVAILD'
          break
        case '10':
          descZh = 'CCL_SENSOR_RS485_MASTER_BUSY'
          break
        case '11':
          descZh = 'CCL_SENSOR_RS485_REV_DATA_ERROR'
          break
        case '12':
          descZh = 'CCL_SENSOR_RS485_REG_MISSED'
          break
        case '13':
          descZh = 'CCL_SENSOR_RS485_FUN_EXE_ERROR'
          break
        case '14':
          descZh = 'CCL_SENSOR_RS485_WRITE_STRATEGY_ERROR'
          break
        case '15':
          descZh = 'CCL_SENSOR_CONFIG_ERROR'
          break
        case 'FF':
          descZh = 'CCL_SENSOR_DATA_ERROR_UNKONW'
          break
        default:
          descZh = 'CC_OTHER_FAILED'
          break
      }
      measurementArray = [{
        measurementId: '4101', type: 'sensor_error_event', errCode: errorCode, descZh
      }]
      break
    case '10':
      let statusValue = dataValue.substring(0, 2)
      let { channel, status, type } = loraWANV2BitDataFormat(statusValue)
      let sensecapId = dataValue.substring(2)
      measurementArray = [{
        channel: channel, status: status, channelType: type, sensorEui: sensecapId
      }]
      break
    case '20':
      let initMeasurementId = 4175
      let sensor = []
      for (let i = 0; i < dataValue.length; i += 4) {
        let modelId = loraWANV2DataFormat(dataValue.substring(i, i + 2))
        let detectionType = loraWANV2DataFormat(dataValue.substring(i + 2, i + 4))
        let aiHeadValues = `${modelId}.${detectionType}`
        sensor.push({

          value: aiHeadValues, measurementId: initMeasurementId
        })
        initMeasurementId++
      }
      measurementArray = sensor
      break
    case '21':
      // Vision AI:
      // AI 识别输出帧
      let tailValueArray = []
      let initTailMeasurementId = 4180
      for (let i = 0; i < dataValue.length; i += 4) {
        let modelId = loraWANV2DataFormat(dataValue.substring(i, i + 2))
        let detectionType = loraWANV2DataFormat(dataValue.substring(i + 2, i + 4))
        let aiTailValues = `${modelId}.${detectionType}`
        tailValueArray.push({

          value: aiTailValues, measurementId: initTailMeasurementId
        })
        initTailMeasurementId++
      }
      measurementArray = tailValueArray
      break
    case '30':
    case '31':
      // 首帧或者首帧输出帧
      let channelInfoOne = loraWANV2ChannelBitFormat(dataValue.substring(0, 2))
      let dataInfoOne = loraWANV2DataLogBitFormat(dataValue.substring(2, 4))
      let dataOne = {

        value: loraWANV2DataFormat(dataValue.substring(4, 12), 1000), measurementId: 4164 + parseInt(channelInfoOne.one)
      }
      let dataTwo = {

        value: loraWANV2DataFormat(dataValue.substring(12, 20), 1000),
        measurementId: 4164 + parseInt(channelInfoOne.two)
      }
      let cacheArrayInfo = []
      if (parseInt(channelInfoOne.one)) {
        cacheArrayInfo.push(dataOne)
      }
      if (parseInt(channelInfoOne.two)) {
        cacheArrayInfo.push(dataTwo)
      }
      let isTHObjOne = {
        value: dataInfoOne.isTH, measurementId: 4194
      }
      cacheArrayInfo.forEach(item => {
        measurementArray.push(item)
      })
      measurementArray.push(isTHObjOne)
      break
    case '32':
      let channelInfoTwo = loraWANV2ChannelBitFormat(dataValue.substring(0, 2))
      let dataThree = {
        value: loraWANV2DataFormat(dataValue.substring(2, 10), 1000),
        measurementId: 4164 + parseInt(channelInfoTwo.one),
      }
      let dataFour = {
        value: loraWANV2DataFormat(dataValue.substring(10, 18), 1000),
        measurementId: 4164 + parseInt(channelInfoTwo.two)
      }
      if (parseInt(channelInfoTwo.one)) {
        measurementArray.push(dataThree)
      }
      if (parseInt(channelInfoTwo.two)) {
        measurementArray.push(dataFour)
      }
      break
    case '33':
      let channelInfoThree = loraWANV2ChannelBitFormat(dataValue.substring(0, 2))
      let dataInfoThree = loraWANV2DataLogBitFormat(dataValue.substring(2, 4))
      let isTHObjTwo = {
        channel: channelInfoThree.two, value: dataInfoThree.isTH, measurementId: 4194
      }
      let dataFive = {
        value: loraWANV2DataFormat(dataValue.substring(4, 12), 1000),
        measurementId: 4164 + parseInt(channelInfoThree.one)
      }
      let dataSix = {
        value: loraWANV2DataFormat(dataValue.substring(12, 20), 1000),
        measurementId: 4164 + parseInt(channelInfoThree.two)
      }
      if (parseInt(channelInfoThree.one)) {
        measurementArray.push(dataFive)
      }
      if (parseInt(channelInfoThree.two)) {
        measurementArray.push(dataSix)
      }
      measurementArray.push(isTHObjTwo)

      break
    case '34':
      let model = loraWANV2DataFormat(dataValue.substring(0, 2))
      let GPIOInput = loraWANV2DataFormat(dataValue.substring(2, 4))
      let simulationModel = loraWANV2DataFormat(dataValue.substring(4, 6))
      let simulationInterface = loraWANV2DataFormat(dataValue.substring(6, 8))
      measurementArray = [{
        dataId: 34, '3570': model, '3571': GPIOInput, '3572': simulationModel, '3573': simulationInterface
      }]
      break
    case '35':
    case '36':
      let channelTDOne = loraWANV2ChannelBitFormat(dataValue.substring(0, 2))
      let channelSortTDOne = 3920 + (parseInt(channelTDOne.one) - 1) * 2
      let channelSortTDTWO = 3921 + (parseInt(channelTDOne.one) - 1) * 2
      measurementArray = [{
        [channelSortTDOne]: loraWANV2DataFormat(dataValue.substring(2, 10), 1000),
        [channelSortTDTWO]: loraWANV2DataFormat(dataValue.substring(10, 18), 1000)
      }]
      break
    case '37':
      let channelTDInfoTwo = loraWANV2ChannelBitFormat(dataValue.substring(0, 2))
      let channelSortOne = 3920 + (parseInt(channelTDInfoTwo.one) - 1) * 2
      let channelSortTWO = 3921 + (parseInt(channelTDInfoTwo.one) - 1) * 2
      measurementArray = [{
        [channelSortOne]: loraWANV2DataFormat(dataValue.substring(2, 10), 1000),
        [channelSortTWO]: loraWANV2DataFormat(dataValue.substring(10, 18), 1000)
      }]
      break
    case '38':
      let channelTDInfoThree = loraWANV2ChannelBitFormat(dataValue.substring(0, 2))
      let channelSortThreeOne = 3920 + (parseInt(channelTDInfoThree.one) - 1) * 2
      let channelSortThreeTWO = 3921 + (parseInt(channelTDInfoThree.one) - 1) * 2
      measurementArray = [{
        [channelSortThreeOne]: loraWANV2DataFormat(dataValue.substring(2, 10), 1000),
        [channelSortThreeTWO]: loraWANV2DataFormat(dataValue.substring(10, 18), 1000)
      }]
      break
    case '39':
      let electricityWhetherTD = dataValue.substring(0, 2)
      let hwvTD = dataValue.substring(2, 6)
      let bdvTD = dataValue.substring(6, 10)
      let sensorAcquisitionIntervalTD = dataValue.substring(10, 14)
      let gpsAcquisitionIntervalTD = dataValue.substring(14, 18)
      measurementArray = [{
        dataId: parseInt(dataId),
        '3000': loraWANV2DataFormat(electricityWhetherTD),
        '3001': `${loraWANV2DataFormat(hwvTD.substring(0, 2))}.${loraWANV2DataFormat(hwvTD.substring(2, 4))}`,
        '3502': `${loraWANV2DataFormat(bdvTD.substring(0, 2))}.${loraWANV2DataFormat(bdvTD.substring(2, 4))}`,
        '3900': parseInt(loraWANV2DataFormat(sensorAcquisitionIntervalTD)) * 60,
        '3912': parseInt(loraWANV2DataFormat(gpsAcquisitionIntervalTD))
      }]
      break
    case '40':
    case '41':
      let lightIntensity = dataValue.substring(0, 4)
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
      let airTemperature = dataValue.substring(0, 4)
      let AirHumidity = dataValue.substring(4, 8)
      let tVOC = dataValue.substring(8, 12)
      let CO2eq = dataValue.substring(12, 16)
      let soilMoisture = dataValue.substring(16, 20)
      measurementArray = [{
        value: loraWANV2DataFormat(airTemperature, 100), measurementId: '4097'
      }, {
        value: loraWANV2DataFormat(AirHumidity, 100), measurementId: '4098'
      }, {
        value: loraWANV2DataFormat(tVOC), measurementId: '4195'
      }, {
        value: loraWANV2DataFormat(CO2eq), measurementId: '4100'
      }, {
        value: loraWANV2DataFormat(soilMoisture), measurementId: '4103'
      }]
      break
    case '43':
    case '44':
      let headerDevKitValueArray = []
      let initDevkitMeasurementId = 4175
      for (let i = 0; i < dataValue.length; i += 4) {
        let modelId = loraWANV2DataFormat(dataValue.substring(i, i + 2))
        let detectionType = loraWANV2DataFormat(dataValue.substring(i + 2, i + 4))
        let aiHeadValues = `${modelId}.${detectionType}`
        headerDevKitValueArray.push({
          value: aiHeadValues, measurementId: initDevkitMeasurementId,
        })
        initDevkitMeasurementId++
      }
      measurementArray = headerDevKitValueArray
      break
    case '45':
      let initTailDevKitMeasurementId = 4180
      for (let i = 0; i < dataValue.length; i += 4) {
        let modelId = loraWANV2DataFormat(dataValue.substring(i, i + 2))
        let detectionType = loraWANV2DataFormat(dataValue.substring(i + 2, i + 4))
        let aiTailValues = `${modelId}.${detectionType}`
        measurementArray.push({
          value: aiTailValues, measurementId: initTailDevKitMeasurementId,
        })
        initTailDevKitMeasurementId++
      }
      break
    default:
      console.log('>>>>>>>>>>>>>>>>>>illegal request')
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

/**
 * Handling big-endian data formats
 * @param data
 * @returns {*[]}
 */
function bigEndianTransform (data) {
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

/**
 * sensor
 * @param str
 * @returns {{channel: number, type: number, status: number}}
 */
function loraWANV2BitDataFormat (str) {
  let strReverse = bigEndianTransform(str)
  let str2 = toBinary(strReverse)
  let channel = parseInt(str2.substring(0, 4), 2)
  let status = parseInt(str2.substring(4, 5), 2)
  let type = parseInt(str2.substring(5), 2)
  return { channel, status, type }
}

/**
 * channel info
 * @param str
 * @returns {{channelTwo: number, channelOne: number}}
 */
function loraWANV2ChannelBitFormat (str) {
  let strReverse = bigEndianTransform(str)
  let str2 = toBinary(strReverse)
  let one = parseInt(str2.substring(0, 4), 2)
  let two = parseInt(str2.substring(4, 8), 2)
  let resultInfo = {
    one: one, two: two
  }
  return resultInfo
}

/**
 * data log status bit
 * @param str
 * @returns {{total: number, level: number, isTH: number}}
 */
function loraWANV2DataLogBitFormat (str) {
  let strReverse = bigEndianTransform(str)
  let str2 = toBinary(strReverse)
  let isTH = parseInt(str2.substring(0, 1), 2)
  let total = parseInt(str2.substring(1, 5), 2)
  let left = parseInt(str2.substring(5), 2)
  let resultInfo = {
    isTH: isTH, total: total, left: left
  }
  return resultInfo
}

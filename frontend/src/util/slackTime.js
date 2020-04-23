
const getMillis = (ts) => parseInt(ts.split('.')[0]) * 1000

const getTime = (ts) => {
  const date = new Date(getMillis(ts))
  const hour = date.getHours()
  const hour12 = (hour > 12 || hour === 0) ? hour - 12 : hour
  const ampm = hour >= 12 ? 'pm' : 'am'
  const minute = date.getMinutes() < 10 ? '0' + date.getMinutes().toString() : date.getMinutes().toString()

  return `${hour12}:${minute} ${ampm}`
}

const getDayMillis = (ts) => {
  const date = new Date(getMillis(ts))
  date.setHours(0, 0, 0, 0)

  return date.getTime()
}

const getDate = (ts) => {
  return new Date(getMillis(ts)).toString().replace(/.* ([\w]+) ([\d]{1,2}) ([\d]{4}).*/, '$1 $2, $3')
}

const getDateString = (ts) => {
  return new Date(getMillis(ts)).toString()
}

const toSlackTs = (millis) => {
  return (Math.floor(millis / 1000)).toString() + '.000000'
}

export default {
  getMillis,
  getTime,
  getDayMillis,
  getDate,
  getDateString,
  toSlackTs
}

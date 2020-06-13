
export const getMillis = (ts) => parseInt(ts.split('.')[0]) * 1000

export const getTime = (ts) => {
  const date = new Date(getMillis(ts))
  const hour = date.getHours()
  const hour12 = (hour > 12 || hour === 0) ? hour - 12 : hour
  const ampm = hour >= 12 ? 'pm' : 'am'
  const minute = date.getMinutes() < 10 ? '0' + date.getMinutes().toString() : date.getMinutes().toString()

  return `${hour12}:${minute} ${ampm}`
}

export const getDayMillis = (ts) => {
  const date = new Date(getMillis(ts))
  date.setHours(0, 0, 0, 0)

  return date.getTime()
}

export const getDate = (ts) => {
  return new Date(getMillis(ts)).toString().replace(/.* ([\w]+) ([\d]{1,2}) ([\d]{4}).*/, '$1 $2, $3')
}

export const getDateString = (ts) => {
  return new Date(getMillis(ts)).toString()
}

export const toSlackTs = (millis) => {
  return (Math.floor(millis / 1000)).toString() + '.000000'
}

const fs = require('fs')

const staticI18n = function(filepath) {

  const json = fs.readFileSync(filepath, { encoding: 'utf8' })
  // console.log('json', json)

  const i18nObj = JSON.parse(json)

  if (i18nObj) {
    i18nObj.__filepath = filepath
  }
  // console.log('i18nObj', i18nObj)
  return i18nObj
}
exports.getStaticI18n = staticI18n

const vscode = require('vscode')
const path = require('path')
const fs = require('fs')

const { getI18nPrevKey } = require('../../utils/parser/index.js')
const { getStaticI18n } = require('../../utils/i18n-static/index.js')
const { prevHandler, log } = require('./helper.js')
// i18n前缀
let prevKey = ''

// 静态的 i18n 数据
let staticI18nObj = null

/**
 * 鼠标悬停提示
 * @param {*} document
 * @param {*} position
 * @param {*} token
 */
const provideHover = function (document, position, token) {
  const prevData = prevHandler(document, position, token)
  if (!prevData) return

  const { rootPath, fileName, i18nKey } = prevData

  // 读取当前文件内容
  const fileContent = fs.readFileSync(fileName, { encoding: 'utf-8' })

  // 获取整个 script（包含） 的内容
  const matchResult = fileContent.match(
    /<script[^>]*>((.|\n|\t|\r)+)<\/script>/
  )
  // log('matchResult :>> ', matchResult)

  const isTs =
    fileContent
      .match(/<script([^>]*)>((.|\n|\t|\r)+)<\/script>/)[1]
      .indexOf('ts') > -1
      ? true
      : false
  log('isTs :>> ', isTs)

  // 获取 i18n 前缀
  // t(key: string, value = {}) {
  //   return '' + this.$t('activity.invite.invitationgift.' + key, value)
  // }
  const i18nFunctionName = 't'
  prevKey = getI18nPrevKey(matchResult[1], i18nFunctionName, isTs, fileName) || ''
  log('prevKey :>> ', prevKey)

  const keys = `${prevKey}${i18nKey}`.split('.')
  log('keys :>> ', keys)

  staticI18nObj = getStaticI18n(
    path.resolve(rootPath, `./src/lang-source/zh-cn.json`)
  )
  log('get static i18n', staticI18nObj)

  let val = staticI18nObj
  keys.forEach((key) => {
    if (val[key]) {
      val = val[key]
    } else {
      val = ''
    }
  })

  return new vscode.Hover(
    val
      ? JSON.stringify(val)
      : `* 没有匹配 \n* 或者是 \n* 无法处理的语法已被过滤`
  )
}
exports.provideHover = provideHover

// 获取鼠标 hover 时候，已经得到的信息
const getPrevGetInfo = function() {
  return {
    prevKey,
    staticI18nObj
  }
}
exports.getPrevGetInfo = getPrevGetInfo

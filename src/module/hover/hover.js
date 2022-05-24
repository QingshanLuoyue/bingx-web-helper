const readline = require('readline')
const vscode = require('vscode')
const path = require('path')
const fs = require('fs')

const { getI18nPrevKey } = require('../../utils/parser/index.js')
const { getStaticI18n } = require('../../utils/i18n-static/index.js')

// 鼠标悬停，匹配 t('xxx.yyy.zzz') 多语言格式正则
const i18nReg = /t\(\'[^)]+\'\)/
// 鼠标悬停，匹配 t('xxx.yyy.zzz') 中的多语言key
const i18nKeyReg = /t\('(.+)'\)/
// i18n前缀
let prevKey = ''

// 静态的 i18n 数据
let staticI18nObj = null

// 控制全局日志输出
const debug = false

/**
 * 鼠标悬停提示
 * @param {*} document
 * @param {*} position
 * @param {*} token
 */
function provideHover(document, position, token) {
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

/**
 * ctrl + 鼠标点击跳转
 * @param {*} document
 * @param {*} position
 * @param {*} token
 */
async function provideDefinition(document, position, token) {
  const prevData = prevHandler(document, position, token)
  if (!prevData) return

  const { i18nKey } = prevData

  const keys = `${prevKey}${i18nKey}`.split('.')
  log('provideDefinition:keys :>> ', keys)

  let hitCol = 0,
    filepath = ''

  if (hitCol === 0 && staticI18nObj) {
    // 逐行读取文件，判断 i18nKey 是否在当前行字符串中
    hitCol = await readFileByline(staticI18nObj, keys)
    filepath = staticI18nObj.__filepath
  }
  return new vscode.Location(
    vscode.Uri.file(filepath),
    new vscode.Position(hitCol, 100)
  )
}

// 程序前处理
function prevHandler(document, position, token) {
  const rootPath = vscode.workspace.rootPath
  log('rootPath :>> ', rootPath)

  // 文件路径
  const fileName = document.fileName
  log('fileName :>> ', fileName)

  // 只有 vue 文件才继续往下走
  if (!/\.vue$/.test(fileName)) return

  // 鼠标悬停范围
  // /\$t\(\'[^).]+\'\)/ 正则匹配 hover 的字符串范围
  // 如果没有就随便给个位置
  const range = document.getWordRangeAtPosition(position, i18nReg) || [
    { line: 0, character: 0 }
  ]
  log('鼠标悬停范围 range :>> ', range)

  // range 需要有两个数据长度，说明才有匹配到文本
  if (range.length < 2) {
    return
  }

  // 通过鼠标悬停范围，截取单词
  const word = document.getText(range)
  log('截取单词 word:>> ', word)

  const i18nKey = word.match(i18nKeyReg)[1]
  log('provideDefinition:i18nKey :>> ', i18nKey)
  if (!i18nKey) return

  return {
    rootPath,
    fileName,
    i18nKey
  }
}

// 一行行读取文件内容
async function readFileByline(i18nObj, keys) {
  let col = 0,
    idx = 0,
    hitCol = 0,
    len = keys.length
  const readStrream = fs.createReadStream(i18nObj.__filepath)
  const rl = readline.createInterface({
    input: readStrream
  })
  await new Promise((resolve) => {
    rl.on('line', (input) => {
      // log('input', input)
      if (idx <= len - 1 && input.indexOf(`"${keys[idx]}":`) > -1) {
        log('static input :>> ', input)
        hitCol = col
        log('static 命中 行数为:>> ', hitCol, '行')

        idx++
      }
      col++
    })
    rl.on('close', () => {
      log('static rl close :>> ', hitCol)
      resolve()
    })
  })
  return hitCol
}
module.exports = function (context) {
  // 注册鼠标悬停提示
  context.subscriptions.push(
    vscode.languages.registerHoverProvider('vue', {
      provideHover
    })
  )
  // 注册如何实现跳转到定义，第一个参数表示仅对vue文件生效
  context.subscriptions.push(
    vscode.languages.registerDefinitionProvider(['vue'], {
      provideDefinition
    })
  )
}

// 调试日志输出
function log(...args) {
  if (debug) {
    console.log(...args)
  }
}

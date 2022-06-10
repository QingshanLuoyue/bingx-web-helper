const readline = require('readline')
const vscode = require('vscode')
const fs = require('fs')

const { getPrevGetInfo } = require('./hover')
const { prevHandler, log } = require('./helper.js')

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

  const prevKey = getPrevGetInfo().prevKey
  const staticI18nObj = getPrevGetInfo().staticI18nObj

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
exports.provideDefinition = provideDefinition

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

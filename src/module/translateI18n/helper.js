const vscode = require('vscode')
// 鼠标悬停，匹配 t('xxx.yyy.zzz') 多语言格式正则
const i18nReg = /t\(\'[^)]+\'\)/
// 鼠标悬停，匹配 t('xxx.yyy.zzz') 中的多语言key
const i18nKeyReg = /t\('(.+)'\)/
// 控制全局日志输出
const debug = false

// 程序前处理
exports.prevHandler = function (document, position, token) {
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

// 调试日志输出
function log(...args) {
  if (debug) {
    console.log(...args)
  }
}
exports.log = log


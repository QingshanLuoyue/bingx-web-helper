const vscode = require('vscode')
const { provideHover } = require('./hover.js')
const { provideDefinition } = require('./location.js')
console.log(131323123)
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

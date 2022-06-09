const vscode = require('vscode')
const path = require('path')
const fs = require('fs');

const { getWebviewContent } = require('./html-content.js')

// win: \
// mac/linux: /
const sep = path.normalize('/')

module.exports = function (context) {
  // 创建webview
  const previewComponentDisposable = vscode.commands.registerCommand('previewComponent', async () => {
    const panel = vscode.window.createWebviewPanel(
      'previewComponent', // 标识Web视图的类型。内部使用
      'Preview Component',  // 显示给用户的面板标题
      vscode.ViewColumn.One, // 编辑器列以显示新的Webview面板
      {
        enableScripts: true
      } // Webview选项
    )

    // /Users/admin/Documents/bingx/bingbon-web-activity
    const rootPath = vscode.workspace.rootPath
    // console.log('rootPath', rootPath)

    // /Users/admin/Documents/bingx
    const replaceUrl = rootPath.split(sep).slice(0, -1).join(sep)
    // console.log('replaceUrl :>> ', replaceUrl);

    // Users/admin/Documents/bingx/bingbon-web-activity/src/pages/act/invite/invitationgift/_id
    const filenameUrl = vscode.window.activeTextEditor.document.fileName.replace(/.vue$/, '')
    // console.log('filenameUrl :>> ', filenameUrl);

    // /bingbon-web-activity/src/pages/act/invite/invitationgift/_id
    const imgDiskDir = filenameUrl.replace(replaceUrl, '')
    // console.log('imgDiskPath :>> ', imgDiskDir);

    // /Users/admin/Documents/bingx/bingbon-web-activity/example-image
    const pageImageUrl = `${rootPath}${sep}example-image`
    // console.log('pageImageUrl :>> ', pageImageUrl);

    // /Users/admin/Documents/bingx/bingbon-web-activity/example-image/bingbon-web-activity/src/pages/act/invite/invitationgift/_id
    const finalDir = path.join(pageImageUrl, imgDiskDir)
    // console.log('finalDir :>> ', finalDir);

    if (fs.existsSync(finalDir)) {
      const imgList = await fs.readdirSync(finalDir)
      // console.log('imgList :>> ', imgList);
      const completeImgList = imgList.filter(img => !img.includes('DS_Store')).map(img => {
        return getWebviewUri(panel, `${finalDir}${sep}${img}`)
      })
      // console.log('completeImgList :>> ', completeImgList);
      const o = {
        completeImgList,
        vueLib: getWebviewUri(panel, null, {context, dir: './src/lib', libName: 'vue.min.js'})
      }
      const con = getWebviewContent(o)
      panel.webview.html = con
    }
  })

  context.subscriptions.push(previewComponentDisposable)
}
// 获取能在 webview 中使用的 url
function getWebviewUri(panel, filepath, {context, dir, libName} = {context: null, dir: '', libName: ''}) {
  let url
  if (dir && context) {
    url = path.join(context.extensionPath, dir, libName)
  } else {
    url = filepath
  }
  url = vscode.Uri.file(url)
  return panel.webview.asWebviewUri(url)
}

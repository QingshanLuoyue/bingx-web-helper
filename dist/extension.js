/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 2:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const readline = __webpack_require__(3)
const vscode = __webpack_require__(1)
const path = __webpack_require__(4)
const fs = __webpack_require__(5)

// const { getI18n } = require('../../utils/parser/index.js')
const { getStaticI18n } = __webpack_require__(6)

// 缓存当前数据，只有重启IDE才会更新数据
const instance = {}

/**
 * 鼠标悬停提示，
 * @param {*} document
 * @param {*} position
 * @param {*} token
 */
function provideHover(document, position, token) {
    let rootPath = vscode.workspace.rootPath
    // console.log('rootPath :>> ', rootPath);

    // console.log('token:>> ', token)
    // console.log('当前文件解析对象 document:>> ', document)

    // 文件路径
    const fileName = document.fileName
    console.log('fileName :>> ', fileName)

    // 鼠标悬停范围
    // /\$t\(\'[^).]+\'\)/ 正则匹配 hover 的字符串范围
    // 如果没有就随便给个位置
    const range = document.getWordRangeAtPosition(position, /t\(\'[^)]+\'\)/) || [{ line: 0, character: 0 }]
    console.log('范围 range :>> ', range);

    if (range.length < 2) {
        return
    }

    // 通过鼠标悬停范围，截取单词
    const word = document.getText(range)
    console.log('截取单词 word:>> ', word)

    if (/\.vue$/.test(fileName)) {
        // console.log('\n进入 provideHover 方法\n')

        let i18nKey = word.match(/t\('(.+)'\)/)[1]
        // console.log('i18nKey :>> ', i18nKey)
        if (!i18nKey) {
            return
        }

        // let i18nObj = null
        // 读取当前文件内容
        // let fileContent = fs.readFileSync(fileName, { encoding: 'utf-8' })

        // 获取整个 script（包含） 的内容
        // let matchResult = fileContent.match(/<script[^>]*>((.|\n|\t|\r)+)<\/script>/)
        // let isTs = fileContent.match(/<script([^>]*)>((.|\n|\t|\r)+)<\/script>/)[1].indexOf('ts') > -1 ? true : false
        // console.log('isTs :>> ', isTs);
        // console.log('matchResult :>> ', matchResult)

        const keys = i18nKey.split('.')
        let val = null

        const staticI18nObj = getStaticI18n(path.resolve(rootPath, `./src/lang-source/zh-cn.json`))
        // console.log('get static i18n')

        val = staticI18nObj
        keys.forEach(key => {
            if (val[key]) {
                val = val[key]
            } else {
                val = ''
            }
        })

        return new vscode.Hover(val ? JSON.stringify(val) : `* 没有匹配 \n* 或者是 \n* 无法处理的语法已被过滤`)
    }
}


async function provideDefinition(document, position, token) {
    let rootPath = vscode.workspace.rootPath
    // console.log('rootPath :>> ', rootPath);

    // 文件路径
    const fileName = document.fileName
    // console.log('fileName :>> ', fileName)

    // 鼠标悬停范围
    // /\$t\(\'[^).]+\'\)/ 正则匹配 hover 的字符串范围
    // 如果没有就随便给个位置
    const range = document.getWordRangeAtPosition(position, /t\(\'[^)]+\'\)/) || [{ line: 0, character: 0 }]
    // console.log('范围 range :>> ', range);

    if (range.length < 2) {
        return
    }

    // 通过鼠标悬停范围，截取单词
    const word = document.getText(range)
    // console.log('截取单词 word:>> ', word)

    if (/\.vue$/.test(fileName)) {
        // console.log('\n进入 provideHover 方法\n')

        let i18nKey = word.match(/t\('(.+)'\)/)[1]
        console.log('i18nKey :>> ', i18nKey)
        if (!i18nKey) {
            return
        }

        const i18nObj = getStaticI18n(path.resolve(rootPath, `./src/lang-source/zh-cn.json`))
        console.log('get static i18n')

        // console.log('定位：i18nObj :>> ', i18nObj);
        const keys = i18nKey.split('.')
        let hitCol = 0, filepath = ''

        if (hitCol === 0 && i18nObj) {
          // 逐行读取文件，判断 i18nKey 是否在当前行字符串中
            hitCol = await readFileByline(i18nObj, keys)
            filepath = i18nObj.__filepath
        }
        // console.log('filepath :>> ', filepath);
        return new vscode.Location(vscode.Uri.file(filepath), new vscode.Position(hitCol, 100));
    }
}
async function readFileByline(i18nObj, keys) {
    console.log('keys', keys)
    let col = 0, idx = 0, hitCol = 0, len = keys.length
    const readStrream = fs.createReadStream(i18nObj.__filepath)
    const rl = readline.createInterface({
        input: readStrream
    })
    await new Promise(resolve => {
        rl.on('line', input => {
            // console.log('input', input)
            if (idx <= len - 1 && input.indexOf(`"${keys[idx]}":`) > -1) {
                console.log('static input :>> ', input);
                hitCol = col
                console.log('static 命中 行数为:>> ', hitCol, '行');

                idx++
            }
            col++
        })
        rl.on('close', () => {
            console.log('static rl close :>> ', hitCol);
            resolve()
        })
    })
    return hitCol
}
module.exports = function (context) {
    // 注册鼠标悬停提示
    context.subscriptions.push(
        vscode.languages.registerHoverProvider('vue', {
            provideHover,
        })
    )
    // 注册如何实现跳转到定义，第一个参数表示仅对vue文件生效
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(['vue'], {
        provideDefinition
    }))
}


/***/ }),

/***/ 3765:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const vscode = __webpack_require__(1)
const path = __webpack_require__(4)
const fs = __webpack_require__(5);

function getWebviewContent({completeImgList, vueLib} = {completeImgList: [], vueLib: ''}) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
    #img-box {
        display: flex;
        flex-wrap: wrap;
    }
    #img-box img {
        display: block;
        width: 30%;
        margin: 5px;
        border: 1px solid #d0d0c5;
        object-fit: contain;
        flex-basis: 30%;
    }
    #preview {
        overflow: auto;
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: #fff;
        z-index: 2001;
    }
    #preview img {
        width: 100%;
        max-width: none;
        max-height: none;
    }
    .close-btn {
        position: fixed;
        top: 30px;
        right: 30px;
        padding: 4px 8px;
        border: none;
        background-color: #3a8ee6;
        color:#fff;
        font-size: 16px;
        cursor: pointer;
        outline: none;
        border-radius: 4px;
    }
    </style>
    <title>Cat Coding</title>
</head>
<body>
    <div id="app">
        <div id="img-box">
            ${
                completeImgList.map(imgUrl => {
                    return `<img src="${imgUrl}" @click="handleClick($event)">`
                }).join('')
            }
        </div>
        <div id="preview" v-show="showPreview">
            <img :src="previewSrc" alt="">
            <button class="close-btn" @click="handleClose">关闭</button>
        </div>
    </div>
    <script src="${vueLib}"></script>
    <script>
        let vm = new Vue({
            el: '#app',
            data() {
                return {
                    showPreview: false,
                    previewSrc: ''
                }
            },
            methods: {
                handleClose() {
                    this.showPreview = false
                    this.previewSrc = ''
                },
                handleClick(event) {
                    this.showPreview = true
                    this.previewSrc = event.target.src
                }
            }
        })
    </script>
</body>
</html>`;
}

// win: \
// mac/linux: /
const sep = path.normalize('/')

module.exports = function (context) {
  // 创建webview
  const showImageDisposable = vscode.commands.registerCommand('showImage', async () => {
    const panel = vscode.window.createWebviewPanel(
      'showImage', // 标识Web视图的类型。内部使用
      'Show Image',  // 显示给用户的面板标题
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

  context.subscriptions.push(showImageDisposable)
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


/***/ }),

/***/ 6:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

const fs = __webpack_require__(5)

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


/***/ }),

/***/ 1:
/***/ ((module) => {

"use strict";
module.exports = require("vscode");

/***/ }),

/***/ 5:
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ 4:
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ 3:
/***/ ((module) => {

"use strict";
module.exports = require("readline");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = __webpack_require__(1);
console.log('Congratulations1211, your extension "bingx-web-helper" is now active!');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "bingx-web-helper" is now active!');
    __webpack_require__(2)(context); // 悬停提示
    __webpack_require__(3765)(context); // 展示页面图片
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('bingx-web-helper.helloWorld', () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage('Hello World from bingx-web-helper!');
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;

})();

module.exports = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=extension.js.map
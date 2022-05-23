const readline = require('readline')
const vscode = require('vscode')
const path = require('path')
const fs = require('fs')

const { getI18nPrevKey } = require('../../utils/parser/index.js')
const { getStaticI18n } = require('../../utils/i18n-static/index.js')

// 缓存当前数据，只有重启IDE才会更新数据
const instance = {}
// 鼠标悬停，匹配 t('xxx.yyy.zzz') 多语言格式正则
const i18nReg = /t\(\'[^)]+\'\)/
// 鼠标悬停，匹配 t('xxx.yyy.zzz') 中的多语言key
const i18nKeyReg = /t\('(.+)'\)/
// i18n前缀
let prevKey = ''

/**
 * 鼠标悬停提示
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
    const range = document.getWordRangeAtPosition(position, i18nReg) || [{ line: 0, character: 0 }]
    console.log('范围 range :>> ', range);

    if (range.length < 2) {
        return
    }

    // 通过鼠标悬停范围，截取单词
    const word = document.getText(range)
    console.log('截取单词 word:>> ', word)

    if (/\.vue$/.test(fileName)) {
        // console.log('\n进入 provideHover 方法\n')

        let i18nKey = word.match(i18nKeyReg)[1]
        // console.log('i18nKey :>> ', i18nKey)
        if (!i18nKey) {
            return
        }

        // 读取当前文件内容
        let fileContent = fs.readFileSync(fileName, { encoding: 'utf-8' })

        // 获取整个 script（包含） 的内容
        let matchResult = fileContent.match(/<script[^>]*>((.|\n|\t|\r)+)<\/script>/)
        // console.log('matchResult :>> ', matchResult)

        let isTs = fileContent.match(/<script([^>]*)>((.|\n|\t|\r)+)<\/script>/)[1].indexOf('ts') > -1 ? true : false
        // console.log('isTs :>> ', isTs);

        prevKey = getI18nPrevKey(matchResult[1], 't', isTs, fileName) || ''
        // console.log('prevKey :>> ', prevKey)

        const keys = `${prevKey}${i18nKey}`.split('.')
        console.log('keys :>> ', keys)

        const staticI18nObj = getStaticI18n(path.resolve(rootPath, `./src/lang-source/zh-cn.json`))
        // console.log('get static i18n', staticI18nObj)

        let val = staticI18nObj
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

/**
 * ctrl + 鼠标点击跳转
 * @param {*} document
 * @param {*} position
 * @param {*} token
 */
async function provideDefinition(document, position, token) {
    let rootPath = vscode.workspace.rootPath
    // console.log('rootPath :>> ', rootPath);

    // 文件路径
    const fileName = document.fileName
    // console.log('fileName :>> ', fileName)

    // 鼠标悬停范围
    // /\$t\(\'[^).]+\'\)/ 正则匹配 hover 的字符串范围
    // 如果没有就随便给个位置
    const range = document.getWordRangeAtPosition(position, i18nReg) || [{ line: 0, character: 0 }]
    // console.log('范围 range :>> ', range);

    if (range.length < 2) {
        return
    }

    // 通过鼠标悬停范围，截取单词
    const word = document.getText(range)
    // console.log('截取单词 word:>> ', word)

    if (/\.vue$/.test(fileName)) {
        // console.log('\n进入 provideHover 方法\n')

        let i18nKey = word.match(i18nKeyReg)[1]
        console.log('provideDefinition:i18nKey :>> ', i18nKey)
        if (!i18nKey) {
            return
        }

        const staticI18nObj = getStaticI18n(path.resolve(rootPath, `./src/lang-source/zh-cn.json`))
        console.log('provideDefinition:get static i18n', staticI18nObj)

        // const prevKey = getI18nPrevKey(matchResult[1], 't', isTs, fileName) || ''
        // console.log('prevKey :>> ', prevKey)

        const keys = `${prevKey}${i18nKey}`.split('.')
        console.log('provideDefinition:keys :>> ', keys)
        let hitCol = 0, filepath = ''

        if (hitCol === 0 && staticI18nObj) {
          // 逐行读取文件，判断 i18nKey 是否在当前行字符串中
            hitCol = await readFileByline(staticI18nObj, keys)
            filepath = staticI18nObj.__filepath
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

// const fs = require('fs')
// const path = require('path')

const { analysis } = require('./babel');


// 处理逻辑
const getI18n = function(scriptContent, isTs, fileName) {
    let i18nObj = null

    // 解析方法
    let { ObjectProperty_ObjectExpression, removeUnableToParseSyntax, ObjectProperty_Identifier } = require('./parser/index')


    analysis(scriptContent, [
        {
            // 移除，无法处理的语法
            enter: removeUnableToParseSyntax([
                'SpreadElement',
                'ObjectProperty_valueFunctionExpression',
                'ObjectMethod'
            ])
        },
        {
            enter(path) {
                // console.log('enter :>> ', path.node);
                let res = null

                if (res = ObjectProperty_ObjectExpression(path, fileName)) {
                    // 去除无法识别语法

                    i18nObj = res
                    // console.log('ObjectProperty_ObjectExpression i18nObj :>> ', i18nObj)
                    return
                } else if (ObjectProperty_Identifier.hitEnter(path)) {
                    analysis(scriptContent, [
                        {
                            enter: ObjectProperty_Identifier.getImportUrl
                        }
                    ])
                    i18nObj = ObjectProperty_Identifier.getI18n(fileName)
                    // console.log('ObjectProperty_Identifier i18nObj :>> ', i18nObj)
                    return
                }
            },
        }
    ], isTs)
    return i18nObj
}
exports.getI18n = getI18n
// getI18n('', false)

// 1、当前组件是否有 t() 方法，解析得到前缀key

// 2、当前没有 t() 方法，则查找是否有mixin
//   在 多个 mixin 中查到是否存在 t()，获取前缀

// 3、若都找不到 t()，则直接使用匹配到的 t('xxx.xxx')

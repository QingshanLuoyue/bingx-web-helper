// const fs = require('fs')
// const path = require('path')

const { analysis } = require('./babel')
const template = require('../parser/js-script-template/index.js')

// 处理逻辑
const getI18nPrevKey = function (
  scriptContent = '',
  functionName = 't',
  isTs = false,
  fileName = ''
) {
  let prevKey = null

  // 解析方法
  const {
    ObjectProperty_Identifier,
    ClassMethod
  } = require('./parser/index')

  analysis(
    scriptContent,
    [
      // 判断当前是否有重新包装 i18n,有的话提取前缀
      {
        enter(path) {
          let res = null
          if ((res = ClassMethod(path, functionName, isTs))) {
            prevKey = res
            return
          }
        }
      },
      // {
      //   enter(path) {
      //     // 如果找到 i18n 的前缀，这里不在继续寻找 mixin
      //     if (prevKey) return

      //     if (ObjectProperty_Identifier.hitEnter(path)) {
      //       analysis(scriptContent, [
      //         {
      //           enter: ObjectProperty_Identifier.getImportUrl
      //         }
      //       ])
      //       i18nObj = ObjectProperty_Identifier.getI18n(fileName)
      //       // console.log('ObjectProperty_Identifier i18nObj :>> ', i18nObj)
      //       return
      //     }
      //   }
      // }
    ],
    isTs
  )
  return prevKey
}
exports.getI18nPrevKey = getI18nPrevKey
// getI18nPrevKey(template.js_template, 't', false)
// getI18nPrevKey(template.ts_template, 't', true)

// 1、当前组件是否有 t() 方法，解析得到前缀key

// 2、当前没有 t() 方法，则查找是否有mixin
//   在 多个 mixin 中查到是否存在 t()，获取前缀

// 3、若都找不到 t()，则直接使用匹配到的 t('xxx.xxx')

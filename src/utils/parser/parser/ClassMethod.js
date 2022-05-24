const { generate, analysis } = require('../babel.js')

// 遍历 js/ts 转换来的 AST , 得到 i18n 前缀
function traverseCodeAst(node, keyName = 't', isTs = false) {
  let nodeType = 'ClassMethod'
  if (isTs) {
    nodeType = 'FunctionExpression'
  }
  let targetPrev = ''
  // if (node.type === 'ClassMethod') {
  if (node.type === nodeType && node.key && node.key.name === keyName) {
    // console.log('node', node)
    // 进入当前代码 AST 节点
    // t(key: string, value = {}) {
    //   return '' + this.$t('activity.invite.invitationgift.' + key, value)
    // }

    // 得到函数体的 AST
    // {
    //   return '' + this.$t('activity.invite.invitationgift.' + key, value)
    // }
    const body = node.body

    // 生成函数体的代码，并赋值给 i18nFun 变量
    const funString = generate(body)
    const funStringCode = `let i18n = function() ${funString.code}`
    // console.log('i18n string code :>> ', funStringCode)

    // 解析当前新的代码串，找到 i18n 前缀
    // let i18n = function() {
    //   return '' + this.$t('activity.invite.invitationgift.' + key, value)
    // }
    analysis(funStringCode, [{
      enter: (funPath) => {
        const funNode = funPath.node
        // this.$t('xxx.yyy.zzz' + key, value)
        if (funNode.type === 'CallExpression') {
          // console.log('inner funNode', funNode)
          // this.$t
          const callee = funNode.callee

          // 获取函数参数：'xxx.yyy.zzz' + key, value
          const arguments = funNode.arguments || []

          // 得到第一个参数：'xxx.yyy.zzz' + key
          const firstParam = arguments[0] || {}

          if (
          callee.type === 'MemberExpression' &&
          callee.property.name === '$t' &&
          firstParam.type === 'BinaryExpression' &&
          firstParam.left.type === 'StringLiteral'
          ) {
            targetPrev = firstParam.left.value
            // console.log('targetPrev:', targetPrev)
          }
        }
      }
    }])
  }

  return targetPrev
}

const enter = function (path, keyName = 't', isTs = false) {
  const node = path.node
  if (isTs) {
    return traverseCodeAst(node, keyName, isTs)
  }
  return traverseCodeAst(node, keyName)
}

// // 测试
// analysis(ObjectProperty_Identifier_template, [
//     {
//         enter
//     }
// ])

module.exports = enter

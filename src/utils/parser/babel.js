let babelParse = require('@babel/parser')

let traverse  = require('@babel/traverse').default
// 使用 AST 成功 原始 code
let generate  = require('@babel/generator').default
// babel.transform 转换 原始 code 为 AST
let babel = require("@babel/core");

function analysis(jsContent, traverseHandlers = [], isTs) {
    // console.log('jsContent', jsContent)
    // 转换原始 code， 得到 AST
    console.log('isTs', isTs)
    let result = babel.transform(jsContent, {
        ast: true,
        filename: isTs ?'file.ts' : '',
        presets: isTs ? [
            // 转换成 ES5
            // require("@babel/preset-env"),
            require("@babel/preset-typescript"),
        ] : [],
        plugins: isTs ? [
            [
                require("@babel/plugin-proposal-decorators"),
                {
                    decoratorsBeforeExport: true,
                    // legacy: true
                }
            ],
            [
                require("@babel/plugin-proposal-class-properties"),
                // { loose : true }
            ],
        ] : []

        // babelParse配置
        // sourceType: "module",
        // plugins: [
        //     "typescript",
        //     'decorators-legacy',
        //     "classProperties",
        // ]
    })
    // console.log('ast', result.ast.program)
    // console.log('code', result.code)
    // console.log('ast', JSON.stringify(result.ast, null, 2))

    // 遍历 traverse 处理器，并执行
    traverseHandlers.forEach(traverseHandler => {
        traverse(result.ast, {
            enter(path, state) {
                traverseHandler.enter && traverseHandler.enter(path, state)
            },
            exit(path, state) {
                traverseHandler.exit && traverseHandler.exit(path, state)
            }
        })
    })
    return { ast: result.ast }
}


module.exports = {
    traverse,
    generate,
    babelParse,
    babel,
    transform: babel.transform,
    analysis
}

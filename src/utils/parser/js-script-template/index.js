// import Component from 'nuxt-class-component'
// import Header from '~/bizComponents/global/header/index.vue'
// @Component({
//   name: 'HeaderPxToRem'
// })
const ts_template = `
@Component
export default class PopularizeHeaderPxToRem extends Header {
  t(key: string, value = {}) {
    return '' + this.$t('activity.invite.invitationgift.' + key, value)
  }
}
`
const js_template = `
export default class PopularizeHeaderPxToRem extends Header {
  t(key, value = {}) {
    return '' + this.$t('activity.invite.invitationgift.' + key, value)
  }
}
`


const ObjectProperty_Identifier_template = `
// import { importi18n, i18n } from './mixins/i18n'
export default {
    // i18n: i18n,
    i18n,
    // i19n: importi18n,
}
`

const ObjectProperty_ObjectExpression_template  = `
export default {
    i18n: {
        zhCHS: {
            x: 1
        },
        zhCHT: {
            y: 2
        },
        en: {
            z: 3
        }
    }
}
`

const ObjectProperty_ObjectExpression__unable_to_parse_syntax  = `
export default {
    i18n: {
        zhCHS: {
            x: 1,
            funes5: function() {
                return 2
            },
            importi18n,
            importi18n2: importi18n3,
            funes6() {
                return 1
            },
            ...i18nCountry.zhCHS,
            ...testljf.xx,
            ...testljf2,
        },
    }
}
`

const exportConstI18n  = `
export const i18n = {
    x:  1
}
export default {
    i18n,
    i19n
}
`

const exportConstI18n__unable_to_parse_syntax  = `
export const i18n = {
    zh: {
        x: 1,
        ...country.zhc
    }
}
export default {
    i18n,
    i19n
}
`

const exportDefaultZhCHS  = `
export default {
    zhCHS: {
        x: 1
    }
}
`
module.exports = {
    ObjectProperty_Identifier_template,
    ObjectProperty_ObjectExpression_template,
    ObjectProperty_ObjectExpression__unable_to_parse_syntax,
    exportConstI18n__unable_to_parse_syntax,
    ts_template,
    js_template,
    exportConstI18n,
    exportDefaultZhCHS
}

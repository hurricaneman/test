const fs = require('fs')
const util = require('util')
const writeFile = util.promisify(fs.writeFile)

async function bundle(name, src) {
  const res = await require('less-bundle-promise')({ src })
  await writeFile(`public/themes/${name}.less`, res)
  Object.keys(require.cache).forEach(v => delete require.cache[v])
}

async function main() {
  await bundle('default', 'tool/antd-theme/default.less')
  await bundle('dark', 'tool/antd-theme/dark.less')
  await bundle('aliyun', 'tool/antd-theme/aliyun.less')
  await writeFile('public/themes/empty.less', '')
}

main()

// 已废弃，用bundle-antd-less
const less = require('less')
const fs = require('fs')
const util = require('util')
const path = require('path')

const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const copyFile = util.promisify(fs.copyFile)

const generatorOptions = {
  themeVariables: ['@primary-color'],
  antDir: path.join(__dirname, '../node_modules/antd/'),
  stylesDir: path.join(__dirname, '../src/assets'),
  mainLessFile: path.join(__dirname, '../src/assets/index.less'),
}

async function renderLess() {
  // 默认主题
  await copyFile('node_modules/antd/dist/antd.css', 'public/themes/default.css')
  // 黑色主题
  await copyFile(
    'node_modules/antd/dist/antd.dark.css',
    'public/themes/dark.css'
  )
  // 阿里云主题
  const content = await readFile('src/assets/theme-aliyun.less', {
    encoding: 'utf8',
  })
  const output = await less.render(content, {
    paths: ['node_modules'],
    javascriptEnabled: true,
  })
  await writeFile('public/themes/aliyun.css', output.css)

  //  默认主题覆盖
  await require('antd-theme-generator').generateTheme({
    varFile: path.join(
      __dirname,
      '../node_modules/antd/lib/style/themes/default.less'
    ),
    outputFilePath: path.join(__dirname, '../public/themes/default-color.less'),
    ...generatorOptions,
  })
  delete require.cache[require.resolve('antd-theme-generator')]
  // 黑色主题覆盖
  await require('antd-theme-generator').generateTheme({
    varFile: path.join(
      __dirname,
      '../node_modules/antd/lib/style/themes/dark.less'
    ),
    outputFilePath: path.join(__dirname, '../public/themes/dark-color.less'),
    ...generatorOptions,
  })
  delete require.cache[require.resolve('antd-theme-generator')]
  // 阿里云主题覆盖
  await require('antd-theme-generator').generateTheme({
    varFile: path.join(__dirname, '../src/assets/theme-aliyun-color.less'),
    outputFilePath: path.join(__dirname, '../public/themes/aliyun-color.less'),
    ...generatorOptions,
  })
}

renderLess()

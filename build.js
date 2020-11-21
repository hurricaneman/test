/*
 * @Author: DargonPaul.Y
 * @Date: 2020-07-09 13:18:50
 * @LastEditTime: 2020-07-16 13:55:49
 * @LastEditors: DargonPaul.Y
 * @Description:
 * @FilePath: \admin-frontpage\build.js
 */

const NAME = 'build'
const PATH = `/home/admin/html/${NAME}`
const URL = 'http://172.16.11.15:4081'
const SSH_CONFIG = {
  host: '172.16.11.15',
  port: 22,
  username: 'admin',
  password: 'Nd6xrootroot',
}

const fs = require('fs-extra')
const node_ssh = require('node-ssh')
const { execSync } = require('child_process')
const commandExists = require('command-exists')

async function main() {
  const hasYarn = await commandExists('yarn').catch(() => {})
  const npm = hasYarn ? 'yarn' : 'npm'

  console.log('[INFO]: git pull')
  execSync('git pull', { stdio: 'inherit' })

  console.log(`[INFO]: ${npm} install`)
  execSync(`${npm} install`, { stdio: 'inherit' })

  console.log('[INFO]: clear build folder')
  fs.removeSync('build')

  console.log(`[INFO]: ${npm} run build`)
  execSync(`${npm} run build`, { stdio: 'inherit' })

  console.log('[INFO]: ssh connect')
  const ssh = new node_ssh()
  await ssh.connect(SSH_CONFIG)

  console.log('[INFO]: clear remote folder')
  await ssh.execCommand(`rm -rf ${PATH}`)

  console.log('[INFO]: upload')
  await ssh.putDirectory('build', PATH, { concurrency: 1 })

  console.log('[INFO]: close ssh')
  ssh.dispose()

  console.log('[INFO]: clear build folder')
  fs.removeSync('build')

  console.log('[INFO]: complete')
  console.log(`[INFO]: ${URL}`)
}

main()

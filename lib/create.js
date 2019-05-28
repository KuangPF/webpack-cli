const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')
const chalk = require('chalk')
const Creator = require('./Creator')
const { clearConsole } = require('./util/clearConsole')
const { getPromptModules } = require('./util/createTools')
const { log } = require('./util/logger')

async function create(projectName, options) {
  const cwd = options.cwd || process.cwd()
  const inCurrent = projectName === '.'
  const name = inCurrent ? path.relative('../', cwd) : projectName
  const targetDir = path.resolve(cwd, projectName || '.')

  if (fs.existsSync(targetDir)) {
    if (options.force) {
      await fs.remove(targetDir)
    } else {
      await clearConsole()
      if (inCurrent) {
        const { ok } = await inquirer.prompt([
          {
            name: 'ok',
            type: 'confirm',
            message: 'Generate project in current directory?'
          }
        ])
        if (!ok) {
          return
        }
      } else {
        const { action } = await inquirer.prompt([
          {
            name: 'action',
            type: 'list',
            message: `Target directory ${chalk.cyan(targetDir)} already exists. Pick an action:`,
            choices: [{ name: 'Overwrite', value: 'overwrite' }, { name: 'Merge', value: 'merge' }, { name: 'Cancel', value: false }]
          }
        ])
        if (!action) {
          return
        } else if (action === 'overwrite') {
          console.log(`\nRemoving ${chalk.cyan(targetDir)}...`)
          log()
          await fs.remove(targetDir)
        }
      }
    }
  }

  const creator = new Creator(name, targetDir, getPromptModules())
  await creator.create()
}

module.exports = (...args) => {
  return create(...args).catch(err => {
    console.log(err)
    process.exit(1)
  })
}

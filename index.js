/* eslint-disable no-template-curly-in-string */
import fs from 'node:fs'
import { EOL } from 'node:os'
import { Plugin } from 'release-it'
import _ from 'lodash'
import conventionalChangelog from 'conventional-changelog'
import concat from 'concat-stream'

const DEFAULT_CONVENTIONAL_CHANGELOG_PRESET = {
  preset: {
    name: 'conventionalcommits',
    types: [
      {
        type: 'feat',
        section: '✨ Features | 新功能'
      },
      {
        type: 'fix',
        section: '🐛 Bug Fixes | Bug 修复'
      },
      {
        type: 'chore',
        section: '🚀 Chore | 构建/工程依赖/工具',
        hidden: true
      },
      {
        type: 'docs',
        section: '📝 Documentation | 文档'
      },
      {
        type: 'style',
        section: '💄 Styles | 样式'
      },
      {
        type: 'refactor',
        section: '♻️ Code Refactoring | 代码重构'
      },
      {
        type: 'perf',
        section: '⚡ Performance Improvements | 性能优化'
      },
      {
        type: 'test',
        section: '✅ Tests | 测试',
        hidden: true
      },
      {
        type: 'revert',
        section: '⏪ Revert | 回退',
        hidden: true
      },
      {
        type: 'build',
        section: '📦‍ Build System | 打包构建'
      },
      {
        type: 'ci',
        section: '👷 Continuous Integration | CI 配置'
      }
    ]
  }
}

class Free extends Plugin {
  customizeMessage = ''

  async registryCustomLogPrompts() {
    this.registerPrompts({
      customizeLog: {
        message: () => 'Customize the tag description?',
        name: 'customizeLog',
        type: 'confirm',
        default: false
      }
    })
    await this.step({
      prompt: 'customizeLog',
      task: async () => {
        this.registerPrompts({
          customizeMessage: {
            message: () => 'Please fill in the description information',
            name: 'customizeMessage',
            type: 'editor',
            default: ''
          }
        })
        await this.step({
          prompt: 'customizeMessage',
          task: (answer) => {
            this.customizeMessage = answer
              .trim()
              .split(/\r\n|\r|\n/g)
              .map(s => s.trim())
              .filter(s => s)
          }
        })
      }
    })
  }

  getChangelogStream(opts = {}) {
    const { version } = this.getContext()
    const { isIncrement } = this.config
    const { latestTag, secondLatestTag, tagTemplate } = this.config.getContext()

    const currentTag = isIncrement
      ? tagTemplate
        ? tagTemplate.replace('${version}', version)
        : null
      : latestTag
    const previousTag = isIncrement ? latestTag : secondLatestTag
    const releaseCount = opts.releaseCount === 0 ? 0 : isIncrement ? 1 : 2
    const debug = this.config.isDebug ? this.debug : null
    const options = Object.assign(
      {},
      { releaseCount },
      DEFAULT_CONVENTIONAL_CHANGELOG_PRESET,
      this.options
    )
    const { gitRawCommitsOpts, parserOpts, writerOpts, ..._o } = options
    let finallyWriterOpts = {}
    let context = options.context
    if (
      this.customizeMessage &&
      Array.isArray(this.customizeMessage) &&
      this.customizeMessage.length
    ) {
      const mainTemplate = fs
        .readFileSync(new URL('./custom-log.hbs', import.meta.url), 'utf8')
        .toString()
      context = _.defaultsDeep({}, _.omit(context, ['customLogs']), {
        customLogs: this.customizeMessage
      })
      if (writerOpts) {
        finallyWriterOpts = _.defaultsDeep({}, writerOpts, {
          mainTemplate
        })
      } else {
        finallyWriterOpts = {
          mainTemplate
        }
      }
    } else {
      finallyWriterOpts = writerOpts
    }
    const _c = Object.assign({ version, previousTag, currentTag }, context)
    const _r = Object.assign({ debug, from: previousTag }, gitRawCommitsOpts)
    this.debug('conventionalChangelog', {
      options: _o,
      context: _c,
      gitRawCommitsOpts: _r,
      parserOpts,
      writerOpts: finallyWriterOpts,
      version,
      isIncrement,
      latestTag,
      secondLatestTag,
      tagTemplate,
      currentTag,
      previousTag,
      releaseCount,
      debug
    })
    return conventionalChangelog(_o, _c, _r, parserOpts, finallyWriterOpts)
  }

  async generateChangelog(options) {
    return new Promise((resolve, reject) => {
      const resolver = result => resolve(result.toString().trim())
      const changelogStream = this.getChangelogStream(options)
      changelogStream.pipe(concat(resolver))
      changelogStream.on('error', reject)
    })
  }

  async getPreviousChangelog() {
    const { infile } = this.options
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(infile)
      const resolver = result => resolve(result.toString().trim())
      readStream.pipe(concat(resolver))
      readStream.on('error', reject)
    })
  }

  async writeChangelog() {
    const { infile, header: _header = '' } = this.options
    let { changelog } = this.config.getContext()
    const header = _header.split(/\r\n|\r|\n/g).join(EOL)

    let hasInfile = false
    try {
      fs.accessSync(infile)
      hasInfile = true
    } catch (err) {
      this.debug(err)
    }

    let previousChangelog = ''
    try {
      previousChangelog = await this.getPreviousChangelog()
      previousChangelog = previousChangelog.replace(header, '')
    } catch (err) {
      this.debug(err)
    }

    if (!hasInfile) {
      changelog = await this.generateChangelog({ releaseCount: 0 })
      this.debug({ changelog })
    }

    fs.writeFileSync(
      infile,
      header +
        (changelog ? EOL + EOL + changelog.trim() : '') +
        (previousChangelog ? EOL + EOL + previousChangelog.trim() : '')
    )

    if (!hasInfile) await this.exec(`git add ${infile}`)
  }

  async bump(version) {
    this.setContext({ version })
    await this.registryCustomLogPrompts()
    const changelog = await this.generateChangelog()
    this.config.setContext({ changelog })
  }

  async beforeRelease() {
    const { infile } = this.options
    const { isDryRun } = this.config

    this.log.exec(`Writing changelog to ${infile}`, isDryRun)

    if (infile && !isDryRun) await this.writeChangelog()
  }
}

export default Free

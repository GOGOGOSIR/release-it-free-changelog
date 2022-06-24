/* eslint-disable no-template-curly-in-string */
import { Plugin } from 'release-it'
import conventionalChangelog from 'conventional-changelog'
import concat from 'concat-stream'
// import fs from 'node:fs'
// import pkg from 'package.json'
// import { execaSync } from 'execa'

const DEFAULT_CONVENTIONAL_CHANGELOG_OPTIONS = {
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
  },
  infile: 'CHANGELOG.md',
  header: '# CHANGE_LOGS'
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
            this.customizeMessage = answer.trim()
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
      DEFAULT_CONVENTIONAL_CHANGELOG_OPTIONS,
      this.options
    )
    const { context, gitRawCommitsOpts, parserOpts, writerOpts, ..._o } =
      options
    const _c = Object.assign({ version, previousTag, currentTag }, context)
    const _r = Object.assign({ debug, from: previousTag }, gitRawCommitsOpts)
    this.debug('conventionalChangelog', {
      options: _o,
      context: _c,
      gitRawCommitsOpts: _r,
      parserOpts,
      writerOpts,
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
    return conventionalChangelog(_o, _c, _r, parserOpts, writerOpts)
  }

  async generateChangelog(options) {
    return new Promise((resolve, reject) => {
      if (this.customizeMessage) {
        resolve(this.customizeMessage)
      } else {
        const resolver = result => resolve(result.toString().trim())
        const changelogStream = this.getChangelogStream(options)
        changelogStream.pipe(concat(resolver))
        changelogStream.on('error', reject)
      }
    })
  }

  async bump(version) {
    this.setContext({ version })
    await this.registryCustomLogPrompts()
    const changelog = await this.generateChangelog()
    this.config.setContext({ changelog })
    // console.log('changelog2====', this.config.getContext('changelog'))
  }

  async beforeRelease() {
    // console.log('customizeMessage111: \n', this.customizeMessage)
  }
}

export default Free

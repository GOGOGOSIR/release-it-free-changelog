/* eslint-disable no-template-curly-in-string */
import fs from 'node:fs'
import { EOL } from 'node:os'
import { Plugin } from 'release-it'
import _ from 'lodash'
import conventionalChangelog from 'conventional-changelog'
import concat from 'concat-stream'
import DEFAULT_CONVENTIONAL_CHANGELOG_PRESET from './preset.js'
import getWriterOpts from './writer-opts.js'

const DEFAULT_CHANGELOG_FILE = 'CHANGELOG.md'

class Free extends Plugin {
  customizeMessage = null

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
    const writerOptions = getWriterOpts()
    const options = Object.assign(
      {},
      { releaseCount },
      DEFAULT_CONVENTIONAL_CHANGELOG_PRESET,
      this.options
    )
    const { gitRawCommitsOpts, parserOpts, writerOpts, ..._o } = options
    const finallyGitRawCommitsOpts = _.defaultsDeep(
      {},
      {
        format:
          '%B%n-hash-%n%H%n-gitTags-%n%d%n-committerDate-%n%ci%n-authorName-%n%an%n-authorEmail-%n%ae'
      },
      gitRawCommitsOpts || {}
    )
    let finallyWriterOpts = {}
    let context = options.context
    if (
      this.customizeMessage &&
      Array.isArray(this.customizeMessage) &&
      this.customizeMessage.length
    ) {
      const mainTemplate = fs
        .readFileSync(
          new URL('./template/custom-log.hbs', import.meta.url),
          'utf8'
        )
        .toString()
      context = _.defaultsDeep({}, _.omit(context, ['customLogs']), {
        customLogs: this.customizeMessage
      })
      if (writerOpts) {
        finallyWriterOpts = _.defaultsDeep({}, writerOpts, writerOptions)
      } else {
        finallyWriterOpts = {
          ...writerOptions,
          mainTemplate
        }
      }
    } else {
      finallyWriterOpts = _.defaultsDeep({}, writerOpts, writerOptions)
    }
    const _c = Object.assign({ version, previousTag, currentTag }, context)
    const _r = Object.assign(
      { debug, from: releaseCount === 0 ? '' : previousTag },
      finallyGitRawCommitsOpts
    )
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
    const { changelogFile = DEFAULT_CHANGELOG_FILE } = this.options
    return new Promise((resolve, reject) => {
      const readStream = fs.createReadStream(changelogFile)
      const resolver = result => resolve(result.toString().trim())
      readStream.pipe(concat(resolver))
      readStream.on('error', reject)
    })
  }

  async writeChangelog() {
    const { changelogFile = DEFAULT_CHANGELOG_FILE, header: _header = '' } =
      this.options
    let { changelog } = this.config.getContext()
    const header = _header.split(/\r\n|\r|\n/g).join(EOL)

    let hasChangelogFile = false
    try {
      fs.accessSync(changelogFile)
      hasChangelogFile = true
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

    if (!hasChangelogFile) {
      changelog = await this.generateChangelog({ releaseCount: 0 })
      this.debug({ changelog })
    }

    fs.writeFileSync(
      changelogFile,
      header +
        (changelog
          ? header
            ? EOL + EOL + changelog.trim()
            : changelog.trim()
          : '') +
        (previousChangelog ? EOL + EOL + previousChangelog.trim() : '')
    )

    if (!hasChangelogFile) await this.exec(`git add ${changelogFile}`)
  }

  async bump(version) {
    const { customChangelog = false } = this.options
    this.setContext({ version })
    if (customChangelog) await this.registryCustomLogPrompts()
    const changelog = await this.generateChangelog()
    this.config.setContext({ changelog })
  }

  async beforeRelease() {
    const { changelogFile = DEFAULT_CHANGELOG_FILE } = this.options
    const { isDryRun } = this.config

    this.log.exec(`Writing changelog to ${changelogFile}`, isDryRun)

    if (changelogFile && !isDryRun) await this.writeChangelog()
  }
}

export default Free

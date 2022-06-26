/* eslint-disable no-template-curly-in-string */
module.exports = {
  git: {
    requireBranch: 'master',
    commitMessage: 'chore: release v${version}',
    requireCommits: true,
    tagName: 'v${version}',
    tagAnnotation: `release date: ${new Date().toLocaleString()}`
  },
  github: {
    release: true
  },
  plugins: {
    './index.js': {
      infile: 'CHANGELOG.md',
      header: '# CHANGE_LOGS'
    }
  },
  hooks: {
    'after:release': 'node ./scripts/update-dev-branch.js'
  }
}

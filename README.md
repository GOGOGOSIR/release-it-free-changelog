<h1 align="center">release-it-free-changelog 👋</h1>
<p>
  <img src="https://img.shields.io/npm/v/release-it-free-changelog?color=41b883&label=npm" />
  <img src="https://img.shields.io/badge/node-%3E%3D14-blue.svg" />
  <a href="https://github.com/GOGOGOSIR/release-it-free-changelog#readme" target="_blank">
    <img alt="Documentation" src="https://img.shields.io/badge/documentation-yes-brightgreen.svg" />
  </a>
  <a href="https://github.com/GOGOGOSIR/release-it-free-changelog/graphs/commit-activity" target="_blank">
    <img alt="Maintenance" src="https://img.shields.io/badge/Maintained%3F-yes-green.svg" />
  </a>
  <a href="https://github.com/GOGOGOSIR/release-it-free-changelog/blob/master/LICENSE" target="_blank">
    <img alt="License: MIT" src="https://img.shields.io/github/license/GOGOGOSIR/release-it-free-changelog" />
  </a>
</p>

> An extension based on @release-it/conventional-changelog that allows users to rewrite log content and provides a log topic by default

### 🏠 [Homepage](https://github.com/GOGOGOSIR/release-it-free#readme)

## Prerequisites

- node >=14

## Install

```sh
yarn add release-it-free-changelog -D
```

## Usage

In the [release-it](https://github.com/release-it/release-it) config, for example:

```json
"plugins": {
  "release-it-free-changelog": {}
}
```

## Configuration

### `preset`

The default configuration:

```json
{
  "preset": {
    "name": "conventionalcommits",
    "types": [
      {
        "type": "feat",
        "section": "✨ Features | 新功能"
      },
      {
        "type": "fix",
        "section": "🐛 Bug Fixes | Bug 修复"
      },
      {
        "type": "chore",
        "section": "🚀 Chore | 构建/工程依赖/工具",
        "hidden": true
      },
      {
        "type": "docs",
        "section": "📝 Documentation | 文档"
      },
      {
        "type": "style",
        "section": "💄 Styles | 样式"
      },
      {
        "type": "refactor",
        "section": "♻️ Code Refactoring | 代码重构"
      },
      {
        "type": "perf",
        "section": "⚡ Performance Improvements | 性能优化"
      },
      {
        "type": "test",
        "section": "✅ Tests | 测试",
        "hidden": true
      },
      {
        "type": "revert",
        "section": "⏪ Revert | 回退",
        "hidden": true
      },
      {
        "type": "build",
        "section": "📦‍ Build System | 打包构建"
      },
      {
        "type": "ci",
        "section": "👷 Continuous Integration | CI 配置"
      }
    ]
  }
}
```

Or you can also use one of:

- `angular`
- `atom`
- `codemirror`
- `conventionalcommits`
- `ember`
- `eslint`
- `express`
- `jquery`
- `jscs`
- `jshint`Or you can also

If you want to customize the configuration, you can refer to [Conventional Changelog Configuration Spec (v2.1.0)](https://github.com/conventional-changelog/conventional-changelog-config-spec/blob/master/versions/2.1.0/README.md) for the configuration object to pass as `preset`.

### `changelogFile`

Default value: `CHANGELOG.md`

Set a filename as `changelogFile` to write the changelog to.

### `header`

Set the main header for the changelog document:

```json
"plugins": {
  "release-it-free-changelog": {
    "header": "# Changelog",
  }
}
```

### `rewriteChangelog`

Default value: `false`

If set to true, you can rewrite the log content，as shown below:

<img src="./static/c.gif?raw=true" height="280">

<img src="./static/demo-example.jpg?raw=true" height="280">

### `authorName`

Default value: `true`

If set to false, the submitter of each commit will not be displayed

### `context`

Default value: `undefined`

This option will be passed as the second argument (`context`) to
[conventional-changelog-core](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-core#context),
for example:

```json
"plugins": {
  "release-it-free-changelog": {
    "context": {
      "data": {
        "name": "eric"
      }
    }
  }
}
```

<img src="./static/context.jpg?raw=true" height="80">

### `gitRawCommitsOpts`

Default value: `undefined`

Options for
[git-raw-commits](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/git-raw-commits#api).
For example, you can use the following option to include merge commits into changelog:

```json
{
  "plugins": {
    "release-it-free-changelog": {
      "gitRawCommitsOpts": {
        "merges": null
      }
    }
  }
}
```

### `parserOpts`

Default value: `undefined`

Options for
[conventional-commits-parser](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser#api).
For example, you can use the following option to set the merge pattern during parsing the commit message:

```json
{
  "plugins": {
    "release-it-free-changelog": {
      "parserOpts": {
        "mergePattern": "^Merge pull request #(\\d+) from (.*)$"
      }
    }
  }
}
```

### `writerOpts`

Default value: `undefined`

Options for
[conventional-changelog-writer](https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer#api).
For example, you can use the following option to group the commits by 'scope' instead of 'type' by default.

```json
{
  "plugins": {
     "release-it-free-changelog": {
      "writerOpts": {
        "groupBy:" "scope"
      }
    }
  }
}
```

If you want to customize the templates used to write the changelog, you can do it like in a `.release-it.js` file like
so:

```js
const fs = require('fs')

const commitTemplate = fs.readFileSync('commit.hbs').toString()

module.exports = {
  plugins: {
    'release-it-free-changelog': {
      writerOpts: {
        commitPartial: commitTemplate
      }
    }
  }
}
```

## 🌸 Thanks

This project is heavily inspired by the following awesome projects.

- [release-it](https://github.com/release-it/release-it)
- [@release-it/conventional-changelog](https://github.com/release-it/conventional-changelog#readme)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/GOGOGOSIR/release-it-free/issues). You can also take a look at the [contributing guide](https://github.com/GOGOGOSIR/release-it-free/blob/master/CONTRIBUTING.md).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2022 [ericwan <ericwan2021@163.com>](https://github.com/GOGOGOSIR).<br />
This project is [MIT](https://github.com/GOGOGOSIR/release-it-free/blob/master/LICENSE) licensed.

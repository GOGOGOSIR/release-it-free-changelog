import { Plugin } from 'release-it'
// import inquirer from 'inquirer'
// import { execaSync } from 'execa'

class Free extends Plugin {
  getCustomLogPrompts() {
    return [
      {
        message: 'Customize the tag description?',
        name: 'customizeLog',
        type: 'confirm',
        default: false
      },
      {
        message: 'Please fill in the description information',
        name: 'message',
        type: 'editor',
        default: '',
        when: ({ customizeLog }) => {
          return customizeLog
        }
      }
    ]
  }
}

export default Free

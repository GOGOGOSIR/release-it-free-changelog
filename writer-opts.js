import fs from 'node:fs'

export default () => {
  const headerTemplate = fs
    .readFileSync(new URL('./template/header.hbs', import.meta.url), 'utf8')
    .toString()
  const footerTemplate = fs
    .readFileSync(new URL('./template/footer.hbs', import.meta.url), 'utf8')
    .toString()
  const commitTemplate = fs
    .readFileSync(new URL('./template/commit.hbs', import.meta.url), 'utf8')
    .toString()
  const mainTemplate = fs
    .readFileSync(new URL('./template/template.hbs', import.meta.url), 'utf8')
    .toString()

  return {
    mainTemplate,
    headerPartial: headerTemplate,
    commitPartial: commitTemplate,
    footerPartial: footerTemplate
  }
}

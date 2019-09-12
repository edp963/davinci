module.exports = {
  plugins: [
    require('autoprefixer')({
      overrideBrowserslist: ['last 2 versions', '> 1%', 'IE 11']
    })
  ]
}

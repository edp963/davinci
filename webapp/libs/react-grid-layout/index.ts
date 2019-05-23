// module.exports = require('./lib/ReactGridLayout').default
// module.exports.utils = require('./lib/utils')
// module.exports.Responsive = require('./lib/ResponsiveReactGridLayout').default
// module.exports.Responsive.utils = require('./lib/responsiveUtils')
// module.exports.WidthProvider = require('./lib/components/WidthProvider').default

const ReactGridLayout = require('./lib/ReactGridLayout').default
export const utils = require('./lib/utils')
export const Responsive = require('./lib/ResponsiveReactGridLayout').default
Responsive.utils = require('./lib/responsiveUtils')
export const WidthProvider = require('./lib/components/WidthProvider').default

export default ReactGridLayout

/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

// import area from './area.json'
// import bar from './bar.json'
// import funnel from './funnel.json'
// import line from './line.json'
// import pie from './pie.json'
// import sankey from './sankey.json'
// import scatter from './scatter.json'
// import wordCloud from './wordCloud.json'
// import table from './table.json'
// import scorecard from './scorecard.json'
// import text from './text.json'
// import map from './map.json'
// import doubleYAxis from './doubleYAxis.json'
// import boxplot from './boxplot.json'
// import graph from './graph.json'
// import markBoxplot from './markBoxplot.json'
// import waterfall from './waterfall.json'
// import gauge from './gauge.json'
// import radar from './radar.json'
// import parallel from './parallel.json'
// import confidenceBand from './confidenceBand.json'

export default [{
  id: 1,
  name: 'pivot',
  title: '透视表',
  icon: 'icon-table',
  coordinate: 'cartesian',
  requireDimetions: 0,
  requireMetrics: 0,
  data: {
    color: {
      title: '颜色',
      type: 'category'
    }
  },
  style: {
    
  }
}, {
  id: 2,
  name: 'line',
  title: '折线图',
  icon: 'icon-chart-line',
  coordinate: 'cartesian',
  requireDimetions: 1,
  requireMetrics: 1,
  dimetionAxis: 'col',
  data: {
    color: {
      title: '颜色',
      type: 'category'
    },
    label: {
      title: '标签',
      type: 'all'
    },
    tip: {
      title: '提示信息',
      type: 'value'
    }
  }
}, {
  id: 3,
  name: 'bar',
  title: '柱状图',
  icon: 'icon-chart-bar',
  coordinate: 'cartesian',
  requireDimetions: 0,
  requireMetrics: 1,
  dimetionAxis: 'col',
  data: {
    color: {
      title: '颜色',
      type: 'category'
    },
    label: {
      title: '标签',
      type: 'all'
    },
    tip: {
      title: '提示信息',
      type: 'value'
    }
  }
}, {
  id: 4,
  name: 'scatter',
  title: '散点图',
  icon: 'icon-scatter-chart',
  coordinate: 'cartesian',
  requireDimetions: 0,
  requireMetrics: 1,
  data: {
    xAxis: {
      title: 'x数据轴',
      type: 'value'
    },
    color: {
      title: '颜色',
      type: 'all'
    },
    size: {
      title: '尺寸',
      type: 'value'
    },
    label: {
      title: '标签',
      type: 'all'
    },
    tip: {
      title: '提示信息',
      type: 'value'
    }
  }
}, {
  id: 5,
  name: 'pie',
  title: '饼图',
  icon: 'icon-chartpie',
  coordinate: 'polar',
  requireDimetions: 0,
  requireMetrics: 1,
  data: {
    color: {
      title: '颜色',
      type: 'all'
    },
    size: {
      title: '尺寸',
      type: 'value'
    },
    label: {
      title: '标签',
      type: 'all'
    },
    tip: {
      title: '提示信息',
      type: 'value'
    }
  }
}
// {
//   id: 10,
//   name: 'radar',
//   title: '雷达图',
//   icon: 'icon-radarchart',
//   coordinate: 'polar',
//   requireDimetions: 0,
//   requireMetrics: 1,
//   data: {
//     color: {
//       title: '颜色',
//       type: 'all'
//     },
//     size: {
//       title: '尺寸',
//       type: 'value'
//     },
//     label: {
//       title: '标签',
//       type: 'all'
//     },
//     tip: {
//       title: '提示信息',
//       type: 'value'
//     }
//   }
// }
]

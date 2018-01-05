import React, { PureComponent } from 'react'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import * as echarts from 'echarts/lib/echarts'

import LinkageForm from './LinkageForm'
import Table from 'antd/lib/table'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Button from 'antd/lib/button'
import Modal from 'antd/lib/modal'

import { DEFAULT_SPLITER, TABLE_HEADER_HEIGHT } from '../../../../globalConstants'
import utilStyles from '../../../../assets/less/util.less'
import styles from './Linkage.less'

export class LinkagePanel extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      formVisible: false
    }
    this.chart = null
  }

  componentDidMount () {
    const { tableSource, onGetWidgetInfo } = this.props
    this.renderChart(tableSource, onGetWidgetInfo)
  }

  componentDidUpdate (prevProps) {
    const { tableSource, onGetWidgetInfo } = this.props

    if (tableSource.length && tableSource !== prevProps.tableSource) {
      this.renderChart(tableSource, onGetWidgetInfo)
    }
  }

  renderChart = (tableSource, onGetWidgetInfo) => {
    let nodes = {}
    let links = []

    tableSource.forEach(ts => {
      let triggerId = ts.trigger[0]
      let linkagerId = ts.linkager[0]

      if (!nodes[triggerId]) {
        nodes[triggerId] = onGetWidgetInfo(triggerId)
      }

      if (!nodes[linkagerId]) {
        nodes[linkagerId] = onGetWidgetInfo(linkagerId)
      }

      links.push({
        source: nodes[triggerId].name,
        target: nodes[linkagerId].name
      })
    })

    if (!this.chart) {
      this.chart = echarts.init(document.getElementById('linkageChart'), 'default')
    }

    this.chart.setOption({
      animationDurationUpdate: 1000,
      animationEasingUpdate: 'quinticInOut',
      series: [
        {
          type: 'graph',
          layout: 'circular',
          symbolSize: 30,
          roam: true,
          focusNodeAdjacency: true,
          label: {
            normal: {
              show: true,
              position: 'right'
            }
          },
          edgeSymbol: ['circle', 'arrow'],
          edgeSymbolSize: [4, 10],
          edgeLabel: {
            normal: {

            }
          },
          data: Object.values(nodes).map(info => ({
            name: info.name,
            category: info.type
          })),
          links: links,
          categories: Object.values(Object.values(nodes).reduce((categories, info) => {
            if (!categories[info.type]) {
              categories[info.type] = {
                name: info.type
              }
            }
            return categories
          }, {})),
          lineStyle: {
            normal: {
              opacity: 0.9,
              curveness: 0
            }
          }
        }
      ]
    })
  }

  showForm = () => {
    this.setState({
      formVisible: true
    })
  }

  hideForm = () => {
    this.setState({
      formVisible: false
    })
  }

  resetForm = () => {
    this.linkageForm.resetFields()
  }

  addToTable = () => {
    this.linkageForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.onAddToTable(values)
        this.hideForm()
      }
    })
  }

  render () {
    const {
      cascaderSource,
      tableSource,
      onAddToTable,
      onDelelteFromTable
    } = this.props

    const { formVisible } = this.state

    const PANEL_BODY_HEIGHT = 401
    const TOOLS_HEIGHT = 28

    const chartContainerClass = classnames({
      [utilStyles.hide]: !tableSource.length
    })
    const emptyChartClass = classnames({
      [utilStyles.hide]: tableSource.length
    })

    return (
      <Row gutter={16}>
        <Col span={12}>
          <div className={styles.tools}>
            <Button
              type="primary"
              onClick={this.showForm}
            >
              新增
            </Button>
          </div>
          <Table
            columns={[
              {
                key: 'trigger',
                title: '触发器',
                width: 155,
                dataIndex: 'trigger',
                render: (val) => {
                  const { cascaderSource } = this.props
                  const triggerData = cascaderSource.find(ts => ts.value === val[0])
                  const triggerColumnData = triggerData.children.find(c => c.value === val[1])
                  return `${triggerData.label} - ${triggerColumnData.label}`
                }
              }, {
                key: 'linkager',
                title: '联动图表',
                width: 155,
                dataIndex: 'linkager',
                render: (val) => {
                  const { cascaderSource } = this.props
                  const linkagerData = cascaderSource.find(fs => fs.value === val[0])
                  const linkagerColumnData = val[1].split(DEFAULT_SPLITER)
                  const linkagerColumnText = `${linkagerColumnData[0]}[${linkagerColumnData[2] === 'parameter' ? '参数' : '变量'}]`
                  return `${linkagerData.label} - ${linkagerColumnText}`
                }
              }, {
                key: 'relation',
                title: '关系',
                width: 50,
                className: `${utilStyles.textAlignCenter}`,
                dataIndex: 'relation'
              }, {
                title: '操作',
                width: 50,
                className: `${utilStyles.textAlignCenter}`,
                render: (val, record) => (
                  <span>
                    <a onClick={onDelelteFromTable(record.key)}>删除</a>
                  </span>
                )
              }
            ]}
            dataSource={tableSource}
            pagination={false}
            scroll={{ y: PANEL_BODY_HEIGHT - TOOLS_HEIGHT - TABLE_HEADER_HEIGHT }}
          />
        </Col>
        <Col span={12}>
          <div id="linkageChart" className={`${styles.chartContainer} ${chartContainerClass}`} />
          <div className={`${styles.chartEmpty} ${emptyChartClass}`}>
            <i className="iconfont icon-jiedian" />
            <p>暂无联动数据</p>
          </div>
        </Col>
        <Modal
          title="新增联动项"
          wrapClassName="ant-modal-small"
          visible={formVisible}
          onOk={this.addToTable}
          onCancel={this.hideForm}
          afterClose={this.resetForm}
        >
          <LinkageForm
            cascaderSource={cascaderSource}
            onAddToTable={onAddToTable}
            ref={f => { this.linkageForm = f }}
          />
        </Modal>
      </Row>
    )
  }
}

LinkagePanel.propTypes = {
  cascaderSource: PropTypes.array,
  tableSource: PropTypes.array,
  onAddToTable: PropTypes.func,
  onDelelteFromTable: PropTypes.func,
  onGetWidgetInfo: PropTypes.func
}

export default LinkagePanel

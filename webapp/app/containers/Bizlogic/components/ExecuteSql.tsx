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

import React from 'react'
import { Form, Row, Col, Input, Popover, Tooltip, Icon, Tree, Menu, Tabs, Radio, InputNumber, Button, Select, Alert, Table } from 'antd'
const FormItem = Form.Item
const TreeNode = Tree.TreeNode
const TabPane = Tabs.TabPane
const RadioGroup = Radio.Group
const RadioButton = Radio.Button
const styles = require('../Bizlogic.less')
const utilStyles = require('../../../assets/less/util.less')
import { SQL_FIELD_TYPES } from '../components/viewUtil'
import { ITeamParams, IViewTeams } from '../../Bizlogic'
import TeamTreeAction from '../components/TeamTreeAction'

interface IExecuteSqlProps {
  form: any
  route: any
  executeResultList: any[]
  executeColumns: any[]
  screenWidth: number
  isShowSqlValidateAlert: boolean
  sqlExecuteCode: boolean | number
  sqlValidateMessage: boolean | string
  totalCount: number
  isDeclarate: string
  limit: number
  executeLoading: boolean
  teamParams: [ITeamParams]
  listData: any[]
  viewTeam: IViewTeams[]
  teamCheckedKeys: any[]
  initSelectModelItem: (record: any, type: string) => any
  initExecuteSql: () => any
  initChangeIsDeclarate: (e: any) => void
  limitChange: (value: any) => any
  onTeamParamChange: (id: number, index: number) => any
  onCheck: (keys: any) => any
  changeTabs: (value: any) => any
}

interface IExecuteSqlStates {
  alertVisible: boolean
  isFold: boolean
  selectedKeys: any[]
}

export class ExecuteSql extends React.PureComponent<IExecuteSqlProps, IExecuteSqlStates> {
  constructor (props) {
    super(props)
    this.state = {
      alertVisible: true,
      isFold: true,
      selectedKeys: []
    }
  }

  public componentWillMount () {
    this.setState({
      isFold: this.props.route.path === '/project/:pid/bizlogic' ? false : true
    })
  }

  private onSelect = (selectedKeys, info) => {
    this.setState({ selectedKeys })
  }

  private handleClose = () => {
    this.setState({
      alertVisible: false
    })
  }

  private executeSql = () => {
    this.setState({
      isFold: true,
      alertVisible: true
    })
    this.props.initExecuteSql()
  }

  private foldBoard = () => {
    this.setState({
      isFold: !this.state.isFold
    })
  }

  private renderTreeNodes = (data, depth = 0) => {
    return data.map((item) => {
      const { listData, teamParams, onTeamParamChange } = this.props
      const currentItem = listData.find((ld) => ld.id === item.id)
      const treeTitle = (
        <TeamTreeAction
          depth={depth}
          onTeamParamChange={onTeamParamChange}
          teamParams={teamParams}
          currentItem={currentItem}
        />
      )
      if (item.children) {
        return (
          <TreeNode key={item.id} title={treeTitle} dataRef={item}>
            {this.renderTreeNodes(item.children, depth + 1)}
          </TreeNode>
        )
      }
      return <TreeNode key={item.id} title={treeTitle} className={styles.test} />
    })
  }

  public render () {
    const {
      form,
      executeResultList,
      executeColumns,
      initSelectModelItem,
      isShowSqlValidateAlert,
      sqlExecuteCode,
      sqlValidateMessage,
      screenWidth,
      totalCount,
      initChangeIsDeclarate,
      isDeclarate,
      limit,
      limitChange,
      executeLoading,
      viewTeam,
      onCheck,
      teamCheckedKeys,
      changeTabs
    } = this.props

    const {
      alertVisible,
      isFold,
      selectedKeys
    } = this.state

    const { getFieldDecorator } = form

    const itemStyle = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 }
    }

    const tableData = executeResultList
      ? executeResultList.map((i) => {
        // i.key = uuid()
        return i
      })
      : []
    const modelData = executeColumns
      ? executeColumns.map((i) => {
        // i.key = uuid()
        return i
      })
      : []

    const tableDataKey = []
    for (const key in tableData[0]) {
      if (tableData[0].hasOwnProperty(key)) {
        tableDataKey.push(key)
      }
    }
    const tableColumns = []
    tableDataKey.forEach((k, index) => {
      // if (k !== 'key') {
        tableColumns.push({
          title: k,
          dataIndex: k,
          // key: k,
          className: `${utilStyles.textAlignLeft}`
          // width: 80
        } as any)
      // }
    })

    const sqlVisualTypes = []
    for (const item in SQL_FIELD_TYPES) {
      if (SQL_FIELD_TYPES.hasOwnProperty(item)) {
        sqlVisualTypes.push(item)
      }
    }
    const optionSource = sqlVisualTypes.map((opt) => <Select.Option key={opt} value={opt}>{opt}</Select.Option>)

    const modelColumns = [{
      title: '字段名称',
      dataIndex: 'name',
      className: `${utilStyles.textAlignLeft}`,
      key: 'name',
      width: '25%'
    }, {
      title: '数据类型',
      dataIndex: 'modelType',
      key: 'modelType',
      className: `${utilStyles.textAlignLeft}`,
      width: '25%',
      render: (text, record) => {
        return (
        <RadioGroup
          options={['维度', '指标']}
          value={record.modelType === 'category' ? '维度' : '指标'}
          onChange={initSelectModelItem(record, 'modelType')}
        />)}
    }, {
      title: '可视化类型',
      dataIndex: 'visualType',
      className: `${utilStyles.textAlignLeft}`,
      key: 'visualType',
      width: '25%',
      render: (text, record) => {
        return (
          <Select
            size="small"
            style={{ width: '50%' }}
            value={record.visualType}
            onChange={initSelectModelItem(record, 'visualType')}
          >
            {optionSource}
          </Select>
        )
      }
    }, {
      title: '类型',
      dataIndex: 'sqlType',
      className: `${utilStyles.hide}`,
      key: 'sqlType',
      render: (text, record) => {
        return (
          <Input />
        )
      }
    }]

    let sqlValidatePanel
    if (isShowSqlValidateAlert) {
      if (sqlExecuteCode) {
        sqlValidatePanel = alertVisible
          ? (
            <Alert
              className={styles.sqlAlertText}
              message={`syntax check ${sqlExecuteCode === 200 ? 'success' : 'error'}`}
              description={`${sqlValidateMessage || ''}`}
              type={sqlExecuteCode === 200 ? 'success' : 'error'}
              showIcon
              closable
              onClose={this.handleClose}
            />
            )
          : null
      } else {
        sqlValidatePanel = ''
      }
    } else {
      sqlValidatePanel = ''
    }

    // const paginationModel = {
    //   simple: screenWidth < 768 || screenWidth === 768,
    //   defaultPageSize: 10,
    //   showSizeChanger: true,
    //   pageSizeOptions: ['10', '20', '30', '40']
    // }

    const paginationData = {
      simple: screenWidth < 768 || screenWidth === 768,
      defaultPageSize: 100,
      showSizeChanger: true,
      pageSizeOptions: ['100', '200', '500', '1000'],
      total: totalCount
      // onChange: this.onChangeDataTable,
      // onShowSizeChange: this.onChangeDataTable
    }
    // const tablePagination = isDataPagination && totalCount !== -1 ? paginationData : false
    // const paginationWithoutTotal = isDataPagination && totalCount === -1 ? (
    //   <PaginationWithoutTotal
    //     dataLength={tableData.length}
    //     loading={executeLoading}
    //     size="small"
    //     {...paginationData}
    //   />
    // ) : null

    const operations = (
      <Icon
        className={`${isFold ? styles.foldIcon : styles.noFoldIcon}`}
        type={`${isFold ? 'down' : 'up'}`}
        onClick={this.foldBoard}
      />
    )

    const declareMsg = (
      <span>
        声明变量
        <Tooltip title="帮助">
          <Popover
            placement="left"
            content={
              <div className={styles.declareMsg}>
                <p className={styles.textMsg}>查询变量：query@var $变量名称$</p>
                <p className={styles.exampleMsg}>query@var $age$ = '29'; </p>
                <p className={styles.textMsg}>团队权限变量：team@var $变量名称$</p>
                <p className={styles.exampleMsg}>team@var $city$ = '北京'; </p>
              </div>}
            title={<h5>示例：</h5>}
            trigger="click"
          >
            <Icon type="question-circle-o" className={styles.questionClass} />
          </Popover>
        </Tooltip>
      </span>
    )

    return (
      <div className={styles.formView}>
        <Row className={styles.formRight}>
            <Col span={24} className={`small-item-margin ${styles.declareSelect}`}>
              <FormItem label={declareMsg} {...itemStyle}>
                {getFieldDecorator('isDeclarate', {
                  initialValue: 'no'
                })(
                  <RadioGroup size="small" onChange={initChangeIsDeclarate}>
                    <RadioButton value="yes">是</RadioButton>
                    <RadioButton value="no">否</RadioButton>
                  </RadioGroup>
                )}
              </FormItem>
            </Col>
            <Row className={styles.formTop}>
              <Col span={24} className={`${isDeclarate === 'no' ? styles.noDeclaration : ''} ${styles.declareText}`}>
                <textarea id="declaration" placeholder="在这里声明变量" />
              </Col>
              <Col span={24} className={`no-item-margin ${styles.sqlText}`}>
                <textarea id="sql_tmpl" placeholder="输入SQL语句" />
              </Col>
            </Row>

            <Row className={styles.fromBtn}>
              <span className={styles.sqlAlert}>
                {sqlValidatePanel}
              </span>
              {/* <Checkbox
                onChange={this.onChangePage}
                className={styles.pageCheckbox}
                checked={this.state.isDataPagination}
              >分页展示
              </Checkbox> */}
              <span className={styles.limit}>
                展示前
                <InputNumber
                  value={limit}
                  onChange={limitChange}
                  className={styles.input}
                />
                条数据
              </span>
              <Button
                className={styles.executeBtn}
                key="forward"
                type="primary"
                icon="caret-right"
                loading={executeLoading}
                onClick={this.executeSql}
              >
                Execute
              </Button>
            </Row>
            {
              isFold
                ? (
                <Row className={`${isFold ? styles.formBottom : styles.formBottomNone}`}>
                  <Col span={24} className={styles.tabCol}>
                    <Tabs size="small" defaultActiveKey="data" tabBarExtraContent={operations} className={styles.viewTab} onChange={changeTabs}>
                      <TabPane tab="Data" key="data">
                        <div className={styles.viewTabPane}>
                          <Table
                            dataSource={tableData}
                            columns={tableColumns}
                            pagination={paginationData}
                            scroll={{ x: 160 * tableDataKey.length }}
                          />
                          {/* {paginationWithoutTotal} */}
                        </div>
                      </TabPane>
                      <TabPane tab="Model" key="model">
                        <Table
                          className={styles.viewTabPane}
                          dataSource={modelData}
                          columns={modelColumns}
                          pagination={false}
                          // scroll={{y: }}
                        />
                      </TabPane>
                      <TabPane tab="Team" key="team">
                        <Tree
                          className={styles.viewTabPane}
                          checkStrictly
                          checkable
                          defaultExpandAll={true}
                          onCheck={onCheck}
                          checkedKeys={teamCheckedKeys}
                          onSelect={this.onSelect}
                          selectedKeys={selectedKeys}
                        >
                          {this.renderTreeNodes(viewTeam || [])}
                        </Tree>
                      </TabPane>
                    </Tabs>
                  </Col>
                </Row>
                )
                : operations
            }
          </Row>
      </div>
    )
  }
}

export default ExecuteSql

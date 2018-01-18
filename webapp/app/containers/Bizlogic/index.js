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
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-router'

import Container from '../../components/Container'
import Box from '../../components/Box'
import SearchFilterDropdown from '../../components/SearchFilterDropdown'
import BizlogicForm from './BizlogicForm'
import GroupForm from '../Group/GroupForm'
import Modal from 'antd/lib/modal'
import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Table from 'antd/lib/table'
import Button from 'antd/lib/button'
import Tooltip from 'antd/lib/tooltip'
import Icon from 'antd/lib/icon'
import Popconfirm from 'antd/lib/popconfirm'
import Breadcrumb from 'antd/lib/breadcrumb'

import 'codemirror/lib/codemirror.css'
import '../../assets/override/codemirror_theme.css'
const codeMirror = require('codemirror/lib/codemirror')
require('codemirror/mode/sql/sql')

import { promiseDispatcher } from '../../utils/reduxPromisation'
import { uuid } from '../../utils/util'
import { loadBizlogics, addBizlogic, deleteBizlogic, loadBizlogicGroups, editBizlogic, sqlValidate } from './actions'
import { loadGroups, addGroup } from '../Group/actions'
import { loadSources } from '../Source/actions'
import { makeSelectBizlogics } from './selectors'
import { makeSelectGroups } from '../Group/selectors'
import { makeSelectSources } from '../Source/selectors'
import utilStyles from '../../assets/less/util.less'
import { makeSelectLoginUser } from '../App/selectors'

export class Bizlogic extends React.PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      tableSource: [],
      tableSortedInfo: {},
      groupTableSource: [],
      groupTableSelectedRowKeys: [],

      nameFilterValue: '',
      nameFilterDropdownVisible: false,

      modalLoading: false,

      formVisible: false,
      formType: 'add',
      formStep: 0,
      groupFormVisible: false,

      groupParams: [],
      redrawKey: 100000,
      isShowSqlValidateAlert: false,
      isShowUpdateSql: false
    }
    this.codeMirrorInstanceOfQuerySQL = false
    this.codeMirrorInstanceOfUpdateSQL = false
  }

  componentWillMount () {
    const {
      onLoadBizlogics,
      onLoadSources,
      onLoadGroups
    } = this.props

    onLoadBizlogics()
    onLoadSources()
    onLoadGroups()
  }

  componentWillReceiveProps (props) {
    const {loginUser} = this.props
    if (props.bizlogics) {
      this.state.tableSource = props.bizlogics.map(g => {
        g.key = g.id
        return g
      }).filter(ts => ts['create_by'] === loginUser['id'])
    }
  }

  showAdd = () => {
    this.setState({
      formVisible: true,
      formType: 'add',
      groupTableSource: this.props.groups.map(({ id, name }) => ({
        id,
        key: id,
        name,
        params: [],
        checked: false
      }))
    }, () => {
      let queryTextarea = document.querySelector('#sql_tmpl')
      let updateTextarea = document.querySelector('#update_sql')
      this.handleCodeMirror(queryTextarea, updateTextarea)
    })
  }

  showDetail = (id) => () => {
    this.setState({
      formVisible: true,
      formType: 'edit'
    }, () => {
      const {
        name,
        desc,
        source_id,
        sql_tmpl,
        create_by,
        update_sql
      } = this.props.bizlogics.find(b => b.id === id)

      this.bizlogicForm.setFieldsValue({
        id,
        name,
        create_by,
        desc,
        source_id: `${source_id}`,  // eslint-disable-line
        sql_tmpl,
        update_sql
      })

      this.codeMirrorInstanceOfQuerySQL = false
      this.codeMirrorInstanceOfUpdateSQL = false

      this.props.onLoadBizlogicGroups(id)
        .then(groups => {
          const groupTableSource = this.props.groups.map(g => {
            const checkedGroup = groups.find(item => item.group_id === g.id)
            return {
              id: g.id,
              key: g.id,
              name: g.name,
              params: checkedGroup && checkedGroup.sql_params ? JSON.parse(checkedGroup.sql_params) : [],
              checked: !!checkedGroup
            }
          })

          this.setState({
            groupTableSource: groupTableSource,
            groupParams: groups.length && groups[0].sql_params ? JSON.parse(groups[0].sql_params).map(o => o.k) : [],
            groupTableSelectedRowKeys: groups.map(g => g.group_id)
          })
        })
    })
  }
  handleCodeMirror = (queryWrapperDOM, updateWrapperDOM) => {
    if (!this.codeMirrorInstanceOfQuerySQL) {
      this.codeMirrorInstanceOfQuerySQL = codeMirror.fromTextArea(queryWrapperDOM, {
        mode: 'text/x-sql',
        theme: '3024-day',
        lineNumbers: true,
        width: '100%',
        height: '100%',
        lineWrapping: true
      })
    }

    if (!this.codeMirrorInstanceOfUpdateSQL) {
      this.codeMirrorInstanceOfUpdateSQL = codeMirror.fromTextArea(updateWrapperDOM, {
        mode: 'text/x-sql',
        theme: '3024-day',
       // lineNumbers: true,  fixme
        width: '100%',
        height: '100%',
        lineWrapping: true
      })
    }
    this.codeMirrorInstanceOfUpdateSQL.setSize(null, '120px')
  }

  showGroupForm = () => {
    this.setState({
      groupFormVisible: true
    })
  }
  validateSql = () => {
    // todo 校验SQL next()
    const {onValidateSql} = this.props
    const sqlTmpl = this.codeMirrorInstanceOfQuerySQL.getValue()
    this.bizlogicForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { source_id } = values
        if (sqlTmpl) {
          onValidateSql(source_id, sqlTmpl)
          this.asyncValidateResult = setTimeout(() => {
            this.setState({isShowSqlValidateAlert: true})
          }, 100)
        }
      }
    })
  }
  componentWillUnmount () {
    clearTimeout(this.asyncValidateResult)
  }
  changeFormStep = (sign) => () => {
    if (sign) {
      let querySqlValue = this.codeMirrorInstanceOfQuerySQL.getValue()
      let updateSqlValue = this.codeMirrorInstanceOfUpdateSQL.getValue()
      this.bizlogicForm.setFieldsValue({sql_tmpl: querySqlValue, update_sql: updateSqlValue})
      this.bizlogicForm.validateFieldsAndScroll((err, values) => {
        if (!err) {
          const { groupTableSource } = this.state
          const sqlGroupVariables = values.sql_tmpl.match(/group@var\s\$\w+\$/g)
          const groupParams = sqlGroupVariables
            ? sqlGroupVariables.map(gv => gv.substring(gv.indexOf('$') + 1, gv.lastIndexOf('$')))
            : []
          groupTableSource.forEach(gs => {
            const originParams = gs.params

            gs.params = groupParams.map(gp => {
              const alreadyInUseParam = originParams.find(o => o.k === gp)

              if (alreadyInUseParam) {
                return Object.assign({}, alreadyInUseParam)
              } else {
                return {
                  k: gp,
                  v: ''
                }
              }
            })
          })

          this.setState({
            formStep: sign,
            groupParams,
            groupTableSource: groupTableSource.slice()
          })
        }
      })
    } else {
      this.setState({
        formStep: sign
      })
    }
  }

  onGroupTableSelect = (selectedRowKeys) => {
    const { groupTableSource } = this.state
    groupTableSource.forEach(i => {
      if (selectedRowKeys.indexOf(i.id) >= 0) {
        i.checked = true
      } else {
        i.checked = false
      }
    })
    this.setState({
      groupTableSource: groupTableSource.slice(),
      groupTableSelectedRowKeys: selectedRowKeys
    })
  }

  onGroupParamChange = (id, paramIndex) => (e) => {
    const { groupTableSource } = this.state
    const changed = groupTableSource.find(i => i.id === id)
    changed.params[paramIndex].v = e.target.value
    this.setState({
      groupTableSource: groupTableSource.slice()
    })
  }

  onModalOk = () => {
    this.bizlogicForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ modalLoading: true })

        values.source_id = Number(values.source_id)
        values.relBG = this.state.groupTableSource
          .filter(gs => gs.checked)
          .map(gs => ({
            group_id: gs.id,
            sql_params: JSON.stringify(gs.params)
          }))
        // Fixme
        values.trigger_type = ''
        values.frequency = ''
        values.catch = ''

        if (this.state.formType === 'add') {
          this.props.onAddBizlogic(values)
            .then(() => { this.hideForm() })
        } else {
          this.props.onEditBizlogic(values)
            .then(() => { this.hideForm() })
        }
      }
    })
  }

  onGroupAddModalOk = () => {
    this.groupForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ modalLoading: true })
        this.props.onAddGroup(values)
          .then(({ id, name }) => {
            const { groupTableSource, groupParams } = this.state

            groupTableSource.unshift({
              id,
              key: id,
              name,
              params: groupParams.map(gp => ({
                k: gp,
                v: ''
              })),
              checked: false
            })

            this.setState({
              groupTableSource: groupTableSource.slice()
            })
          })
          .then(() => {
            this.hideGroupForm()
          })
      }
    })
  }

  hideForm = () => {
    const redrawKey = uuid(6, 10)
    this.setState({
      formVisible: false,
      redrawKey: redrawKey
    }, () => {
      this.codeMirrorInstanceOfQuerySQL = false
      this.codeMirrorInstanceOfUpdateSQL = false
      this.setState({
        isShowSqlValidateAlert: false,
        isShowUpdateSql: false,
        modalLoading: false,
        formStep: 0,
        groupTableSelectedRowKeys: []
      })
    })
    this.bizlogicForm && this.bizlogicForm.resetFields()
  }

  hideGroupForm = () => {
    this.setState({
      modalLoading: false,
      groupFormVisible: false
    })
    this.groupForm.resetFields()
  }

  handleTableChange = (pagination, filters, sorter) => {
    this.setState({
      tableSortedInfo: sorter
    })
  }

  onSearchInputChange = (columnName) => (e) => {
    this.setState({ [`${columnName}FilterValue`]: e.target.value })
  }

  onSearch = (columnName) => () => {
    const val = this.state[`${columnName}FilterValue`]
    const reg = new RegExp(val, 'gi')

    this.setState({
      [`${columnName}FilterDropdownVisible`]: false,
      tableSource: this.props.bizlogics.map(record => {
        const match = record[columnName].match(reg)

        if (!match) {
          return null
        }

        return {
          ...record,
          [columnName]: (
            <span>
              {record[columnName].split(reg).map((text, i) => (
                i > 0 ? [<span className={utilStyles.highlight}>{match[0]}</span>, text] : text
              ))}
            </span>
          )
        }
      }).filter(record => !!record)
    })
  }
  showUpdateSql = () => {
    const {isShowUpdateSql} = this.state
    this.setState({
      isShowUpdateSql: !isShowUpdateSql
    })
  }

  render () {
    const {
      tableSource,
      tableSortedInfo,
      groupTableSource,
      groupTableSelectedRowKeys,
      nameFilterValue,
      nameFilterDropdownVisible,
      modalLoading,
      formVisible,
      formType,
      formStep,
      groupFormVisible,
      groupParams,
      isShowUpdateSql
    } = this.state

    const {
      sources,
      onDeleteBizlogic
    } = this.props

    const columns = [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      filterDropdown: (
        <SearchFilterDropdown
          placeholder="name"
          value={nameFilterValue}
          onChange={this.onSearchInputChange('name')}
          onSearch={this.onSearch('name')}
        />
      ),
      filterDropdownVisible: nameFilterDropdownVisible,
      onFilterDropdownVisibleChange: visible => this.setState({ nameFilterDropdownVisible: visible }),
      sorter: (a, b) => a.name > b.name ? -1 : 1,
      sortOrder: tableSortedInfo.columnKey === 'name' && tableSortedInfo.order
    }, {
      title: '描述',
      dataIndex: 'desc',
      key: 'desc'
    }, {
      title: 'Source',
      dataIndex: 'source_id',
      key: 'source_id',
      render: (text, record) => {
        const source = sources && sources.find(s => s.id === record.source_id)
        return source && source.name
      }
    }, {
      title: '操作',
      key: 'action',
      width: 120,
      className: `${utilStyles.textAlignCenter}`,
      render: (text, record) => (
        <span className="ant-table-action-column">
          <Tooltip title="修改">
            <Button icon="edit" shape="circle" type="ghost" onClick={this.showDetail(record.id)}></Button>
          </Tooltip>
          <Popconfirm
            title="确定删除？"
            placement="bottom"
            onConfirm={onDeleteBizlogic(record.id)}
          >
            <Tooltip title="删除">
              <Button icon="delete" shape="circle" type="ghost" />
            </Tooltip>
          </Popconfirm>
        </span>
      )
    }]

    const pagination = {
      defaultPageSize: 20,
      showSizeChanger: true
    }

    const modalButtons = formStep
      ? [
        <Button
          key="add"
          size="large"
          type="primary"
          className={utilStyles.modalLeftButton}
          onClick={this.showGroupForm}
        >
          新增用户组
        </Button>,
        <Button
          key="back"
          size="large"
          onClick={this.changeFormStep(0)}>
          上一步
        </Button>,
        <Button
          key="submit"
          size="large"
          type="primary"
          loading={modalLoading}
          disabled={modalLoading}
          onClick={this.onModalOk}>
          保 存
        </Button>
      ]
      : [
        <Button
          key="add"
          size="large"
          type="default"
          className={utilStyles.modalLeftButton}
          onClick={this.showUpdateSql}
        >
          {isShowUpdateSql ? '隐藏' : '显示'} UPDATE
        </Button>,
        <Button
          key="validate"
          size="large"
          onClick={this.validateSql}
        >
          QUERY SQL校验
        </Button>,
        <Button
          key="forward"
          size="large"
          type="primary"
          onClick={this.changeFormStep(1)}>
          下一步
        </Button>
      ]

    const groupAddModalButtons = ([
      <Button
        key="back"
        size="large"
        onClick={this.hideGroupForm}>
        取 消
      </Button>,
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={modalLoading}
        disabled={modalLoading}
        onClick={this.onGroupAddModalOk}>
        保 存
      </Button>
    ])

    return (
      <Container>
        <Helmet title="View" />
        <Container.Title>
          <Row>
            <Col span={24}>
              <Breadcrumb className={utilStyles.breadcrumb}>
                <Breadcrumb.Item>
                  <Link>View</Link>
                </Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>
        </Container.Title>
        <Container.Body>
          <Box>
            <Box.Header>
              <Box.Title>
                <Icon type="bars" />View List
              </Box.Title>
              <Box.Tools>
                <Tooltip placement="bottom" title="新增">
                  <Button type="primary" icon="plus" onClick={this.showAdd} />
                </Tooltip>
              </Box.Tools>
            </Box.Header>
            <Box.Body>
              <Row>
                <Col span={24}>
                  <Table
                    dataSource={tableSource}
                    columns={columns}
                    pagination={pagination}
                    onChange={this.handleTableChange}
                    bordered
                  />
                </Col>
              </Row>
              <Modal
                key={this.state.redrawKey}
                title={`${formType === 'add' ? '新增' : '修改'} View`}
                wrapClassName="ant-modal-large"
                visible={formVisible}
                footer={modalButtons}
                onCancel={this.hideForm}
                maskClosable={false}
              >
                <BizlogicForm
                  type={formType}
                  step={formStep}
                  sources={sources}
                  groups={groupTableSource}
                  groupParams={groupParams}
                  selectedGroups={groupTableSelectedRowKeys}
                  onGroupSelect={this.onGroupTableSelect}
                  onGroupParamChange={this.onGroupParamChange}
                  onCodeMirrorChange={this.handleCodeMirror}
                  isShowSqlValidateAlert={this.state.isShowSqlValidateAlert}
                  isShowUpdateSql={isShowUpdateSql}
                  ref={(f) => { this.bizlogicForm = f }}
                />
              </Modal>
              <Modal
                title="新增用户组"
                wrapClassName="ant-modal-small"
                visible={groupFormVisible}
                footer={groupAddModalButtons}
                onCancel={this.hideGroupForm}
              >
                <GroupForm ref={(f) => { this.groupForm = f }} />
              </Modal>
            </Box.Body>
          </Box>
        </Container.Body>
      </Container>
    )
  }
}

Bizlogic.propTypes = {
  bizlogics: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array
  ]),
  groups: PropTypes.oneOfType([ // eslint-disable-line
    PropTypes.bool,
    PropTypes.array
  ]),
  sources: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.array
  ]),
  loginUser: PropTypes.object,
  onLoadBizlogics: PropTypes.func,
  onAddBizlogic: PropTypes.func,
  onDeleteBizlogic: PropTypes.func,
  onLoadBizlogicGroups: PropTypes.func,
  onEditBizlogic: PropTypes.func,
  onLoadGroups: PropTypes.func,
  onAddGroup: PropTypes.func,
  onLoadSources: PropTypes.func,
  onValidateSql: PropTypes.func
}

export function mapDispatchToProps (dispatch) {
  return {
    onLoadBizlogics: () => promiseDispatcher(dispatch, loadBizlogics),
    onAddBizlogic: (bizlogic) => promiseDispatcher(dispatch, addBizlogic, bizlogic),
    onDeleteBizlogic: (id) => () => promiseDispatcher(dispatch, deleteBizlogic, id),
    onLoadBizlogicGroups: (id) => promiseDispatcher(dispatch, loadBizlogicGroups, id),
    onEditBizlogic: (bizlogic) => promiseDispatcher(dispatch, editBizlogic, bizlogic),
    onLoadGroups: () => promiseDispatcher(dispatch, loadGroups),
    onAddGroup: (group) => promiseDispatcher(dispatch, addGroup, group),
    onLoadSources: () => promiseDispatcher(dispatch, loadSources),
    onValidateSql: (sourceId, sql) => dispatch(sqlValidate(sourceId, sql))
  }
}

const mapStateToProps = createStructuredSelector({
  bizlogics: makeSelectBizlogics(),
  groups: makeSelectGroups(),
  sources: makeSelectSources(),
  loginUser: makeSelectLoginUser()
})

export default connect(mapStateToProps, mapDispatchToProps)(Bizlogic)


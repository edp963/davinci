import React from 'react'
import _ from 'lodash'
import {makeSelectLoginUser} from '../../App/selectors'
import {createStructuredSelector} from 'reselect'
import TeamForm from './TeamForm'
import {makeSelectTeams} from '../../Teams/selectors'
import {connect} from 'react-redux'
import {WrappedFormUtils} from 'antd/lib/form/Form'
import {InjectedRouter} from 'react-router/lib/Router'

import Row from 'antd/lib/row'
import Col from 'antd/lib/col'
import Tooltip from 'antd/lib/tooltip'
import Button from 'antd/lib/button'
import Input from 'antd/lib/input'
import Table from 'antd/lib/table'
import Modal from 'antd/lib/modal'
import Icon from 'antd/lib/icon'
const styles = require('../Organization.less')
import * as Organization from '../Organization'
import {checkNameUniqueAction} from '../../App/actions'
import {addTeam} from '../actions'
import {loadTeams, editTeam, deleteTeam} from '../../Teams/actions'
import Avatar from '../../../components/Avatar'
import ComponentPermission from '../../Account/components/checkMemberPermission'
import { makeSelectTeamModalLoading } from '../selectors'

interface ITeamsState {
  formVisible: boolean
  searchValue: string
  filteredTableSource: {
    type: 'origin' | 'filtered'
    dataSource: any[]
  }
}

interface ITeamsProps {
  router?: InjectedRouter
  teams?: ITeam[]
  onLoadTeams?: () => any
  toThatTeam: (url: string) => any
  onAddTeam?: (team: ITeam, resolve: () => any) => any
  currentOrganization: Organization.IOrganization
 // organizationTeams: Organization.IOrganizationTeams
  organizationTeams: any
  organizations: any
  teamModalLoading?: boolean
  loadOrganizationTeams: (id: number) => any
  onLoadOrganizationDetail?: (id: number) => any
  onCheckUniqueName?: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
}


export interface ITeam {
  id?: number
  role?: number
  avatar?: string
  organization?: Organization.IOrganization
  name?: string
  visibility?: boolean
  description: string
  parentTeamId: number
}

export class TeamList extends React.PureComponent<ITeamsProps, ITeamsState> {
  constructor (props) {
    super(props)
    this.state = {
      formVisible: false,
      searchValue: '',
      filteredTableSource: {
        type: 'origin',
        dataSource: []
      }
    }
  }

  private TeamForm: WrappedFormUtils

  public componentWillMount () {
    const { onLoadTeams, organizationTeams } = this.props
    onLoadTeams()
    this.getFilteredTableSource(organizationTeams)
  }

  public componentWillReceiveProps (nextProps: ITeamsProps) {
    const { organizationTeams } = this.props
    if (nextProps.organizationTeams && nextProps.organizationTeams !== organizationTeams) {
      this.getFilteredTableSource(nextProps.organizationTeams)
    }
  }

  private showTeamForm = () => (e) => {
    e.stopPropagation()
    this.setState({
      formVisible: true
    })
  }

  private checkNameUnique = (rule, value = '', callback) => {
    const {onCheckUniqueName, currentOrganization: {id}} = this.props
    const data = {
      name: value,
      orgId: id,
      id: null
    }
    onCheckUniqueName('team', data,
      () => {
        callback()
      }, (err) => {
        callback(err)
      })
  }

  private onModalOk = () => {
    const {currentOrganization} = this.props
    this.TeamForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.onAddTeam({
          ...values,
          ...{
            visibility: !!values.visibility
          },
          orgId: currentOrganization.id,
          pic: `${Math.ceil(Math.random() * 19)}`,
          config: '{}'
        }, () => {
          const { id } = currentOrganization
          if (this.props.loadOrganizationTeams) {
            this.props.loadOrganizationTeams(Number(id))
            this.props.onLoadOrganizationDetail(Number(id))
            this.props.onLoadTeams()
          }
          this.hideTeamForm()
        })
      }
    })
  }
  private hideTeamForm = () => {
    this.setState({
      formVisible: false
    })
  }

  private afterTeamFormClose = () => {
    this.TeamForm.resetFields()
  }

  private organizationTypeChange = () =>
    new Promise((resolve) => {
      this.forceUpdate(() => resolve())
    })

  private enterTeam = (record) => () => {
    const {id} = record
    if (id) {
      this.props.toThatTeam(`account/team/${id}`)
    }
  }

  private renderExpandIcon = (props) => {
    return props.record.children
      ? (
        <Icon
          className={styles.teamTableExpandIcon}
          type={`${props.expanded ? 'minus' : 'plus'}-square`}
          onClick={this.expandIconClick(props)}
        />
      )
      : null
  }

  private expandIconClick = (props) => (e) => {
    return props.onExpand(props.record, e)
  }

  private expandedTableRow = (record) => {
    const tableSource = []
    this.getExpandChildTeams(this.props.organizationTeams, record.id, tableSource)
    return (
      <Table
        className={styles.childTable}
        showHeader={false}
        columns={this.getTableColumn()}
        dataSource={tableSource}
        expandedRowRender={this.expandedTableRow}
        expandIcon={this.renderExpandIcon}
        pagination={false}
      />
    )
  }

  private getExpandChildTeams = (teams, recordId, tableSource) => {
    for (let i = 0; i < teams.length; i += 1) {
      const team = teams[i]
      if (team.id === recordId) {
        if (team.children) {
          team.children.forEach((childTeam) => {
            const { children, ...rest } = childTeam
            tableSource.push({
              key: rest.id,
              ...rest,
              children: !!children
            })
          })
        }
        break
      } else {
        if (team.children) {
          this.getExpandChildTeams(team.children, recordId, tableSource)
        }
      }
    }
  }

  private getTableColumn = () => {
    return  [{
      title: 'Name',
      key: 'name',
      render: (text, record) => {
        return (
          <div className={styles.childTableCell}>
            <a onClick={this.enterTeam(record)} className={styles.avatarName}>{record.name}</a>
            <span className={styles.avatarName}>{`${ record.users ? record.users.length : 0 } 成员`}</span>
          </div>
        )
      }
    }]
  }

  private getFilteredTableSource = (originDataSource) => {
    const { searchValue } = this.state
    const filteredData = []

    if (originDataSource) {
      if (searchValue.trim()) {
        this.getSearchingTeams(originDataSource, searchValue.trim(), filteredData)
        this.setState({
          filteredTableSource: {
            type: 'filtered',
            dataSource: filteredData
          }
        })
      } else {
        originDataSource.forEach((team) => {
          const { children, ...rest } = team
          filteredData.push({
            key: rest.id,
            ...rest,
            children: !!children
          })
        })
        this.setState({
          filteredTableSource: {
            type: 'origin',
            dataSource: filteredData
          }
        })
      }
    }
  }

  private getSearchingTeams = (teams, value, filteredData) => {
    teams.forEach((team) => {
      const { children, ...rest } = team
      if (rest.name.includes(value)) {
        filteredData.push({
          key: rest.id,
          children: !!children,
          ...rest
        })
      }
      if (children) {
        this.getSearchingTeams(
          children,
          value,
          filteredData
        )
      }
    })
  }

  private searchChange = (e) => {
    this.setState({
      searchValue: e.target.value
    })
  }

  private searchTeam = () => {
    this.getFilteredTableSource(this.props.organizationTeams)
  }

  public render () {
    const { formVisible, searchValue, filteredTableSource } = this.state
    const { currentOrganization, currentOrganization: {id}, teamModalLoading } = this.props
    const { dataSource } = filteredTableSource

    let CreateButton = void 0
    if (currentOrganization) {
      CreateButton = ComponentPermission(currentOrganization, '')(Button)
    }

    return (
      <div className={styles.listWrapper}>
        <Row>
          <Col span={16}>
            <Input.Search
              value={searchValue}
              placeholder="搜索团队"
              onChange={this.searchChange}
              onSearch={this.searchTeam}
            />
          </Col>
          <Col span={1} offset={7}>
          <Tooltip placement="bottom" title="创建">
            <CreateButton
              type="primary"
              icon="plus"
              onClick={this.showTeamForm()}
            />
          </Tooltip>
          </Col>
        </Row>
        <Row>
          <div className={styles.tableWrap}>
            <Table
              bordered
              columns={this.getTableColumn()}
              dataSource={dataSource}
              expandedRowRender={this.expandedTableRow}
              expandIcon={this.renderExpandIcon}
              pagination={false}
            />
          </div>
        </Row>
        <Modal
          title={null}
          visible={formVisible}
          footer={null}
          onCancel={this.hideTeamForm}
          afterClose={this.afterTeamFormClose}
        >
          <TeamForm
            orgId={id}
            teams={this.props.teams}
            onModalOk={this.onModalOk}
            modalLoading={teamModalLoading}
            onOrganizationTypeChange={this.organizationTypeChange}
            onCheckUniqueName={this.checkNameUnique}
            ref={(f) => {
              this.TeamForm = f
            }}
          />
        </Modal>
      </div>
    )
  }
}


const mapStateToProps = createStructuredSelector({
  teams: makeSelectTeams(),
  loginUser: makeSelectLoginUser(),
  teamModalLoading: makeSelectTeamModalLoading()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadTeams: () => dispatch(loadTeams()),
    onAddTeam: (team, resolve) => dispatch(addTeam(team, resolve)),
    onEditTeam: (team) => dispatch(editTeam(team)),
    onDeleteTeam: (id, resolve) => () => dispatch(deleteTeam(id, resolve)),
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject))
  }
}

export default connect<{}, {}, ITeamsProps>(mapStateToProps, mapDispatchToProps)(TeamList)


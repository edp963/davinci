import * as React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Row, Col, Tooltip, Input, Table, Modal, Button, Icon } from 'antd'
import { WrappedFormUtils } from 'antd/lib/form/Form'
const styles = require('../Team.less')
import AddForm from './AddForm'
import TeamForm from '../../Organizations/component/TeamForm'
import * as Team from '../Team'
import Avatar from '../../../components/Avatar'
import ComponentPermission from '../../Account/components/checkMemberPermission'
import { checkNameUniqueAction } from '../../App/actions'
import { addTeam } from '../../Organizations/actions'
import { loadTeamTeams } from '../../Teams/actions'
import { makeSelectTeamModalLoading } from '../../Organizations/selectors'

interface ITeamListState {
  modalLoading: boolean
  formType: string
  formVisible: boolean
  teamFormVisible: boolean
  listType: string
  searchValue: string
  filteredTableSource: {
    type: 'origin' | 'filtered'
    dataSource: any[]
  }
}

interface ITeamListProps {
  teamModalLoading?: boolean
  currentTeam: any
  toThatTeam: (url: string) => any
  currentTeamTeams: Team.ITeamTeams[]
  onAddTeam?: (team: object, resolve: () => any) => any
  onLoadTeamTeams?: (id: number) => any
  onCheckUniqueName?: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
}

export class TeamList extends React.PureComponent <ITeamListProps, ITeamListState> {

  constructor (props) {
    super(props)
    this.state = {
      modalLoading: false,
      formType: '',
      formVisible: false,
      teamFormVisible: false,
      listType: '',
      searchValue: '',
      filteredTableSource: {
        type: 'origin',
        dataSource: []
      }
    }
  }

  private TeamForm: WrappedFormUtils
  private AddForm: WrappedFormUtils

  public componentWillMount () {
    this.getFilteredTableSource(this.props.currentTeamTeams)
  }

  public componentWillReceiveProps (nextProps) {
    const { currentTeamTeams } = this.props
    if (nextProps.currentTeamTeams && nextProps.currentTeamTeams !== currentTeamTeams) {
      this.getFilteredTableSource(nextProps.currentTeamTeams)
    }
  }

  private showAddForm = (type: string) => (e) => {
    e.stopPropagation()
    this.setState({
      formType: type,
      formVisible: true
    })
  }
  private hideAddForm = () => {
    this.setState({
      formVisible: false
    })
  }

  private toThatTeam = (record) => () => {
    const {id} = record
    if (id) {
      this.props.toThatTeam(`account/team/${id}`)
    }
  }

  private checkNameUnique = (rule, value = '', callback) => {
    const {onCheckUniqueName, currentTeam} = this.props
    const data = {
      name: value,
      orgId: currentTeam.organization.id,
      id: null
    }
    onCheckUniqueName('team', data,
      () => {
        callback()
      }, (err) => {
        callback(err)
      })
  }

  private showTeamForm = () => (e) => {
    const { currentTeam } = this.props
    e.stopPropagation()
    this.setState({
      teamFormVisible: true,
      listType: 'teamTeamList'
    }, () => {
      setTimeout(() => {
        this.TeamForm.setFieldsValue({
          parentTeamId: currentTeam.name
        })
      }, 0)
    })
  }

  private onTeamFormModalOk = () => {
    const { currentTeam } = this.props
    this.TeamForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { name, description } = values
        this.props.onAddTeam({
          parentTeamId: currentTeam.id,
          name,
          description,
          ...{ visibility: !!values.visibility },
          orgId: currentTeam.organization.id,
          pic: `${Math.ceil(Math.random() * 19)}`,
          config: '{}'
        }, () => {
          this.props.onLoadTeamTeams(currentTeam.id)
          this.hideTeamForm()
        })
      }
    })
  }

  private hideTeamForm = () => {
    this.setState({
      teamFormVisible: false
    }, () => {
      this.TeamForm.resetFields()
    })
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
    this.getExpandChildTeams(this.props.currentTeamTeams, record.id, tableSource)
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
            <a onClick={this.toThatTeam(record)} className={styles.avatarName}>{record.name}</a>
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
    this.getFilteredTableSource(this.props.currentTeamTeams)
  }

  public render () {
    const { formVisible, teamFormVisible, listType, searchValue, filteredTableSource } = this.state
    const { currentTeam, teamModalLoading } = this.props
    const { dataSource } = filteredTableSource

    let CreateButton = void 0
    if (currentTeam) {
      CreateButton = ComponentPermission(currentTeam, '')(Button)
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
          footer={null}
          visible={formVisible}
          onCancel={this.hideAddForm}
        >
          <AddForm
            ref={(f) => { this.AddForm = f }}
          />
        </Modal>
        <Modal
          title={null}
          visible={teamFormVisible}
          footer={null}
          onCancel={this.hideTeamForm}
        >
          <TeamForm
            listType={listType}
            onModalOk={this.onTeamFormModalOk}
            modalLoading={teamModalLoading}
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
  teamModalLoading: makeSelectTeamModalLoading()
})

export function mapDispatchToProps (dispatch) {
  return {
    onAddTeam: (team, resolve) => dispatch(addTeam(team, resolve)),
    onLoadTeamTeams: (id) => dispatch(loadTeamTeams(id)),
    onCheckUniqueName: (pathname, data, resolve, reject) => dispatch(checkNameUniqueAction(pathname, data, resolve, reject))
  }
}

export default connect<{}, {}, ITeamListProps>(mapStateToProps, mapDispatchToProps)(TeamList)




import * as React from 'react'
import {compose} from 'redux'
import reducer from '../reducer'
import {makeSelectLoginUser} from '../../App/selectors'
import injectReducer from '../../../utils/injectReducer'
import {loadTeams} from '../../Teams/actions'
import {createStructuredSelector} from 'reselect'
import injectSaga from '../../../utils/injectSaga'
import TeamForm from './TeamForm'
import {makeSelectTeams} from '../../Teams/selectors'
import {connect} from 'react-redux'
import {WrappedFormUtils} from 'antd/lib/form/Form'
import {InjectedRouter} from 'react-router/lib/Router'
import saga from '../sagas'
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Tooltip = require('antd/lib/tooltip')
const Button = require('antd/lib/button')
const Input = require('antd/lib/input')
const Select = require('antd/lib/select')
const Table = require('antd/lib/table')
const Icon = require('antd/lib/icon')
const Modal = require('antd/lib/modal')
const styles = require('../Organization.less')


interface ITeamsState {
  formType?: string
  formVisible: boolean
  modalLoading: boolean
}
interface ITeamsProps {
  router: InjectedRouter
}
interface ITeam {
  name?: string
}
export class TeamList extends React.PureComponent<ITeamsProps, ITeamsState> {
  constructor (props) {
    super(props)
    this.state = {
      formType: '',
      formVisible: false,
      modalLoading: false
    }
  }

  private TeamForm: WrappedFormUtils
  private showTeamForm = (formType, team?: ITeam) => (e) => {
    e.stopPropagation()
    this.setState({
      formType,
      formVisible: true
    }, () => {
      if (team) {
        this.TeamForm.setFieldsValue(team)
      }
    })
  }
  private onModalOk = () => {
    this.TeamForm.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.setState({ modalLoading: true })
        if (this.state.formType === 'add') {
          this.props.onAddTeam({
            ...values,
            pic: `${Math.ceil(Math.random() * 19)}`,
            linkage_detail: '[]',
            config: '{}'
          }, () => { this.hideTeamForm() })
        }
      }
    })
  }
  private hideTeamForm = () => {
    this.setState({
      formVisible: false,
      modalLoading: false
    }, () => {
      this.TeamForm.resetFields()
    })
  }

  private onSearchTeam = () => {

  }
  public render () {
    const { formVisible, formType, modalLoading } = this.state
    const addButton =  (
      <Tooltip placement="bottom" title="创建">
        <Button
          size="large"
          type="primary"
          icon="plus"
          onClick={this.showTeamForm('add')}
        />
      </Tooltip>
    )

    const columns = [{
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '40%'
    }, {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
      width: '30%'
    }, {
      title: 'Address',
      dataIndex: 'address',
      key: 'address'
    }]

    const data = [{
      key: 1,
      name: 'John Brown sr.',
      age: 60,
      address: 'New York No. 1 Lake Park',
      children: [{
        key: 11,
        name: 'John Brown',
        age: 42,
        address: 'New York No. 2 Lake Park'
      }, {
        key: 12,
        name: 'John Brown jr.',
        age: 30,
        address: 'New York No. 3 Lake Park',
        children: [{
          key: 121,
          name: 'Jimmy Brown',
          age: 16,
          address: 'New York No. 3 Lake Park'
        }],
      }, {
        key: 13,
        name: 'Jim Green sr.',
        age: 72,
        address: 'London No. 1 Lake Park',
        children: [{
          key: 131,
          name: 'Jim Green',
          age: 42,
          address: 'London No. 2 Lake Park',
          children: [{
            key: 1311,
            name: 'Jim Green jr.',
            age: 25,
            address: 'London No. 3 Lake Park',
          }, {
            key: 1312,
            name: 'Jimmy Green sr.',
            age: 18,
            address: 'London No. 4 Lake Park',
          }],
        }],
      }],
    }, {
      key: 2,
      name: 'Joe Black',
      age: 32,
      address: 'Sidney No. 1 Lake Park',
    }]

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      },
      onSelect: (record, selected, selectedRows) => {
        console.log(record, selected, selectedRows);
      },
      onSelectAll: (selected, selectedRows, changeRows) => {
        console.log(selected, selectedRows, changeRows);
      }
    }

    const modalButtons = [(
      <Button
        key="back"
        size="large"
        onClick={this.hideTeamForm}
      >
        取 消
      </Button>
    ), (
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={modalLoading}
        disabled={modalLoading}
        onClick={this.onModalOk}
      >
        保 存
      </Button>
    )]
    return (
      <div className={styles.listWrapper}>
        <Row>
          <Col span={16}>
            <Input.Search
              size="large"
              placeholder="placeholder"
              onSearch={this.onSearchTeam}
            />
          </Col>
          <Col span={1} offset={7}>
            {addButton}
          </Col>
        </Row>
        <Row>
          <div className={styles.tableWrap}>
            <Table
              bordered
              columns={columns}
              //  rowSelection={rowSelection}
              dataSource={data}
            />
          </div>
        </Row>
        <Modal
          title={null}
          visible={formVisible}
          footer={null}
          onCancel={this.hideTeamForm}
        >
          <TeamForm
            type={formType}
            ref={(f) => { this.TeamForm = f }}
          />
        </Modal>
      </div>
    )
  }
}


const mapStateToProps = createStructuredSelector({
  teams: makeSelectTeams(),
  loginUser: makeSelectLoginUser()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadTeams: () => dispatch(loadTeams()),
    onAddTeam: (team, resolve) => dispatch(addTeam(team, resolve)),
    onEditTeam: (team, resolve) => dispatch(editTeam(team, resolve)),
    onDeleteTeam: (id) => () => dispatch(deleteTeam(id))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withReducer = injectReducer({ key: 'teams', reducer })
const withSaga = injectSaga({ key: 'teams', saga })

export default compose(
  withReducer,
  withSaga,
  withConnect
)(TeamList)




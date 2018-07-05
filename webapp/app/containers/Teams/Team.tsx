import * as React from 'react'
import { connect } from 'react-redux'
const Icon = require('antd/lib/icon')
import { Link } from 'react-router'
import Box from '../../components/Box'
import {InjectedRouter} from 'react-router/lib/Router'
import MemberList from './component/MemberList'
import ProjectList from './component/ProjectList'
import Setting from './component/Setting'
import TeamList from './component/TeamList'
const styles = require('./Team.less')
const utilStyles = require('../../assets/less/util.less')
const Tabs = require('antd/lib/tabs')
const TabPane = Tabs.TabPane
const Breadcrumb = require('antd/lib/breadcrumb')
import Avatar from '../../components/Avatar'
import {compose} from 'redux'
import injectReducer from '../../utils/injectReducer'
import reducer from './reducer'
import injectSaga from '../../utils/injectSaga'
import saga from './sagas'
import reducerApp from '../App/reducer'
import sagaApp from '../App/sagas'
import { loadTeamProjects, loadTeamMembers, loadTeamTeams, loadTeamDetail } from './actions'
import {createStructuredSelector} from 'reselect'
import {makeSelectLoginUser} from '../App/selectors'
import {
  makeSelectCurrentTeamMembers,
  makeSelectCurrentTeamProjects,
  makeSelectCurrentTeams,
  makeSelectCurrentTeamTeams,
  makeSelectTeams,
} from './selectors'

interface ITeamsProps {
  router: InjectedRouter
  loginUser: any
  teams: any
  currentTeam: ITeam[]
  currentTeamProjects: ITeamProjects[]
  currentTeamTeams: ITeamTeams[]
  currentTeamMembers: ITeamMembers[]
  onLoadTeamProjects: (id: number) => any
  onLoadTeamMembers: (id: number) => any
  onLoadTeamTeams: (id: number) => any
  onLoadTeamDetail: (id: number) => any
}

export interface ITeam {
  id: number
}

export interface ITeamProjects {
  id: number
}

export interface ITeamTeams {
  id: number
}

export interface ITeamMembers {
  id: number
}

export class Teams extends React.PureComponent<ITeamsProps> {
  private callback = () => {

  }
  private componentWillMount () {
    const {
      onLoadTeamProjects,
      onLoadTeamMembers,
      onLoadTeamTeams,
      onLoadTeamDetail,
      params: {teamId}
    } = this.props
      onLoadTeamProjects(Number(teamId))
      onLoadTeamMembers(Number(teamId))
      onLoadTeamTeams(Number(teamId))
      onLoadTeamDetail(Number(teamId))
  }
  public render () {
    const {
      currentTeam,
      currentTeamProjects,
      currentTeamTeams,
      currentTeamMembers
    } = this.props
    const { avatar, name, projectNum, memberNum, teamNum } = currentTeam
    return (
      <Box>
        <Box.Header>
          <Box.Title>
            <Breadcrumb className={utilStyles.breadcrumb}>
              <Breadcrumb.Item>
                <Link to="/account/teams">
                  <Icon type="bars" />我的团队
                </Link>
              </Breadcrumb.Item>
            </Breadcrumb>
          </Box.Title>
        </Box.Header>
        <Box.Body>
          <div className={styles.teamLogo}>
            <Avatar path={avatar} enlarge={false} size="small"/>
            <div className={styles.title}>{name}</div>
          </div>
          <Tabs onChange={this.callback} >
            <TabPane tab={<span><Icon type="user" />成员</span>} key="members">
              <MemberList/>
            </TabPane>
            <TabPane tab={<span><Icon type="api" />项目</span>} key="projects">
              <ProjectList />
            </TabPane>
            <TabPane tab={<span><Icon type="usergroup-add" />团队</span>} key="teams">
              <TeamList/>
            </TabPane>
            <TabPane tab={<span><Icon type="setting" />设置</span>} key="settings">
              <Setting/>
            </TabPane>
          </Tabs>
        </Box.Body>
      </Box>
    )
  }
}

const mapStateToProps = createStructuredSelector({
  loginUser: makeSelectLoginUser(),
  teams: makeSelectTeams(),
  currentTeam: makeSelectCurrentTeams(),
  currentTeamProjects: makeSelectCurrentTeamProjects(),
  currentTeamTeams: makeSelectCurrentTeamTeams(),
  currentTeamMembers: makeSelectCurrentTeamMembers()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadTeamProjects: (id) => dispatch(loadTeamProjects(id)),
    onLoadTeamMembers: (id) => dispatch(loadTeamMembers(id)),
    onLoadTeamTeams: (id) => dispatch(loadTeamTeams(id)),
    onLoadTeamDetail: (id) => dispatch(loadTeamDetail(id))
  }
}

const withConnect = connect(mapStateToProps, mapDispatchToProps)

const withReducer = injectReducer({ key: 'team', reducer })
const withSaga = injectSaga({ key: 'team', saga })

const withAppReducer = injectReducer({key: 'app', reducer: reducerApp})
const withAppSaga = injectSaga({key: 'app', saga: sagaApp})

export default compose(
  withReducer,
  withAppReducer,
  withAppSaga,
  withSaga,
  withConnect
)(Teams)


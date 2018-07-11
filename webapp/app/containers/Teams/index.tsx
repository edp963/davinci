// Team Project
// team project
// TEAM PROJECT
import * as React from 'react'
import { Link } from 'react-router'
const Icon = require('antd/lib/icon')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Button = require('antd/lib/button')
const Tag = require('antd/lib/tag')
import Box from '../../components/Box'
import {InjectedRouter} from 'react-router/lib/Router'
import { loadTeams } from './actions'
import saga from './sagas'
import sagaApp from '../App/sagas'
import injectReducer from '../../utils/injectReducer'
import reducer from './reducer'
import {makeSelectLoginUser} from '../App/selectors'
import injectSaga from '../../utils/injectSaga'
import {makeSelectTeams} from './selectors'
import reducerApp from '../App/reducer'
import {createStructuredSelector} from 'reselect'
import {connect} from 'react-redux'
import {compose} from 'redux'
const styles = require('./Team.less')
const utilStyles = require('../../assets/less/util.less')
const Breadcrumb = require('antd/lib/breadcrumb')
import Avatar from '../../components/Avatar'

interface ITeam {
  id: number
  avatar: string
  description: string
  name: string
  role: number
  visibility: boolean
  organization: any
}

interface ITeamProps {
  router: InjectedRouter
  teams: ITeam[]
  onLoadTeams: () => any
}



export class Teams extends React.PureComponent <ITeamProps> {
  private toTeam = (team) => () => {
    this.props.router.push(`/account/team/${team.id}`)
  }
  public componentWillMount () {
    const { onLoadTeams } = this.props
    onLoadTeams()
  }
  public render () {
    const { teams } = this.props
    const teamArr = teams ? teams.map((team) => (
        <div className={styles.groupList} key={team.id}>
          <div className={styles.orgHeader}>
            <div className={styles.avatar}>
              <Avatar path={team.avatar} enlarge={false} size="small"/>
              <Tag className={styles.orgName}>{team.organization.name}</Tag>/
              &nbsp;<div className={styles.title}>{team.name}</div>
            </div>
          </div>
          <div className={styles.setting}>
            <Icon type="setting" onClick={this.toTeam(team)}/>
          </div>
        </div>
      )
    ) : ''

    return (
      <Box>
        <Box.Header>
          <Box.Title>
            <Row>
              <Col span={20}>
                <Breadcrumb className={utilStyles.breadcrumb}>
                  <Breadcrumb.Item>
                    <Link to="/account/teams">
                      <Icon type="bars" />我的团队
                    </Link>
                  </Breadcrumb.Item>
                </Breadcrumb>
              </Col>
            </Row>
          </Box.Title>
        </Box.Header>
        {teamArr}
      </Box>
    )
  }
}


const mapStateToProps = createStructuredSelector({
  teams: makeSelectTeams(),
  loginUser: makeSelectLoginUser()
})

export function mapDispatchToProps (dispatch) {
  return {
    onLoadTeams: () => dispatch(loadTeams())
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



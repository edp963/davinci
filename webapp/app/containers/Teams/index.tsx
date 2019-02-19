// Team Project
// team project
// TEAM PROJECT
import * as React from 'react'
import { Link } from 'react-router'
import { Icon, Row, Col, Tag, Breadcrumb, Pagination } from 'antd'
import { PaginationConfig } from 'antd/lib/table'
import Box from '../../components/Box'
import { InjectedRouter } from 'react-router/lib/Router'
import { loadTeams } from './actions'
import { makeSelectLoginUser } from '../App/selectors'
import { makeSelectTeams } from './selectors'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
const styles = require('./Team.less')
const utilStyles = require('../../assets/less/util.less')
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
  onLoadTeams?: () => any
}

interface ITeamStates {
  pagination: PaginationConfig
}



export class Teams extends React.PureComponent <ITeamProps, ITeamStates> {
  constructor (props) {
    super(props)
    this.state = {
      pagination: {
        current: 1,
        pageSize: 20,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
        total: 0
      }
    }
  }

  private toTeam = (team) => () => {
    this.props.router.push(`/account/team/${team.id}`)
  }

  public componentWillMount () {
    const { onLoadTeams } = this.props
    onLoadTeams()
  }

  public componentWillReceiveProps (nextProps: ITeamProps) {
    const { teams } = this.props
    const { pagination } = this.state
    if (nextProps.teams !== teams) {
      this.setState({
        pagination: {
          ...pagination,
          current: 1,
          total: nextProps.teams.length
        }
      })
    }
  }

  private change = (current, pageSize) => {
    this.setState({
      pagination: {
        ...this.state.pagination,
        current,
        pageSize
      }
    })
  }

  public render () {
    const { teams } = this.props
    const { pagination } = this.state
    const { current, pageSize } = pagination
    const currentIndex = (current - 1) * pageSize
    const currentPageTeams = teams ? teams.slice(currentIndex, currentIndex + pageSize) : []
    const teamArr = currentPageTeams.map((team) => (
      <div className={styles.groupList} key={`team${team.id}`} onClick={this.toTeam(team)}>
        <div className={styles.orgHeader}>
          <div className={styles.avatar}>
            <Avatar path={team.avatar} enlarge={false} size="small"/>
            <Tag className={styles.orgName} color="#2db7f5">{team.organization.name}</Tag>/
            &nbsp;<div className={styles.title}>{team.name}</div>
          </div>
        </div>
        <div className={styles.setting}>
          <Icon type="setting"/>
        </div>
      </div>
    ))

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
        <Pagination
          className={styles.teamPagination}
          {...pagination}
          onChange={this.change}
          onShowSizeChange={this.change}
        />
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

export default connect<{}, {}, ITeamProps>(mapStateToProps, mapDispatchToProps)(Teams)


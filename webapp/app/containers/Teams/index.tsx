// Team Project
// team project
// TEAM PROJECT
import * as React from 'react'
import { Link } from 'react-router'
const Icon = require('antd/lib/icon')
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Button = require('antd/lib/button')
import Box from '../../components/Box'
import {InjectedRouter} from 'react-router/lib/Router'
const styles = require('./Team.less')
const utilStyles = require('../../assets/less/util.less')
const Breadcrumb = require('antd/lib/breadcrumb')

const defaultItems = [
  {icons: 'user', key: '1', id: '1', text: '个人信息', route: 'profile'},
  {icons: 'contacts', key: '2', id: '2', text: '修改密码', route: 'resetPassword'},
  {icons: 'global', key: '3', id: '3', text: '我的组织', route: 'organization'},
  {icons: 'usergroup-delete', key: '4', id: '4', text: '我的团队', route: 'team'}
]

interface ITeamProps {
  router: InjectedRouter
}
export class Teams extends React.PureComponent <ITeamProps> {
  private toTeam = (team) => () => {
    this.props.router.push(`/account/team/${team.id}`)
  }
  public render () {
    const teams = defaultItems.map((org) => {
      const items = (
        <div className={styles.groupList} key={org.icons}>
          <div className={styles.teamName}>
            {org.icons}
          </div>
          <div className={styles.setting}>
            <Icon type="setting" onClick={this.toTeam(org)}/>
          </div>
        </div>
      )
      return items
    })
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
        {teams}
      </Box>
    )
  }
}

export default Teams


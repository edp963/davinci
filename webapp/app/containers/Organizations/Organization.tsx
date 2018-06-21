import * as React from 'react'
import { Link } from 'react-router'
const Icon = require('antd/lib/icon')
import Box from '../../components/Box'
// const styles = require('./Organization.less')
import {InjectedRouter} from 'react-router/lib/Router'
import MemberList from './component/MemberList'
import ProjectList from './component/ProjectList'
import Setting from './component/Setting'
import TeamList from './component/TeamList'
const utilStyles = require('../../assets/less/util.less')
const Tabs = require('antd/lib/tabs')
const TabPane = Tabs.TabPane
const Breadcrumb = require('antd/lib/breadcrumb')

interface IOrganizationProps {
  router: InjectedRouter
}


export class Organization extends React.PureComponent <IOrganizationProps> {
  private callback = () => {
    console.log('callback')
  }
  public render () {
    return (
      <Box>
        <Box.Header>
          <Box.Title>
            <Breadcrumb className={utilStyles.breadcrumb}>
              <Breadcrumb.Item>
                <Link to="/account/organizations">
                  <Icon type="bars" />我的组织
                </Link>
              </Breadcrumb.Item>
            </Breadcrumb>
          </Box.Title>
        </Box.Header>
        <Box.Body>
          <Tabs onChange={this.callback} >
            <TabPane tab={<span><Icon type="api" />项目</span>} key="projects">
              <ProjectList/>
            </TabPane>
            <TabPane tab={<span><Icon type="user" />成员</span>} key="members">
              <MemberList/>
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

export default Organization





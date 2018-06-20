import * as React from 'react'
const Icon = require('antd/lib/icon')
import { Link } from 'react-router'
import Box from '../../components/Box'
import {InjectedRouter} from 'react-router/lib/Router'
const styles = require('./Organization.less')
const utilStyles = require('../../assets/less/util.less')
const Breadcrumb = require('antd/lib/breadcrumb')

const defaultItems = [
  {icons: 'user', key: '1', id: '1', text: '个人信息', route: 'profile'},
  {icons: 'contacts', key: '2', id: '2', text: '修改密码', route: 'resetPassword'},
  {icons: 'global', key: '3', id: '3', text: '我的组织', route: 'organization'},
  {icons: 'usergroup-delete', key: '4', id: '4', text: '我的团队', route: 'team'}
]

interface IOrganizationProps {
  router: InjectedRouter
}
export class Organizations extends React.PureComponent<IOrganizationProps> {
  private toOrganization = (organization) => () => {
    this.props.router.push(`/account/organization/${organization.id}`)
  }
  public render () {
    const organizations = defaultItems.map((org) => {
      const items = (
        <div className={styles.groupList} key={org.icons}>
          <div className={styles.orgName}>
            {org.icons}
          </div>
          <div className={styles.setting}>
            <Icon type="setting" onClick={this.toOrganization(org)}/>
          </div>
        </div>
      )
      return items
    })
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
        {organizations}
      </Box>
    )
  }
}

export default Organizations


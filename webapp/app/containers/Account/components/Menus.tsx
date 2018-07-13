import * as React from 'react'
import { Link } from 'react-router'
const Menu = require('antd/lib/menu')
const Icon = require('antd/lib/icon')
const defaultItems = [
  {icons: 'user', key: '1', text: '个人信息', route: 'profile'},
  {icons: 'contacts', key: '2', text: '修改密码', route: 'resetPassword'},
  {icons: 'global', key: '3', text: '我的组织', route: 'organizations'},
  {icons: 'usergroup-add', key: '4', text: '我的团队', route: 'teams'}
]

interface IMenusProps {
  active: string
}

export class Menus extends React.PureComponent <IMenusProps, {}> {

  public render () {
    const menus = defaultItems.map((item) => (
      <Menu.Item key={item.route} style={{ fontSize: '16px' }}>
        <Link to={`/account/${item.route}`}>
          <Icon type={item.icons}/>{item.text}
        </Link>
      </Menu.Item>
    ))
    return (
      <div>
        <Menu
          style={{ padding: '16px 10px' }}
          selectedKeys={[this.props.active, `${this.props.active}s`]}
        >
          {menus}
        </Menu>
      </div>
    )
  }
}

export default Menus






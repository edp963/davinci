import * as React from 'react'
import { Link } from 'react-router-dom'
import { Menu } from 'antd'
const defaultItems = [
  {icons: 'icon-user1', key: '1', text: '个人信息', route: 'profile'},
  {icons: 'icon-xiugaimima', key: '2', text: '修改密码', route: 'resetPassword'},
  {icons: 'icon-organization', key: '3', text: '我的组织', route: 'organizations'},
  // {icons: 'icon-group', key: '4', text: '我的团队', route: 'teams'}
]

interface IMenusProps {
  active: string
}

export class Menus extends React.PureComponent <IMenusProps, {}> {

  public render () {
    const menus = defaultItems.map((item) => (
      <Menu.Item key={item.route} style={{ fontSize: '16px' }}>
        <Link to={`/account/${item.route}`}>
          <i className={`iconfont ${item.icons}`}/> {item.text}
        </Link>
      </Menu.Item>
    ))
    return (
      <div>
        <Menu
          style={{ padding: '16px 16px' }}
          selectedKeys={[this.props.active, `${this.props.active}s`]}
        >
          {menus}
        </Menu>
      </div>
    )
  }
}

export default Menus






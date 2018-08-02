import * as React from 'react'

const Menu = require('antd/lib/menu')
const SubMenu = Menu.SubMenu
const MenuItem = Menu.Item
const Dropdown = require('antd/lib/dropdown')

export class LayerContextMenu extends React.PureComponent {

  public render () {
    const { children } = this.props
    const menu = (
      <Menu>
        <MenuItem key="name">{children.props.layer.name}</MenuItem>
        <MenuItem key="cut">剪切</MenuItem>
        <MenuItem key="copy">复制</MenuItem>
        <MenuItem key="paste">粘贴</MenuItem>
        <SubMenu title="层级">
          <MenuItem key="upper">上移一层</MenuItem>
        </SubMenu>
      </Menu>
    )
    return (
      <Dropdown overlay={menu} trigger={['hover']} getPopupContainer={() => document.getElementById(`layer_${children.props.layer.id}`)}>
        {children}
      </Dropdown>
    )
  }
}

export default LayerContextMenu

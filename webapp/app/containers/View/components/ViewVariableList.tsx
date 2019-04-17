import React from 'react'
import { List, Icon, Tooltip, Popconfirm } from 'antd'

import { IViewVariable } from 'containers/View/types'

import Styles from '../View.less'

interface IViewVariableProps {
  variables: IViewVariable[]
  onAdd: () => void
  onDelete: (name: string) => void
  onEdit: (variable: IViewVariable) => void
}

export class ViewVariableList extends React.Component<IViewVariableProps> {

  private editItem = (variable: IViewVariable) => () => {
    this.props.onEdit({ ...variable })
  }

  private deleteItem = (name: string) => () => {
    this.props.onDelete(name)
  }

  private renderItem = (item: IViewVariable) => {
    const icons = [
      (
        <Tooltip key="edit" title="修改">
          <Icon onClick={this.editItem(item)} type="edit" />
        </Tooltip>
      ),
      (
        <Popconfirm
          key="delete"
          title="确定删除？"
          placement="left"
          onConfirm={this.deleteItem(item.name)}
        >
          <Tooltip title="删除">
            <Icon type="delete" />
          </Tooltip>
        </Popconfirm>
      )
    ]

    return (
      <List.Item actions={icons}>
        <div className={Styles.variableItem}>
          <div>{item.name}</div>
        </div>
      </List.Item>
    )
  }

  public render () {
    const { variables, onAdd } = this.props

    return (
      <List
        className={Styles.viewVariable}
        size="small"
        header={<div className={Styles.viewVariableHeader}><h4>变量</h4><Icon type="plus" onClick={onAdd} title="添加" /></div>}
        locale={{ emptyText: '暂无变量' }}
        dataSource={variables}
        renderItem={this.renderItem}
      />
    )
  }

}

export default ViewVariableList

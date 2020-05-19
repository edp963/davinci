import React from 'react'
import { List, Icon, Tooltip, Popconfirm, Tag } from 'antd'

import { IViewVariable } from 'containers/View/types'
import { ViewVariableTypes } from '../constants'

import Styles from '../View.less'

export interface IViewVariableListProps {
  variables: IViewVariable[]
  className?: string
  onAdd?: () => void
  onDelete?: (key: string) => void
  onEdit?: (variable: IViewVariable) => void
}

export class ViewVariableList extends React.PureComponent<IViewVariableListProps> {

  private editItem = (variable: IViewVariable) => () => {
    this.props.onEdit({ ...variable })
  }

  private deleteItem = (key: string) => () => {
    this.props.onDelete(key)
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
          onConfirm={this.deleteItem(item.key)}
        >
          <Tooltip title="删除">
            <Icon type="delete" />
          </Tooltip>
        </Popconfirm>
      )
    ]
    const { name, alias, type } = item
    const text = alias ? `${name}[${alias}]` : `${name}`
    const color = type === ViewVariableTypes.Query ? 'green' : 'volcano'
    const category = type === ViewVariableTypes.Query ? 'QUERY' : 'AUTH'

    return (
      <List.Item actions={icons}>
        <Tag color={color}>{category}</Tag>
        <div className={Styles.variableItem}>{text}</div>
      </List.Item>
    )
  }

  public render () {
    const { variables, className, onAdd } = this.props

    return (
      <List
        className={className}
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

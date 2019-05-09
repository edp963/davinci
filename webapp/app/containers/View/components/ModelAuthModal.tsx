import React from 'react'
import { Modal, Button, List, Checkbox } from 'antd'
const ListItem = List.Item
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { IViewModel } from '../types'

interface IModelAuthModalProps {
  visible: boolean
  model: IViewModel
  auth: string[]
  onSave: (auth: string[]) => void
  onCancel: () => void
}

interface IModelAuthModalStates {
  localAuth: string[]
}

export class ModelAuthModal extends React.PureComponent<IModelAuthModalProps, IModelAuthModalStates> {

  public state: Readonly<IModelAuthModalStates> = {
    localAuth: []
  }

  public static getDerivedStateFromProps:
    React.GetDerivedStateFromProps<IModelAuthModalProps, IModelAuthModalStates>
  = (props) => {
    const { auth } = props
    return { localAuth: [...auth] }
  }

  private save = () => {
    this.props.onSave([...this.state.localAuth])
  }

  private modalFooter = [(
    <Button key="cancel" size="large" onClick={this.props.onCancel}>取 消</Button>
  ), (
    <Button key="save" size="large" type="primary" onClick={this.save}>保 存</Button>
  )]

  private toggleCheckAll = (e: CheckboxChangeEvent) => {
    const localAuth = e.target.checked ? Object.keys(this.props.model) : []
    this.setState({ localAuth })
  }

  private toggleCheck = (name: string) => (e: CheckboxChangeEvent) => {
    const checked = e.target.checked
    this.setState(({ localAuth }) => {
      if (checked) {
        return { localAuth: [...localAuth, name] }
      }
      return { localAuth: localAuth.filter((item) => item !== name) }
    })
  }

  private renderListHeader (props: IModelAuthModalProps) {
    const { auth, model } = props
    const indeterminate = (auth.length > 0 && auth.length !== Object.keys(model).length)
    const checkAll = (auth.length === Object.keys(model).length)

    return (
      <Checkbox
        indeterminate={indeterminate}
        onChange={this.toggleCheckAll}
        checked={checkAll}
      >
        全选
      </Checkbox>
    )
  }

  private renderItem = (name: string) => {
    const { localAuth } = this.state
    const checked = localAuth.includes(name)
    return (
      <ListItem>
        <Checkbox
          onChange={this.toggleCheck(name)}
          checked={checked}
        >
          {name}
        </Checkbox>
      </ListItem>
    )
  }

  public render () {
    const { visible, model, onCancel, onSave } = this.props
    const listDataSource = Object.keys(model)

    return (
      <Modal
        title="编辑字段可见"
        visible={visible}
        footer={this.modalFooter}
        onCancel={onCancel}
      >
        <List
          bordered
          header={this.renderListHeader(this.props)}
          dataSource={listDataSource}
          renderItem={this.renderItem}
        />
      </Modal>
    )
  }
}

export default ModelAuthModal

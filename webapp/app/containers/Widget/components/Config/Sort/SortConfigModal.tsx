import React from 'react'
import { DndProvider } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import { IFieldSortConfig } from './types'
import { FieldSortTypes } from './constants'

import { Icon, Button, Tooltip, Modal } from 'antd'
import SortItem from './SortItem'

import Styles from './Sort.less'

export interface ISortConfigModalProps {
  visible: boolean
  config: IFieldSortConfig
  list: string[]
  onCancel: () => void
  onSave: (config: IFieldSortConfig) => void
}

interface ISortConfigModalStates {
  sortedList: string[]
}

class SortConfigModal extends React.PureComponent<ISortConfigModalProps, ISortConfigModalStates> {

  public state: Readonly<ISortConfigModalStates> = {
    sortedList: []
  }

  constructor (props: ISortConfigModalProps) {
    super(props)
    const { list, config } = props
    this.state = {
      sortedList: SortConfigModal.getSortedList(list, config)
    }
  }

  public componentDidUpdate (prevProps: ISortConfigModalProps) {
    const { list, config } = this.props
    if (list !== prevProps.list || config !== prevProps.config) {
      const sortedList = SortConfigModal.getSortedList(list, config)
      this.setState({ sortedList })
    }
  }

  private save = () => {
    const { onSave } = this.props
    const { sortedList } = this.state
    const nextConfig: IFieldSortConfig = {
      sortType: FieldSortTypes.Custom,
      [FieldSortTypes.Custom]: { sortList: [...sortedList] }
    }
    onSave(nextConfig)
  }

  private modalFooter = [(
    <Button key="cancel" size="large" onClick={this.props.onCancel}>
      取 消
    </Button>
  ), (
    <Button key="submit" size="large" type="primary" onClick={this.save}>
      保 存
    </Button>
  )]

  private findIndex = (value: string) => this.state.sortedList.indexOf(value)

  private sort = (draggedValue: string, nextIdx: number) => {
    const nextSortList = [...this.state.sortedList]
    const prevIdx = this.findIndex(draggedValue)
    nextSortList.splice(nextIdx, 0, nextSortList.splice(prevIdx, 1)[0])
    this.setState({ sortedList: nextSortList })
  }

  private static getSortedList = (list: string[], config: IFieldSortConfig) => {
    if (!list) { return [] }
    const sortList = config
      ? (config[FieldSortTypes.Custom]
          ? config[FieldSortTypes.Custom].sortList
          : [])
      : []

    const sorted = [...list].sort((a, b) => {
      const indexA = sortList.indexOf(a)
      const indexB = sortList.indexOf(b)
      if (indexA < 0 && indexB < 0) {
        return 0
      }
      return indexA - indexB
    })
    return sorted
  }

  private modalTitle = (
    <>
      自定义排序
      <Tooltip title="拖拽更改列表中的条目顺序进行排序">
        <Icon className={Styles.sortInfo} type="info-circle" />
      </Tooltip>
    </>
  )

  public render () {
    const { visible, onCancel } = this.props
    const { sortedList } = this.state

    return (
      <Modal
        title={this.modalTitle}
        wrapClassName="ant-modal-small"
        footer={this.modalFooter}
        visible={visible}
        onCancel={onCancel}
        onOk={this.save}
      >
        <div className={Styles.sortList}>
          <DndProvider backend={HTML5Backend}>
            {sortedList.map((sortValue) => (<SortItem key={sortValue} value={sortValue} onFindIndex={this.findIndex} onSort={this.sort} />))}
          </DndProvider>
        </div>
      </Modal>
    )
  }
}

export default SortConfigModal

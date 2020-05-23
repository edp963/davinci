/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import React, { PureComponent, GetDerivedStateFromProps } from 'react'
import classnames from 'classnames'
import { ListFormLayout, List, ListItem } from 'app/components/ListFormLayout'
import ReferenceForm from './ReferenceForm'
import { Modal, Button, message } from 'antd'
import FormType from 'antd/lib/form/Form'
import { IDataParamSource } from '../Dropbox'
import { IReference, IReferenceLine } from './types'
import { ReferenceType } from './constants'
import { uuid } from 'app/utils/util'
import { getDefaultReferenceLineData } from './util'
import styles from './Reference.less'

interface IReferenceProps {
  references: IReference[]
  metrics: IDataParamSource[]
  visible: boolean
  onSave: (mergedReferences: IReference[]) => void
  onCancel: () => void
}

interface IReferenceStates {
  prevReferences: IReference[]
  editingReferences: IReference[]
  selected: IReference
}

class Reference extends PureComponent<IReferenceProps, IReferenceStates> {
  public state: IReferenceStates = {
    prevReferences: [],
    editingReferences: [],
    selected: null
  }

  private referenceForm: FormType
  private refHandles = {
    referenceForm: (ref) => {
      this.referenceForm = ref
    }
  }

  public static getDerivedStateFromProps: GetDerivedStateFromProps<
    IReferenceProps,
    IReferenceStates
  > = (props, state) => {
    const { references } = props
    if (references && references !== state.prevReferences) {
      let editingReferences = []
      let selected = null
      try {
        editingReferences = JSON.parse(JSON.stringify(references))
        if (editingReferences.length) {
          selected = editingReferences[0]
        }
      } catch (error) {
        message.error('参考线配置解析失败')
        throw error
      }
      return {
        prevReferences: references,
        editingReferences,
        selected
      }
    }
    return null
  }

  private getDefaultReference = (): IReferenceLine => {
    return {
      key: uuid(8, 16),
      name: '新建参考线',
      type: ReferenceType.Line,
      ...getDefaultReferenceLineData()
    }
  }

  private addReference = () => {
    const { selected } = this.state
    const reference = this.getDefaultReference()
    if (selected) {
      this.getFormValues((mergedReferences) => {
        this.setState({
          editingReferences: [...mergedReferences, reference],
          selected: reference
        })
      })
    } else {
      this.setState({
        editingReferences: [reference],
        selected: reference
      })
    }
  }

  private selectReference = (key: string) => {
    this.getFormValues((mergedReferences) => {
      this.setState({
        editingReferences: mergedReferences,
        selected: mergedReferences.find((ref) => ref.key === key)
      })
    })
  }

  private changeReferenceName = (key: string, name: string) => {
    this.setState({
      editingReferences: this.state.editingReferences.map((ref) => {
        if (ref.key === key) {
          ref.name = name
        }
        return ref
      })
    })
  }

  private deleteReference = (key: string) => {
    const { editingReferences, selected } = this.state

    let reselected: IReference = null
    if (editingReferences.length > 1) {
      if (key === selected.key) {
        const delIndex = editingReferences.findIndex((ref) => ref.key === key)
        reselected =
          delIndex === editingReferences.length - 1
            ? editingReferences[delIndex - 1]
            : editingReferences[delIndex + 1]
      } else {
        reselected = selected
      }
    }

    this.setState({
      editingReferences: editingReferences.filter((ref) => ref.key !== key),
      selected: reselected
    })
  }

  private getFormValues = (
    resolve: (mergedReferences: IReference[]) => void
  ) => {
    this.referenceForm.props.form.validateFieldsAndScroll((err, values) => {
      if (err) {
        return
      }
      const { editingReferences, selected } = this.state
      const mergedReferences = editingReferences.map((ref) =>
        ref.key === selected.key
          ? {
              ...selected,
              ...values
            }
          : ref
      )
      resolve(mergedReferences)
    })
  }

  private save = () => {
    const { onSave } = this.props
    const { editingReferences } = this.state
    if (editingReferences.length) {
      this.getFormValues((mergedReferences) => {
        onSave(mergedReferences)
      })
    } else {
      onSave([])
    }
  }

  private reset = () => {
    this.setState({
      prevReferences: [],
      editingReferences: [],
      selected: null
    })
  }

  public render() {
    const { visible, metrics, onCancel } = this.props
    const { editingReferences, selected } = this.state

    const listItems = editingReferences.map(({ key, name }) => {
      const listItemClass = classnames({
        [styles.listItem]: true,
        [styles.selected]: selected.key === key
      })
      return (
        <ListItem
          key={key}
          id={key}
          name={name}
          className={listItemClass}
          onClick={this.selectReference}
          onChange={this.changeReferenceName}
          onDelete={this.deleteReference}
        />
      )
    })

    return (
      <Modal
        wrapClassName="ant-modal-large ant-modal-center"
        title="参考线配置"
        visible={visible}
        maskClosable={false}
        onOk={this.save}
        okText="保存"
        okButtonProps={{size: 'large'}}
        onCancel={onCancel}
        cancelButtonProps={{size: 'large'}}
        afterClose={this.reset}
      >
        <ListFormLayout
          type="horizontal"
          initialSize={200}
          minSize={200}
          maxSize={480}
          className={styles.configPanel}
        >
          <List
            title="参考线列表"
            className={styles.list}
            onAddItem={this.addReference}
          >
            {listItems}
          </List>
          {selected && (
            <ReferenceForm
              reference={selected}
              metrics={metrics}
              wrappedComponentRef={this.refHandles.referenceForm}
            />
          )}
        </ListFormLayout>
      </Modal>
    )
  }
}

export default Reference

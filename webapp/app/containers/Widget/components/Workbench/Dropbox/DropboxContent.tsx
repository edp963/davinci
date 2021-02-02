import React from 'react'
import { DropboxType, IDataParamSource } from './'
import ColorPanel from '../ColorPanel'
import { Icon } from 'antd'
const styles = require('../Workbench.less')

interface IDropboxContentProps {
  title: string
  type: DropboxType
}

export class DropboxContent extends React.PureComponent<IDropboxContentProps, {}> {
  public render () {
    const { title, type } = this.props

    let typeInPlaceholder

    switch (type) {
      case 'category':
        typeInPlaceholder = '分类型'
        break
      case 'value':
        typeInPlaceholder = '数值型'
        break
      default:
        typeInPlaceholder = '任意'
        break
    }

    return (
      <p className={styles.dropboxContent}>
        <Icon type="arrow-right" />
        <span>
          拖拽<b>{typeInPlaceholder}</b>字段{title}
        </span>
      </p>
    )
  }
}

export default DropboxContent

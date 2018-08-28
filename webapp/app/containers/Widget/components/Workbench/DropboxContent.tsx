import * as React from 'react'
import { DropboxType, IDataParamSource } from './Dropbox'
import ColorPanel from './ColorPanel'
const Icon = require('antd/lib/icon')
const Popover =  require('antd/lib/popover')

const styles = require('./Workbench.less')

interface IDropboxContentProps {
  title: string
  role: string
  type: DropboxType
  value?: object
  panelList?: IDataParamSource[]
  onClick: () => void
  onColorValueChange?: (key: string, value: string) => void
}

export class DropboxContent extends React.PureComponent<IDropboxContentProps, {}> {
  public render () {
    const { title, role, type, value, panelList, onClick, onColorValueChange } = this.props

    let typeInPlaceholder
    let content

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

    if (role.includes('color')) {
      content = (
        <Popover
          content={<ColorPanel list={panelList} value={value} onValueChange={onColorValueChange} />}
          trigger="click"
          placement="right"
        >
          <p className={styles.dropboxContent} onClick={onClick}>
            <Icon type="arrow-right" />
            <span>
              拖拽<b>{typeInPlaceholder}</b>字段或<b>点击</b>进行设置
            </span>
          </p>
        </Popover>
      )
    } else {
      content = (
        <p className={styles.dropboxContent} onClick={onClick}>
          <Icon type="arrow-right" />
          <span>
            拖拽<b>{typeInPlaceholder}</b>字段{title}
          </span>
        </p>
      )
    }

    return (
      content
    )
  }
}

export default DropboxContent

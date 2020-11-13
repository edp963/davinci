import React from 'react'
import { Button, Icon, Input } from 'antd'
const TextArea = Input.TextArea
const styles = require('../Organization.less')


interface INotUsersProps {
  category: string
  notUsers: string[]
  hideHandler: () => void
}
export class NotUsersList extends React.PureComponent<INotUsersProps, {}> {

  public render() {
    const { category, notUsers, hideHandler } = this.props
    const modalButton = (
      <Button
        key="submit"
        type="primary"
        onClick={hideHandler}
      >
        确定
      </Button>
    )
    const notUsersText = notUsers.join(',\n')
    return (
      <div className={styles.notUsersWrapper}>
        <div className={styles.titleWrapper}>
          <div className={styles.icon}>
            <Icon type="user" />
          </div>
          <div className={styles.title}>
            {category}不存在的名单
          </div>
        </div>
        <div className={styles.body}>
          <TextArea
            autoSize={{ minRows: 3, maxRows: 5 }}
            value={notUsersText}
          />
        </div>
        <div className={styles.footer}>
          {modalButton}
        </div>
      </div>
    )
  }
}

export default NotUsersList

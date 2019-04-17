import React from 'react'

import { Table } from 'antd'
import Styles from '../View.less'

export class SqlPreview extends React.Component {


  public render () {
    return (
      <Table className={Styles.SqlPreview} />
    )
  }

}

export default SqlPreview

import * as React from 'react'
const Button = require('antd/lib/button')
const Col = require('antd/lib/col')
const Input = require('antd/lib/input')
const InputGroup = Input.Group
const styles = require('../Team.less')
const Icon = require('antd/lib/icon')


interface IAddFormProps {
  type: string
  ref: (f: any) => void
}


export class AddForm extends React.PureComponent<IAddFormProps, {}> {
  constructor (props) {
    super(props)
    this.state = {

    }
  }
  public render () {
    const {type} = this.props
    console.log(type)

    return (
      <div className={styles.addFormWrapper}>
        <div className={styles.titleWrapper}>
          <div className={styles.icon}>
            <Icon type="user"/>
          </div>
          <div className={styles.title}>
            {type}
          </div>
          <div className={styles.tips}>
            {type}
          </div>
        </div>
        <div className={styles.search}>
          <InputGroup size="large" compact>
              <Input defaultValue="0571" style={{width: '65%'}}/>
              <Button type="primary" size="large">
                Go forward<Icon type="plus" />
              </Button>
          </InputGroup>
        </div>
      </div>
    )
  }
}

export default AddForm

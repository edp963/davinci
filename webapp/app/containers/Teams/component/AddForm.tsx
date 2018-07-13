import * as React from 'react'
import * as classnames from 'classnames'
const Button = require('antd/lib/button')
const Col = require('antd/lib/col')
const Form = require('antd/lib/form')
const FormItem = Form.Item
const Input = require('antd/lib/input')
const Select = require('antd/lib/select')
const Option = Select.Option
const InputGroup = Input.Group
const styles = require('../Team.less')
const Icon = require('antd/lib/icon')
const utilStyles =  require('../../../assets/less/util.less')


interface IAddFormProps {
  ref: (f: any) => void
  form: any
  category: string
  organizationOrTeam: { name?: string }
  currentOrganizationProjects?: any
  handleSearchMember?: () => any
  inviteMemberList?: any
  addHandler: () => any
}

interface IAddFormStates {
  visible: boolean
}

export class AddForm extends React.PureComponent<IAddFormProps, IAddFormStates> {
  constructor (props) {
    super(props)
    this.state = {
      visible: false
    }
  }

  private tips = (type: string) => {
    switch (type) {
      case 'teamMember':
        return '添加一个组织成员到当前团队'
      case 'project':
        return '只能添加您具有管理员权限的项目'
      case 'member':
        return '邀请一个成员加入当前组织'
      case 'team':
        return '邀请一个团队到当前团队下级'
      default:
        return ''
    }
  }

  private submitText = (type: string) => {
    switch (type) {
      case 'project':
        return '添加项目'
      case 'member':
        return '邀请成员'
      case 'team':
        return '添加团队'
      default:
        return ''
    }
  }

  private selectOption = (target) => () => {
    const { name, id, username } = target
    this.setState({
      visible: false
    }, () => {
      this.props.form.setFieldsValue({
        'searchValue': name ? name : username,
        'projectId': id
      })
    })
  }

  private inputChange = () => {
    const {category} = this.props
    if (category === 'member') {
      this.props.handleSearchMember()
    }
  }

  private bootstrapOptionsLi = (data) => {
    return (
      <ul className={styles.searchItems}>
        {
          data ? data.map((o) => (
            <li key={o.id} className={styles.searchLi} onClick={this.selectOption(o)}>
              <span className={styles.main}>
                <img className={styles.avatar} src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1531136772764&di=00b0fb008e0b547a3668f1045beea070&imgtype=0&src=http%3A%2F%2Fimg3.duitang.com%2Fuploads%2Fitem%2F201505%2F25%2F20150525110536_i4XhB.thumb.700_0.jpeg" alt=""/>
                <span className={styles.mainText}>
                  {o.name ? o.name : o.username}
                </span>
              </span>
              <Icon type="plus" className={styles.iconPlus}/>
            </li>
          )) : ''
        }
        {
          this.props.category === 'team' ?
            <li key="createNew" className={styles.searchLi} onClick={this.props.addHandler}>
              <span className={styles.create}>
                创建
              </span>
              <Icon type="plus" className={styles.iconPlus}/>
            </li> : ''
        }
      </ul>
    )
  }

  public render () {
    const {
      category,
      inviteMemberList,
      organizationOrTeam,
      currentOrganizationProjects
    } = this.props
    let optionList = void 0
    if (category === 'project') {
      optionList = this.bootstrapOptionsLi(currentOrganizationProjects)
    } else if (category === 'team') {
      optionList = this.bootstrapOptionsLi()
    } else if (category === 'member') {
      optionList = this.bootstrapOptionsLi(inviteMemberList)
    }
    const orgOrTeamName = organizationOrTeam ? organizationOrTeam.name : ''
    const {getFieldDecorator} = this.props.form
    return (
      <div className={styles.addFormWrapper}>
        <div className={styles.titleWrapper}>
          <div className={styles.icon}>
            <Icon type="user"/>
          </div>
          <div className={styles.title}>
            添加{category}到<span className={styles.orgName}>{orgOrTeamName}</span>
          </div>
          <div className={styles.tips}>
            {this.tips(category)}
          </div>
        </div>
        <div className={styles.search}>
          <Form>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('projectId', {
              })(
                <Input />
              )}
            </FormItem>
            <FormItem>
              <InputGroup size="large" compact>
                {getFieldDecorator('searchValue', {
                  initialValue: '',
                  onChange: this.inputChange
                })(
                  <Input style={{width: '65%'}}/>
                )}
                <Button type="primary" size="large" onClick={this.props.addHandler}>
                  {this.submitText(category)}<Icon type="plus"/>
                </Button>
                {optionList}
              </InputGroup>
            </FormItem>
          </Form>
        </div>
      </div>
    )
  }
}

export default Form.create()(AddForm)




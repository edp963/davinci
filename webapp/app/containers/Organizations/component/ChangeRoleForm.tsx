import * as React from 'react'
const Form = require('antd/lib/form')
const FormItem = Form.Item
const Input = require('antd/lib/input')
const Radio = require('antd/lib/radio/radio')
const Button = require('antd/lib/button')
const RadioGroup = Radio.Group
const styles = require('../Organization.less')
const utilStyles = require('../../../assets/less/util.less')

interface IChangeRoleProps {
  form: any
  memberId: number
  memberName: string
  category: string
  modalLoading: boolean
  organizationOrTeam: { name?: string }
  submitLoading: boolean
  changeHandler: () => any
}
export class ChangeRoleForm extends React.PureComponent<IChangeRoleProps, {}> {
  private tips = (type: string) => {
    switch (type) {
      case 'orgMember':
        return '选择一个新角色'
      case 'teamMember':
        return ''
    }
  }

  private selectOptions = (type: string) => {
    switch (type) {
      case 'orgMember':
        return (
          <RadioGroup>
            <div className={styles.radioWrapper}>
              <Radio key={`radio${1}`} value={1} className={styles.radio}/>
              <div className={styles.labelWrapper}>
                <div className={styles.label}>Owner</div>
                <div className={styles.labelDesc}>可以添加和删除团队成员并创建子团队</div>
              </div>
            </div>
            <div className={styles.radioWrapper}>
              <Radio key={`radio${2}`} value={0} className={styles.radio}/>
              <div className={styles.labelWrapper}>
                <div className={styles.label}>Member</div>
                <div className={styles.labelDesc}>没有团队的管理权限</div>
              </div>
            </div>
          </RadioGroup>
        )
      case 'teamMember':
        return (
          <RadioGroup>
            <div className={styles.radioWrapper}>
              <Radio key={`radio${1}`} value={1} className={styles.radio}/>
              <div className={styles.labelWrapper}>
                <div className={styles.label}>Maintainer</div>
                <div className={styles.labelDesc}>拥有对整个组织的完全管理访问权限</div>
              </div>
            </div>
            <div className={styles.radioWrapper}>
              <Radio key={`radio${2}`} value={0} className={styles.radio}/>
              <div className={styles.labelWrapper}>
                <div className={styles.label}>Member</div>
                <div className={styles.labelDesc}>可以看到组织中的每个成员和非秘密团队，并可以创建新的项目</div>
              </div>
            </div>
          </RadioGroup>
        )
      default:
        return ''
    }
  }

  public render () {
    const { category, organizationOrTeam, memberName, modalLoading } = this.props
    const orgOrTeamName = organizationOrTeam ? organizationOrTeam.name : ''
    const { getFieldDecorator } = this.props.form
    const modalButtons = [(
      <Button
        key="submit"
        size="large"
        type="primary"
        loading={modalLoading}
        disabled={modalLoading}
        onClick={this.props.changeHandler}
      >
        保 存
      </Button>
    )]
    return (
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <div className={styles.title}>
            改变{memberName}在<span className={styles.orgName}>{orgOrTeamName}</span>的角色
          </div>
          <div className={styles.desc}>
            <b>{this.tips(category)}</b>
          </div>
        </div>
        <div className={styles.body}>
          <Form style={{marginTop: '12px'}}>
            <FormItem className={utilStyles.hide}>
              {getFieldDecorator('id', {
              })(
                <Input />
              )}
            </FormItem>
            <FormItem
            >
              {getFieldDecorator('role', {
              })(
                this.selectOptions(category)
              )}
            </FormItem>
          </Form>
        </div>
        <div className={styles.footer}>
          {modalButtons}
        </div>
      </div>
    )
  }
}

export default Form.create()(ChangeRoleForm)

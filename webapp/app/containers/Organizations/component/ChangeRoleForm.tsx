import React from 'react'
import { Form, Input, Radio, Button } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import { IOrganizationMember } from '../types'
const FormItem = Form.Item
const RadioGroup = Radio.Group
const styles = require('../Organization.less')
const utilStyles = require('assets/less/util.less')


interface IChangeRoleProps {
  category: string
  member: IOrganizationMember
  organizationOrTeam: { name?: string }
  submitLoading: boolean
  changeHandler: () => any
}
export class ChangeRoleForm extends React.PureComponent<IChangeRoleProps & FormComponentProps, {}> {
  private tips = (type: string) => {
    switch (type) {
      case 'orgMember':
        return '选择一个新成员类型'
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
              <Radio key={`radio${1}`} value={1} />
              <div className={styles.labelWrapper}>
                <div className={styles.label}>拥有者</div>
                <div className={styles.labelDesc}>组织的管理者，可以添加和删除组织成员并创建团队</div>
              </div>
            </div>
            <div className={styles.radioWrapper}>
              <Radio key={`radio${2}`} value={0} />
              <div className={styles.labelWrapper}>
                <div className={styles.label}>成员</div>
                <div className={styles.labelDesc}>组织内的普通成员，进入团队后，由团队的 Maintainer 分配项目模块权限</div>
              </div>
            </div>
          </RadioGroup>
        )
      case 'teamMember':
        return (
          <RadioGroup>
            <div className={styles.radioWrapper}>
              <Radio key={`radio${1}`} value={1} />
              <div className={styles.labelWrapper}>
                <div className={styles.label}>Maintainer</div>
                <div className={styles.labelDesc}>团队的管理者，可以指定该团队在项目中的模块权限</div>
              </div>
            </div>
            <div className={styles.radioWrapper}>
              <Radio key={`radio${2}`} value={0} />
              <div className={styles.labelWrapper}>
                <div className={styles.label}>Member</div>
                <div className={styles.labelDesc}>组织内的普通成员，进入团队后，由团队的 Maintainer 分配项目模块权限</div>
              </div>
            </div>
          </RadioGroup>
        )
      default:
        return ''
    }
  }

  public render () {
    const { category, organizationOrTeam, member, submitLoading } = this.props
    const orgOrTeamName = organizationOrTeam ? organizationOrTeam.name : ''
    const { getFieldDecorator } = this.props.form
    const modalButtons = [(
      <Button
        key="submit"
        type="primary"
        loading={submitLoading}
        disabled={submitLoading}
        onClick={this.props.changeHandler}
      >
        保 存
      </Button>
    )]
    return (
      <div className={styles.formWrapper}>
        <div className={styles.header}>
          <div className={styles.title}>
            改变 {member.user.username} 在 <span className={styles.orgName}>{orgOrTeamName}</span> 的成员类型
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

export default Form.create<IChangeRoleProps & FormComponentProps>()(ChangeRoleForm)

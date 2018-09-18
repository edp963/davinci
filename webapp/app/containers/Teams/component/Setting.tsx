import * as React from 'react'
const styles = require('../Team.less')
const Button = require('antd/lib/Button')
const Input = require('antd/lib/input')
const Select = require('antd/lib/select')
const Option = Select.Option
const Form = require('antd/lib/form')
const Radio = require('antd/lib/radio/radio')
const RadioGroup = Radio.Group
const FormItem = Form.Item
const Row = require('antd/lib/row')
const Tag = require('antd/lib/tag')
import Avatar from '../../../components/Avatar'
const utilStyles = require('../../../assets/less/util.less')
const Col = require('antd/lib/col')
import UploadAvatar from '../../../components/UploadAvatar'
import {ITeam} from '../Team'

interface ISettingProps {
  form: any
  currentTeam: any
  teams: ITeam[]
  editTeam: (team: ITeam) => () => any
  deleteTeam: (id: number) => () => any
}

export class Setting extends React.PureComponent <ISettingProps> {
  public componentDidMount () {
    const { currentTeam } = this.props
    this.setFieldData(currentTeam)
  }

  private parentTeamChange = (val) =>
    new Promise((resolve) => {
      this.forceUpdate(() => resolve())
    })

  private setFieldData = (currentTeam) => {
    const { id, name, description, parentTeamId, visibility } = currentTeam
    console.log({currentTeam})
    this.parentTeamChange(`${parentTeamId}`).then(() => {
      this.props.form.setFieldsValue({id, name, description, parentTeamId: `${parentTeamId}`, visibility})
    })
  }

  public componentWillReceiveProps (nextProps) {
    const {id} = this.props.currentTeam
    const nextId = nextProps.currentTeam.id
    if (id !== nextId) {
      this.setFieldData(nextProps.currentTeam)
    }
  }

  private filterTeamsByOrg = (teams) => {
    if (teams) {
      const { id } = this.props.currentTeam
      const teamObj = teams.find((team) => {
        return team.id === Number(id)
      })
      const orgId = teamObj.organization.id
      const result =  teams.filter((team) => {
        if (team.organization.id === orgId) {
          return team
        }
      })
      return result
    }
  }

  public render () {
    const { getFieldDecorator } = this.props.form
    const { name, id, avatar, description, parentTeamId } = this.props.currentTeam
    const { teams } = this.props

    const commonFormItemStyle = {
      labelCol: { span: 2 },
      wrapperCol: { span: 18 }
    }
    const filterTeams = this.filterTeamsByOrg(teams)
    const teamsOptions = filterTeams ? filterTeams.map((o) => (
      <Option key={o.id} value={`${o.id}`} className={styles.selectOption}>
        <div className={styles.title}>
          <span className={styles.owner}>{o.name}</span>
        </div>
        {`${o.id}` !== this.props.form.getFieldValue('parentTeamId')
          ? (<Avatar size="small" path={o.avatar}/>)
          : ''}
      </Option>
    )) : ''

    const currentValues = this.props.form.getFieldsValue()
    let isDisabled = true
    if (currentValues.name !== name
      || currentValues.description !== description
      || currentValues.parentTeamId !== parentTeamId
    ) {
        isDisabled = false
    }

    return (
      <div className={styles.listWrapper}>
        <div className={styles.container}>
          <UploadAvatar type="team" path={avatar} xhrParams={{id}} />
          <hr/>
          <div className={styles.form}>
            <Form>
              <Row>
                <Col>
                  <FormItem className={utilStyles.hide}>
                    {getFieldDecorator('id', {})(
                      <Input />
                    )}
                  </FormItem>
                  <FormItem
                    {...commonFormItemStyle}
                    hasFeedback
                    label="名称"
                  >
                    {getFieldDecorator('name', {
                      initialValue: '',
                      rules: [{ required: true }, {}]
                    })(
                      <Input size="large" placeholder="Name"/>
                    )}
                  </FormItem>
                </Col>
                <Col>
                  <FormItem
                    {...commonFormItemStyle}
                    hasFeedback
                    label="描述"
                  >
                    {getFieldDecorator('description', {
                    })(
                      <Input placeholder="description" />
                    )}
                  </FormItem>
                </Col>
                <Col>
                  <FormItem label="上级" {...commonFormItemStyle}>
                    {getFieldDecorator('parentTeamId', {
                      })(
                      <Select
                        disabled
                        onChange={this.parentTeamChange}
                        placeholder="Please select a team"
                      >
                        {teamsOptions}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row className={styles.permissionZone}>
                {/*<Col>*/}
                  {/*<FormItem label="" {...commonFormItemStyle}>*/}
                    {/*{getFieldDecorator('visibility', {*/}
                      {/*initialValue: ''*/}
                    {/*})(*/}
                      {/*<RadioGroup>*/}
                        {/*<Radio value={false} className={styles.radioStyle}>私密（只对该团队成员可见）</Radio>*/}
                        {/*<Radio value={true} className={styles.radioStyle}>公开 <Tag>推荐</Tag>（对该组织内所有成员可见）</Radio>*/}
                      {/*</RadioGroup>*/}
                    {/*)}*/}
                  {/*</FormItem>*/}
                {/*</Col>*/}
                <Col>
                  <Button
                    size="large"
                    onClick={this.props.editTeam(this.props.form.getFieldsValue())}
                    disabled={isDisabled}
                  >
                    保存修改
                  </Button>
                </Col>
              </Row>
              <Row className={styles.dangerZone}>
                <div className={styles.title}>
                  删除团队
                </div>
                <div className={styles.titleDesc}>
                  <p className={styles.desc}>删除后无法恢复，请确定此次操作</p>
                  <p className={styles.button}>
                    <Button size="large" type="danger" onClick={this.props.deleteTeam(this.props.form.getFieldsValue().id)}>删除{name}</Button>
                  </p>
                </div>
              </Row>
            </Form>
          </div>
        </div>
      </div>
    )
  }
}

export default Form.create()(Setting)




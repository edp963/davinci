import * as React from 'react'
const styles = require('../Organization.less')
const Button = require('antd/lib/Button')
const Input = require('antd/lib/input')
const Form = require('antd/lib/form')
const FormItem = Form.Item
const Row = require('antd/lib/row')
const Col = require('antd/lib/col')
const Radio = require('antd/lib/radio')
const RadioButton = Radio.Button
import UploadAvatar from '../../../components/UploadAvatar'
import {IOrganization} from '../Organization'
const utilStyles = require('../../../assets/less/util.less')

interface ISettingProps {
  form: any
  currentOrganization: IOrganization
  editOrganization: (oranization: IOrganization) => () => any
  deleteOrganization: (id: number) => () => any
}

export class Setting extends React.PureComponent <ISettingProps> {
  public componentWillMount () {
    this.initData()
  }
  private initData = () => {
    const { currentOrganization } = this.props
    const {
      id,
      name,
      description,
      allowCreateProject,
      allowDeleteOrTransferProject,
      allowChangeVisibility,
      memberPermission
    } = currentOrganization
    this.forceUpdate(() => {
      this.props.form.setFieldsValue({
        id,
        name,
        description,
        allowCreateProject,
        allowDeleteOrTransferProject,
        allowChangeVisibility,
        memberPermission
      })
    })
  }
  public render () {
    const { getFieldDecorator } = this.props.form
    const commonFormItemStyle = {
      labelCol: { span: 2 },
      wrapperCol: { span: 18 }
    }
    const {name, avatar, id} = this.props.currentOrganization
    return (
      <div className={styles.listWrapper}>
        <div className={styles.container}>
          <UploadAvatar type="organization" path={avatar} xhrParams={{id}} />
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
                    label="名称"
                  >
                    {getFieldDecorator('name', {
                      initialValue: '',
                      rules: [{ required: true }, {
                       // validator: this.checkNameUnique
                      }]
                    })(
                      <Input size="large" placeholder="Name"/>
                    )}
                  </FormItem>
                </Col>
                <Col>
                  <FormItem
                    {...commonFormItemStyle}
                    label="描述"
                  >
                    {getFieldDecorator('description', {
                    })(
                      <Input placeholder="description" />
                    )}
                  </FormItem>
                </Col>
              </Row>
              <Row className={styles.permissionZone}>
                <Col>
                  <FormItem
                    label="组织成员创建项目"
                  >
                    {getFieldDecorator('allowCreateProject', {
                      initialValue: true
                    })(
                      <Radio.Group size="small">
                        <RadioButton value={false}>禁止</RadioButton>
                        <RadioButton value={true}>允许</RadioButton>
                      </Radio.Group>
                    )}
                  </FormItem>
                </Col>
                {/*<Col>*/}
                  {/*<FormItem*/}
                    {/*label="删除和移交项目"*/}
                 {/*//   {...commonFormItemStyle}*/}
                  {/*>*/}
                    {/*{getFieldDecorator('allowDeleteOrTransferProject', {*/}
                      {/*initialValue: true*/}
                    {/*})(*/}
                      {/*<Radio.Group size="small">*/}
                        {/*<RadioButton value={false}>禁止</RadioButton>*/}
                        {/*<RadioButton value={true}>允许</RadioButton>*/}
                      {/*</Radio.Group>*/}
                    {/*)}*/}
                  {/*</FormItem>*/}
                {/*</Col>*/}
                {/*<Col>*/}
                  {/*<FormItem*/}
                 {/*//   {...commonFormItemStyle}*/}
                    {/*label="修改项目是否可见"*/}
                  {/*>*/}
                    {/*{getFieldDecorator('allowChangeVisibility', {*/}
                      {/*initialValue: true*/}
                    {/*})(*/}
                      {/*<Radio.Group size="small">*/}
                        {/*<RadioButton value={false}>禁止</RadioButton>*/}
                        {/*<RadioButton value={true}>允许</RadioButton>*/}
                      {/*</Radio.Group>*/}
                    {/*)}*/}
                  {/*</FormItem>*/}
                {/*</Col>*/}
                <Col>
                  <FormItem
                 //   {...commonFormItemStyle}
                    label="组织成员默认权限"
                  >
                    {getFieldDecorator('memberPermission', {
                      initialValue: 1
                    })(
                      <Radio.Group size="small">
                        <RadioButton value={0}>隐藏</RadioButton>
                        <RadioButton value={1}>预览</RadioButton>
                        {/* <RadioButton value={2}>修改</RadioButton>
                        <RadioButton value={3}>删除</RadioButton> */}
                      </Radio.Group>
                    )}
                  </FormItem>
                </Col>
                <Col>
                  <Button size="large" onClick={this.props.editOrganization(this.props.form.getFieldsValue())}>保存修改</Button>
                </Col>
              </Row>
              <Row className={styles.dangerZone}>
                <div className={styles.title}>
                   删除组织
                </div>
                <div className={styles.titleDesc}>
                  <p className={styles.desc}>删除后无法恢复，请确定此次操作</p>
                  <p className={styles.button}>
                    <Button size="large" type="danger" onClick={this.props.deleteOrganization(this.props.form.getFieldsValue().id)}>删除{name}</Button>
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




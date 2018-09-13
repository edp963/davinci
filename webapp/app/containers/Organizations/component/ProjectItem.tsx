import * as React from 'react'
import * as Organization from '../Organization'
const Modal = require('antd/lib/modal')
const Button = require('antd/lib/button')
const styles = require('../Organization.less')
const Tag = require('antd/lib/tag')
const Icon = require('antd/lib/icon')
const Popconfirm = require('antd/lib/popconfirm')
const Tooltip = require('antd/lib/tooltip')
import AntdFormType from 'antd/lib/form/Form'
import ComponentPermission from '../../Account/components/checkMemberPermission'
import Star from '../../../components/StarPanel/Star'
import {IProject, IStarUser} from '../../Projects'
import ProjectsForm from '../../Projects/ProjectForm'

interface IProjectItemProps {
  key: number
  options: Organization.IOrganizationProjects,
  toProject: (id: number) => any
  loginUser: any
  deleteProject: (id: number) => any
  starUser: IStarUser[]
  currentOrganization: Organization.IOrganization
  unStar?: (id: number) => any
  userList?: (id: number) => any
  onEditProject: (project: any, resolve: () => any) => any
  onLoadOrganizationProjects: (param: {id: number, pageNum?: number, pageSize?: number}) => any
  // onCheckUniqueName: (pathname: any, data: any, resolve: () => any, reject: (error: string) => any) => any
}

interface IProjectItemState {
  formType: string
  formVisible: boolean
  modalLoading: boolean
}

interface IProjectOptions {
  id: number
  name: string
  description: string
  createBy: number
  pic: string
  isLike: boolean
}

export class ProjectItem extends React.PureComponent<IProjectItemProps, IProjectItemState> {
  constructor (props) {
    super(props)
    this.state = {
      formType: '',
      formVisible: false,
      modalLoading: false
    }
  }

  private ProjectForm: AntdFormType = null
  private refHandlers = {
    ProjectForm: (ref) => this.ProjectForm = ref
  }

  private stopPPG = (e) => {
    e.stopPropagation()
  }

  private showProjectForm = (formType, option) => (e) => {
    this.stopPPG(e)
    this.setState({
      formType,
      formVisible: true
    }, () => {
      const {orgId, id, name, pic, description, visibility} = option
      this.ProjectForm.props.form.setFieldsValue({
        orgId: `${orgId}`,
        id,
        name,
        pic,
        description,
        visibility: `${visibility ? '1' : '0'}`
      })
    })
  }

  private onModalOk = () => {
    this.ProjectForm.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { currentOrganization } = this.props
        this.setState({
          modalLoading: true
        })
        this.props.onEditProject({
          ...values,
          ...{visibility: !!Number(values.visibility)},
          ...{orgId: Number(values.orgId)}
        }, () => {
          this.props.onLoadOrganizationProjects({id: currentOrganization.id})
          this.hideProjectForm()
        })
      }
    })
  }

  private hideProjectForm = () => {
    this.setState({
      formVisible: false,
      modalLoading: false
    }, () => {
      this.ProjectForm.props.form.resetFields()
    })
  }

  public render () {
    const {options, loginUser, currentOrganization, starUser} = this.props
    const { formVisible, formType, modalLoading } = this.state

    const tags = (<div className={styles.tag}>{options.createBy === loginUser.id ? <Tag size="small" key="small">我创建的</Tag> : ''}</div>)
    let CreateButton = void 0
    if (currentOrganization) {
      CreateButton = ComponentPermission(currentOrganization, '')(Icon)
    }
   // const bg = require(`../../assets/images/bg${options.pic}.png`)
    let StarPanel = void 0
    if (options) {
      StarPanel = <Star d={options} starUser={starUser} unStar={this.props.unStar} userList={this.props.userList}/>
    }
    return (
      <div className={styles.projectItemWrap} onClick={this.props.toProject(options.id)}>
        <div
          className={styles.avatarWrapper}
          style={{backgroundImage: `url(${require(`../../../assets/images/bg${options.pic || 9}.png`)})`}}
        />
        <div className={styles.detailWrapper}>
          <div className={styles.titleWrapper}>
            <div className={styles.title}>{options.name}</div>
          </div>
          <div className={styles.desc}>{options.description}</div>
          {tags}
          <div className={styles.others}>
            {StarPanel}
            <div className={styles.delete}>
            <Tooltip title="修改">
              <CreateButton type="setting" onClick={this.showProjectForm('edit', options)} />
            </Tooltip>
            </div>
            <div className={styles.delete}>
              <Popconfirm
                title="确定删除？"
                placement="bottom"
                onConfirm={this.props.deleteProject(options.id)}
              >
                <Tooltip title="删除">
                  <CreateButton
                    type="delete"
                    onClick={this.stopPPG}
                  />
                </Tooltip>
              </Popconfirm>
            </div>
            <Modal
              title={null}
              footer={null}
              visible={formVisible}
              onCancel={this.hideProjectForm}
            >
              <ProjectsForm
                type={formType}
                wrappedComponentRef={this.refHandlers.ProjectForm}
                modalLoading={modalLoading}
                onModalOk={this.onModalOk}
                // onCheckUniqueName={this.props.onCheckUniqueName}
              />
            </Modal>
          </div>
        </div>
      </div>
    )
  }
}

export default ProjectItem




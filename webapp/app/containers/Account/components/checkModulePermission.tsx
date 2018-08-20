import * as React from 'react'
import {
  CREATE_ORGANIZATION_PROJECT
} from '../../App/constants'
import {IOrganization} from '../../Organizations/Organization'
import {IProject} from '../../Projects'

interface IModulePermissionProps {
  size?: string
  type?: string
  icon?: string
  onClick?: any
  className?: string
  permission?: IOrganization
}

interface IModulePermissionStates {
  disabled: boolean
  visibility: boolean
}

export default (project?: IProject, route?: string, isDelete?: string) => (WrapperComponent) => {
  class ModulePermission extends React.PureComponent<IModulePermissionProps, {}> {
    constructor (props) {
      super(props)
      this.state = {
        disabled: false,
        visibility: false
      }
    }
    private getPermissionByCurrentProject = () => {
      let permission = ''
      if (project) {
        for (const attr in project) {
          if (`${route}Permission` === attr) {
            permission = project [attr]
            break
          }
        }
      }
      return permission
    }
    public render () {
      const defaultComponent = <div {...this.props}/>
      return project
        ? <WrapperComponent {...this.props}>{this.props.children}</WrapperComponent>
        : defaultComponent
    }
  }
  return ModulePermission
}





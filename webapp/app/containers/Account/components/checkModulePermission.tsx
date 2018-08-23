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
  shape?: string
}

export default (project?: IProject, route?: string, isDelete?: boolean) => (WrapperComponent) => {
  class ModulePermission extends React.PureComponent<IModulePermissionProps, {}> {
    private getPermissionByCurrentProject = () => {
      let permission = ''
      if (project) {
        const projectPermission = project.permission
        for (const attr in projectPermission) {
          if (`${route}Permission` === attr) {
            permission = projectPermission [attr]
            break
          }
        }
      }
      return permission
    }

    private computePermission = () => {
      const permission = this.getPermissionByCurrentProject()
      const defaultComponent = <span/>
      if (!project) {
        return defaultComponent
      }
      if (permission) {
        switch (Number(permission)) {
          case 0:
            return defaultComponent
          case 1:
            return defaultComponent
           // return <WrapperComponent disabled  {...this.props}>{this.props.children}</WrapperComponent>
          case 2:
            if (isDelete) {
              return defaultComponent
            } else {
              return <WrapperComponent {...this.props}>{this.props.children}</WrapperComponent>
            }
          case 3:
            return <WrapperComponent {...this.props}>{this.props.children}</WrapperComponent>
        }
      } else {
        return defaultComponent
      }
    }

    public render () {
      const result = this.computePermission()
      return result
    }
  }
  return ModulePermission
}





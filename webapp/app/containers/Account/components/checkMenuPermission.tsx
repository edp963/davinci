import React from 'react'
import { IOrganization } from 'containers/Organizations/types'
import { IProject } from 'containers/Projects/types'

interface IModulePermissionProps {
  size?: string
  type?: string
  icon?: string
  onClick?: any
  className?: string
  permission?: IOrganization
  indexRoute?: string
  active?: any
  projectId?: string
}

export default (project?: IProject, item?: any) => (WrapperComponent) => {
  class MenuPermission extends React.PureComponent<IModulePermissionProps, {}> {
    private getPermissionByCurrentProject = () => {
      let permission = ''
      if (project) {
        const projectPermission = project.permission
        for (const attr in projectPermission) {
          if (attr) {
            const pStr = attr.slice(0, -10)
            if (pStr === item) {
              permission = projectPermission [attr]
            }
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
          default:
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
  return MenuPermission
}

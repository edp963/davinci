import React from 'react'
import { IProject } from 'containers/Projects/types'

export default function<T> (project?: IProject, route?: string, isDelete?: boolean) {
  return (WrapperComponent) => {
    class ModulePermission extends React.PureComponent<T, {}> {
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
}





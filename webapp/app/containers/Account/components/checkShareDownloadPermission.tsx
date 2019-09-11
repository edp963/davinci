import React from 'react'
import { IProject } from 'containers/Projects/types'

export default function<T> (project?: IProject, type?: string) {
  return (WrapperComponent) => {
    class ShareDownloadPermission extends React.PureComponent<T, {}> {
      private getPermissionByCurrentProject = () => {
        let permission = ''
        if (project) {
          const projectPermission = project.permission
          for (const attr in projectPermission) {
            if (`${type}Permission` === attr) {
              permission = projectPermission[attr]
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
        switch (Number(permission)) {
          case 0:
            return defaultComponent
          case 1:
            return <WrapperComponent  {...this.props}>{this.props.children}</WrapperComponent>
          default:
            return defaultComponent
        }
      }

      public render () {
        const result = this.computePermission()
        return result
      }
    }
    return ShareDownloadPermission
  }
}





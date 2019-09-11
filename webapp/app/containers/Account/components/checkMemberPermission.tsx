import React from 'react'
import {
   CREATE_ORGANIZATION_PROJECT
} from 'containers/App/constants'
import { IOrganization } from 'containers/Organizations/types'

interface IComponentPermissionProps {
  size?: string
  type?: string
  icon?: string
  onClick?: any
  className?: string
  permission?: IOrganization
}

export default (currentOrganization, code) => (WrapperComponent) => {
  class ComponentPermission extends React.PureComponent<IComponentPermissionProps, {}> {
    public render () {
      let role = void 0
      if (currentOrganization && currentOrganization.role) {
        role = currentOrganization.role
      }
      return role && role === 1
        ? <WrapperComponent {...this.props}>{this.props.children}</WrapperComponent>
        : currentOrganization && currentOrganization.allowCreateProject && code === CREATE_ORGANIZATION_PROJECT
          ? <WrapperComponent {...this.props}>{this.props.children}</WrapperComponent>
          : (<span/>)
    }
  }
  return ComponentPermission
}





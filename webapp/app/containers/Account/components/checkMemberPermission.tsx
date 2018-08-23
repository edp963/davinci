import * as React from 'react'
import {
   CREATE_ORGANIZATION_PROJECT
} from '../../App/constants'
import {IOrganization} from '../../Organizations/Organization'

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
      const { role } = currentOrganization
      return role && role === 1
        ? <WrapperComponent {...this.props}>{this.props.children}</WrapperComponent>
        : currentOrganization.allowCreateProject && code === CREATE_ORGANIZATION_PROJECT
          ? <WrapperComponent {...this.props}>{this.props.children}</WrapperComponent>
          : (<span/>)
    }
  }
  return ComponentPermission
}





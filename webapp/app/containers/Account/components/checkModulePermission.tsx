import * as React from 'react'
import {
  CREATE_ORGANIZATION_PROJECT
} from '../../App/constants'
import {IOrganization} from '../../Organizations/Organization'

interface IModulePermissionProps {
  size?: string
  type?: string
  icon?: string
  onClick?: any
  className?: string
  permission?: IOrganization
}

export default (route?: string) => (WrapperComponent) => {
  class ModulePermission extends React.PureComponent<IModulePermissionProps, {}> {
    public render () {
      console.log(route)
      return <WrapperComponent>{this.props.children}</WrapperComponent>
    }
  }
  return ModulePermission
}





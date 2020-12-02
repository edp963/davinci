import React from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { createStructuredSelector } from 'reselect'
import { getExternalAuthProviders } from 'share/containers/App/actions'
import { makeSelectExternalAuthProviders } from 'share/containers/App/selectors'
const styles = require('./ExternalLogin.less')


interface IExternalLoginProps {
  providers: Array<{}>
  onGetExternalAuthProviders: () => any
}

class ExternalLogin extends React.Component<IExternalLoginProps, {}> {

  public componentWillMount() {
    const { onGetExternalAuthProviders } = this.props
    onGetExternalAuthProviders()
  }

  private mapProviders = (authProviders) => {
    const ret = []
    for (const provider of authProviders) {
      const name = Object.keys(provider)[0]
      const url = provider[name]
      ret.push({
        name,
        url
      })
    }
    return ret
  }

  public render() {
    const authProviders = this.props.providers || []
    const providers = this.mapProviders(authProviders)
    return (
      <div className={styles.externalauth}>
        {providers.length > 0 &&
          providers.map((provider) => (
            <a href={provider.url} key={provider.name}>{provider.name}</a>
          ))}
      </div>
    )
  }
}

export function mapDispatchToProps(dispatch) {
  return {
    onGetExternalAuthProviders: () => dispatch(getExternalAuthProviders()),
  }
}

const mapStateToProps = createStructuredSelector({
  providers: makeSelectExternalAuthProviders()
})

const withConnect = connect(mapStateToProps, mapDispatchToProps)

export default compose(
  withConnect
)(ExternalLogin)

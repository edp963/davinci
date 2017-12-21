/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2017 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * >>
 */

import React, { PropTypes } from 'react'
import ProgressBar from './ProgressBar'

function withProgressBar (WrappedComponent) {
  class AppWithProgressBar extends React.Component {
    constructor (props) {
      super(props)
      this.state = {
        progress: -1,
        loadedRoutes: props.location && [props.location.pathname]
      }
      this.updateProgress = this.updateProgress.bind(this)
    }

    componentWillMount () {
      // Store a reference to the listener.
      /* istanbul ignore next */
      this.unsubscribeHistory = this.props.router && this.props.router.listenBefore((location) => {
        // Do not show progress bar for already loaded routes.
        if (this.state.loadedRoutes.indexOf(location.pathname) === -1) {
          this.updateProgress(0)
        }
      })
    }

    componentWillUpdate (newProps, newState) {
      const { loadedRoutes, progress } = this.state
      const { pathname } = newProps.location

      // Complete progress when route changes. But prevent state update while re-rendering.
      if (loadedRoutes.indexOf(pathname) === -1 && progress !== -1 && newState.progress < 100) {
        this.updateProgress(100)
        this.setState({
          loadedRoutes: loadedRoutes.concat([pathname])
        })
      }
    }

    componentWillUnmount () {
      // Unset unsubscribeHistory since it won't be garbage-collected.
      this.unsubscribeHistory = undefined
    }

    updateProgress (progress) {
      this.setState({ progress })
    }

    render () {
      return (
        <div>
          <ProgressBar percent={this.state.progress} updateProgress={this.updateProgress} />
          <WrappedComponent {...this.props} />
        </div>
      )
    }
  }

  AppWithProgressBar.propTypes = {
    location: PropTypes.object,
    router: PropTypes.object
  }

  return AppWithProgressBar
}

export default withProgressBar

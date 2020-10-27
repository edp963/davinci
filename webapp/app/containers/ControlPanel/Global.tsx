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

import React, { Component, GetDerivedStateFromProps } from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import ControlPanelComponent from 'app/components/Control/Panel'
import ControlActions from './actions'
const { setGlobalControlPanelFormValues } = ControlActions
import {
  makeSelectGlobalControlPanelFormValues,
  makeSelectGlobalControlPanelSelectOptions
} from './selectors'
import { getFormValuesRelatedItems } from '../Dashboard/util'
import { OnGetControlOptions } from 'app/components/Control/types'
import {
  ControlPanelTypes,
  ControlPanelLayoutTypes
} from 'app/components/Control/constants'
import { IDashboard, IDashboardItem } from '../Dashboard/types'
import { IFormedViews, IShareFormedViews } from '../View/types'

interface IGlobalControlPanelBaseProps {
  currentDashboard: IDashboard
  currentItems: IDashboardItem[]
  formedViews: IFormedViews | IShareFormedViews
  layoutType: ControlPanelLayoutTypes
  onGetOptions: OnGetControlOptions
  onSearch: (
    type: ControlPanelTypes,
    relatedItems: number[],
    formValues?: object,
    itemId?: number
  ) => void
  onMonitoredSearchDataAction?: () => void
}

type MappedStates = ReturnType<typeof mapStateToProps>
type MappedDispatches = ReturnType<typeof mapDispatchToProps>

type IGlobalControlPanelProps = IGlobalControlPanelBaseProps &
  MappedStates &
  MappedDispatches

interface IGlobalControlPanelStates {
  prevCurrentDashboard: IDashboard
  isCurrentDashboardUpdated: boolean
}

class GlobalControlPanel extends Component<
  IGlobalControlPanelProps,
  IGlobalControlPanelStates
> {
  public state: IGlobalControlPanelStates = {
    prevCurrentDashboard: null,
    isCurrentDashboardUpdated: false
  }

  public static getDerivedStateFromProps: GetDerivedStateFromProps<
    IGlobalControlPanelProps,
    IGlobalControlPanelStates
  > = (props, state) => {
    return {
      prevCurrentDashboard: props.currentDashboard,
      isCurrentDashboardUpdated:
        !!props.currentDashboard &&
        !!state.prevCurrentDashboard &&
        props.currentDashboard !== state.prevCurrentDashboard &&
        props.currentDashboard.id === state.prevCurrentDashboard.id
    }
  }

  private search = (formValues?: object) => {
    const {
      currentDashboard,
      currentItems,
      onSearch,
      onMonitoredSearchDataAction
    } = this.props
    const controls = currentDashboard.config.filters
    const relatedItems = formValues
      ? getFormValuesRelatedItems(controls, formValues)
      : currentItems.map((item) => item.id)
    onSearch(ControlPanelTypes.Global, relatedItems, formValues)
    if (onMonitoredSearchDataAction) {
      onMonitoredSearchDataAction()
    }
  }

  public render() {
    const {
      layoutType,
      currentDashboard,
      currentItems,
      formedViews,
      selectOptions,
      globalControlPanelFormValues,
      onGetOptions,
      onSetGlobalControlPanelFormValues
    } = this.props

    const { isCurrentDashboardUpdated } = this.state

    const items = currentItems
      ? currentItems
          .map((item) => item.id)
          .sort()
          .join(',')
      : ''

    return (
      currentDashboard && (
        <ControlPanelComponent
          controls={currentDashboard.config.filters}
          formedViews={formedViews}
          items={items}
          type={ControlPanelTypes.Global}
          layoutType={layoutType}
          reload={isCurrentDashboardUpdated}
          queryMode={currentDashboard.config.queryMode}
          formValues={globalControlPanelFormValues}
          mapOptions={selectOptions}
          onGetOptions={onGetOptions}
          onChange={onSetGlobalControlPanelFormValues}
          onSearch={this.search}
        />
      )
    )
  }
}

const mapStateToProps = createStructuredSelector({
  selectOptions: makeSelectGlobalControlPanelSelectOptions(),
  globalControlPanelFormValues: makeSelectGlobalControlPanelFormValues()
})

function mapDispatchToProps(dispatch) {
  return {
    onSetGlobalControlPanelFormValues: (values: object) =>
      dispatch(setGlobalControlPanelFormValues(values))
  }
}

export default connect<
  MappedStates,
  MappedDispatches,
  IGlobalControlPanelBaseProps
>(
  mapStateToProps,
  mapDispatchToProps
)(GlobalControlPanel)

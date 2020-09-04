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

import React, { PureComponent, GetDerivedStateFromProps } from 'react'
import { Slider as AntSlider } from 'antd'
import { SliderValue } from 'antd/lib/slider'
import { IControl } from '../types'
import { metricAxisLabelFormatter } from 'app/containers/Widget/components/util'

interface ISliderProps {
  control: Omit<IControl, 'relatedItems' | 'relatedViews'>
  value?: any
  onChange?: (value: SliderValue) => void
}

interface ISliderStates {
  value?: any
  prevValueProp: any
}

class Slider extends PureComponent<ISliderProps, ISliderStates> {
  public state: ISliderStates = {
    value: void 0,
    prevValueProp: void 0
  }

  public static getDerivedStateFromProps: GetDerivedStateFromProps<
    ISliderProps,
    ISliderStates
  > = (props, state) => {
    if (state.prevValueProp !== props.value) {
      return {
        prevValueProp: props.value,
        value: props.value
      }
    }
    return null
  }

  private sliderChange = (value) => {
    this.setState({ value })
  }

  private sliderAfterChange = (value) => {
    this.props.onChange(value)
  }

  private getTooltipPopupContainer = (node) => node.parentNode

  public render() {
    const { control } = this.props
    const { value } = this.state
    const { max, min, step, label } = control
    const marks = label
      ? {
          marks: {
            [min]: metricAxisLabelFormatter(min),
            [max]: metricAxisLabelFormatter(max),
            ...(value && {
              [value[0]]: metricAxisLabelFormatter(value[0]),
              [value[1]]: metricAxisLabelFormatter(value[1])
            })
          }
        }
      : void 0

    return (
      <AntSlider
        max={max}
        min={min}
        step={step}
        value={value}
        onChange={this.sliderChange}
        onAfterChange={this.sliderAfterChange}
        getTooltipPopupContainer={this.getTooltipPopupContainer}
        {...marks}
        range
      />
    )
  }
}

export default Slider

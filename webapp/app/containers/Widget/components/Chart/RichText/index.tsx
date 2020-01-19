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

import React, { Suspense } from 'react'
import { Spin } from 'antd'
import { IChartProps } from '../'
import { IWidgetDimension, IWidgetMetric } from 'containers/Widget/components/Widget'
import { PIVOT_CHART_FONT_SIZES } from 'app/globalConstants'
import { decodeMetricName } from '../../util'
import Preview from './Preview'
const Editor = React.lazy(() => import('./Editor'))

export class RichText extends React.Component<IChartProps> {
  public static FieldPrefix = '〖@dv_'
  public static FieldSuffix = '_dv@〗'
  public static FieldBoundaries: [string, string] = [RichText.FieldPrefix, RichText.FieldSuffix]
  public static FieldRegx = new RegExp(`${RichText.FieldPrefix}(.+?)${RichText.FieldSuffix}`, 'g')

  // @FIXME use memoizeOne
  private getFields = (cols: IWidgetDimension[], rows: IWidgetDimension[], metrics: IWidgetMetric[]) => {
    let map =  cols.concat(rows).reduce((mapFields, field) => {
      mapFields[field.name] = {
        name: field.name,
        field: field.field,
        format: field.format
      }
      return mapFields
    }, {})
    map = metrics.reduce((mapFields, field) => {
      const name = `${field.agg}(${decodeMetricName(field.name)})`
      mapFields[name] = {
        name,
        field: field.field,
        format: field.format
      }
      return mapFields
    }, map)
    return map
  }

  private editorChange = (updatedContent: string) => {
    const { onChartStylesChange } = this.props
    onChartStylesChange(['richText', 'content'], updatedContent) // @FIXME ts typing
  }

  public render () {
    const { editing, data, cols, rows, metrics, chartStyles } = this.props
    const { content } = chartStyles.richText
    const mapFields = this.getFields(cols, rows, metrics)

    return (
      <Suspense fallback={<Spin />}>
        {!editing ?
          <Preview
            content={content}
            fieldBoundaries={RichText.FieldBoundaries}
            mapFields={mapFields}
            data={data}
          /> :
          <Editor
            content={content}
            fontSizes={PIVOT_CHART_FONT_SIZES}
            mapFields={mapFields}
            data={data}
            fieldBoundaries={RichText.FieldBoundaries}
            onChange={this.editorChange}
          />
        }
      </Suspense>
    )
  }

}

export default RichText

import * as React from 'react'
import { Row, Col, Form } from 'antd'
import { FormComponentProps } from 'antd/lib/form/Form'
import { FilterControl } from './FilterControl'
import { IFilterItem, OnGetFilterControlOptions, FilterControlOptions } from './'

const styles = require('./filter.less')

interface IFilterValuePreviewProps {
  filter: IFilterItem
  currentOptions: FilterControlOptions
  onGetOptions: OnGetFilterControlOptions
}

export class FilterValuePreview extends React.Component<IFilterValuePreviewProps & FormComponentProps, {}> {

  private filterControlValueChange = (filterItem, val) => {
    console.log(filterItem, val)
  }

  public render () {
    const { form } = this.props
    return (
      <div className={styles.filterValuePreview}>
        <div className={styles.title}><h2>预览</h2></div>
        <div className={styles.previewContent}>
          <Form>
            <Row type="flex" align="middle" justify="center">
              <Col
                xl={6}
                lg={8}
                md={12}
                sm={24}
              >
                <FilterControl
                  {...this.props}
                  formToAppend={form}
                  onChange={this.filterControlValueChange}
                />
              </Col>
            </Row>
          </Form>
        </div>
      </div>
    )
  }
}

export default Form.create<IFilterValuePreviewProps>()(FilterValuePreview)

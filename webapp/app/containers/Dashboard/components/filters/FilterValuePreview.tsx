import * as React from 'react'

const styles = require('./filter.less')

interface IFilterValuePreviewProps {
  currentPreviewData: Array<string | number>
}

export class FilterValuePreview extends React.Component<IFilterValuePreviewProps, {}> {

  public render () {
    const { currentPreviewData } = this.props

    return (
      <div className={styles.filterValuePreview}>
        <div className={styles.title}><h2>预览</h2></div>
        <ul>
          {currentPreviewData.map((val) => (<li title={`${val}`} key={val}>{val}</li>))}
        </ul>
      </div>
    )
  }
}

export default FilterValuePreview

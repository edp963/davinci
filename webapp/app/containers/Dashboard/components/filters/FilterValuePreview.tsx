import * as React from 'react'

interface IFilterValuePreviewProps {
  currentPreviewData: Array<string | number>
}

export class FilterValuePreview extends React.Component<IFilterValuePreviewProps, {}> {

  public render () {
    const { currentPreviewData } = this.props

    return (
      <ul>
        {currentPreviewData.map((val) => (<li title={val} key={val}>{val}</li>))}
      </ul>
    )
  }
}

export default FilterValuePreview

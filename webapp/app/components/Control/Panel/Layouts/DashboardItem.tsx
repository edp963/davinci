import React, { FC, memo, useCallback } from 'react'
import ControlComponent from '../../Control'
import { Row, Col, Button } from 'antd'
import {
  IRenderTreeItem,
  IMapControlOptions,
  GlobalControlQueryMode,
  ILocalControl,
  ILocalRenderTreeItem
} from '../../types'
import { DEFAULT_DASHBOARD_ITEM_CONTROL_GRID_WIDTH } from '../../constants'
import styles from './Layouts.less'

interface IDashboardItemControlPanelLayoutProps {
  queryMode: GlobalControlQueryMode
  renderTree: IRenderTreeItem[]
  formValues: object
  mapOptions: IMapControlOptions
  onChange: (control: ILocalControl, val: any) => void
  onSearch: (changedValues?: object) => void
  onReset: () => void
}

const DashboardItemControlPanelLayout: FC<IDashboardItemControlPanelLayoutProps> = ({
  queryMode,
  renderTree,
  formValues,
  mapOptions,
  onChange,
  onSearch,
  onReset
}) => {
  const renderControlComponents = useCallback(
    (controlRenderTreeItems: IRenderTreeItem[], parents?: ILocalControl[]) => {
      let components = []

      controlRenderTreeItems.forEach((control) => {
        const {
          key,
          width,
          children,
          ...rest
        } = control as ILocalRenderTreeItem
        const parentsInfo = parents
          ? parents.reduce((values, parentControl) => {
              const parentSelectedValue = formValues[parentControl.key]
              if (
                parentSelectedValue &&
                !(
                  Array.isArray(parentSelectedValue) &&
                  !parentSelectedValue.length
                )
              ) {
                values = values.concat({
                  control: parentControl,
                  value: parentSelectedValue
                })
              }
              return values
            }, [])
          : null
        const controlValue = formValues && formValues[`${control.key}`]
        const controlGridProps = width
          ? {
              lg: width,
              md: width < 8 ? 12 : 24
            }
          : DEFAULT_DASHBOARD_ITEM_CONTROL_GRID_WIDTH
        components = components.concat(
          <Col key={key} {...controlGridProps}>
            <ControlComponent
              queryMode={queryMode}
              control={control}
              value={controlValue}
              size="small"
              currentOptions={mapOptions[key]}
              parentsInfo={parentsInfo}
              onChange={onChange}
              onSearch={onSearch}
            />
          </Col>
        )
        if (children) {
          const controlWithOutChildren = { key, width, ...rest }
          components = components.concat(
            renderControlComponents(
              children,
              parents
                ? parents.concat(controlWithOutChildren)
                : [controlWithOutChildren]
            )
          )
        }
      })
      return components
    },
    [renderTree, formValues, mapOptions]
  )

  const manualSearch = useCallback(() => {
    onSearch()
  }, [onSearch])

  return (
    <div className={styles.dashboardItemControlPanel}>
      <div className={styles.controls}>
        <Row gutter={8}>{renderControlComponents(renderTree)}</Row>
      </div>
      {queryMode === GlobalControlQueryMode.Manually && (
        <div className={styles.actions}>
          <Button type="primary" icon="search" size="small" onClick={manualSearch}>
            查询
          </Button>
          <Button icon="reload" size="small" onClick={onReset}>
            重置
          </Button>
        </div>
      )}
    </div>
  )
}

export default memo(DashboardItemControlPanelLayout)

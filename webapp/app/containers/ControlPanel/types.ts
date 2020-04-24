import { IMapControlOptions, IControlBase } from 'app/components/Filters/types'

export interface IControlState {
  globalControlPanelFormValues: object
  globalControlPanelSelectOptions: IMapControlOptions
  localControlPanelFormValues: {
    [itemId: string]: object
  }
  localControlPanelSelectOptions: {
    [itemId: string]: IMapControlOptions
  }
  configForm: IControlBase
}

import { IMapControlOptions, IControlBase } from 'app/components/Control/types'

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

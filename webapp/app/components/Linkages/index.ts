import { DEFAULT_SPLITER, SQL_NUMBER_TYPES } from '../../globalConstants'
import OperatorType from 'utils/operatorTypes'

export interface ILinkage {
  key: string
  trigger: [number, string]
  linkager: [number, string]
  relation: OperatorType
}

export interface IMappingLinkage {
  [linkagerId: number]: Array<{
    triggerKey: string
    triggerSqlType: string
    triggerType: 'parameter' | 'variable'
    linkagerKey: string
    linkagerSqlType: string
    linkagerType: 'parameter' | 'variable'
    relation: OperatorType
  }>
}

export function getMappingLinkage (itemId: number, linkages: ILinkage[]) {
    const mappingLinkage: IMappingLinkage = {}
    if (linkages.length <= 0) { return mappingLinkage }

    linkages.forEach((l) => {
      const { trigger, linkager, relation } = l

      const triggerItemId = +trigger[0]
      const linkagerItemId = linkager[0]

      if (itemId === triggerItemId) {
        const [ triggerKey, triggerSqlType, triggerType ] = trigger[1].split(DEFAULT_SPLITER)
        const [ linkagerKey, linkagerSqlType, linkagerType ] = linkager[1].split(DEFAULT_SPLITER)

        if (!mappingLinkage[linkagerItemId]) {
          mappingLinkage[linkagerItemId] = []
        }

        mappingLinkage[linkagerItemId].push({
          triggerKey,
          triggerSqlType,
          triggerType: triggerType as 'parameter' | 'variable',
          linkagerKey,
          linkagerSqlType,
          linkagerType: linkagerType as 'parameter' | 'variable',
          relation
        })
      }
    })

    return mappingLinkage
}

export function processLinkage (itemId: number, triggerData, mappingLinkage: IMappingLinkage, interactingLinkage) {

  Object.keys(mappingLinkage).forEach((linkagerItemId) => {
    const linkage = mappingLinkage[+linkagerItemId]

    const linkageFilters: string[] = []
    const linkageParams: Array<{ name: string, value: string }> = []

    linkage.forEach((l) => {
      const { triggerKey, triggerSqlType, triggerType, linkagerKey, linkagerSqlType, linkagerType, relation } = l

      const interactValue = SQL_NUMBER_TYPES.indexOf(triggerSqlType) >= 0 ?
        triggerData[0][triggerKey] : `'${triggerData[0][triggerKey]}'`

      if (linkagerType === 'parameter') {
        linkageFilters.push(`${linkagerKey} ${relation} ${interactValue}`)
      } else if (linkagerType === 'variable') {
        linkageParams.push({ name: linkagerKey, value: interactValue })
      }
    })


    const existedQueryParams = interactingLinkage[linkagerItemId]

    if (existedQueryParams) {
      const { filters, params } = existedQueryParams
      existedQueryParams.filters = linkageFilters.length > 0 ? { ...filters, [itemId]: linkageFilters } : filters
      existedQueryParams.params = linkageParams.length > 0 ? { ...params, [itemId]: linkageParams } : params
    } else {
      interactingLinkage[linkagerItemId] = {
        filters: linkageFilters.length > 0 ? { [itemId]: linkageFilters } : {},
        params: linkageParams.length > 0 ? { [itemId]: linkageFilters } : {}
      }
    }
  })

  return interactingLinkage
}

export function removeLinkage (itemId: number, linkages: ILinkage[], interactingLinkage) {
  const refreshItemIds = []

  if (linkages.length <= 0) { return refreshItemIds }

  linkages.forEach((l) => {
    const { trigger, linkager } = l
    const triggerItemId = +trigger[0]
    const linkagerItemId = +linkager[0]

    if (itemId === triggerItemId) {
      if (interactingLinkage[linkagerItemId]) {
        ['filters', 'params'].forEach((key) => {
          if (interactingLinkage[linkagerItemId][key][itemId]) {
            delete interactingLinkage[linkagerItemId][key][itemId]
            if (refreshItemIds.indexOf(linkagerItemId) < 0) {
              refreshItemIds.push(linkagerItemId)
            }
          }
        })
      }
    }
  })

  return refreshItemIds
}

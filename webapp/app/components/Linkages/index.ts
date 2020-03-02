import { QueryVariable } from 'containers/Dashboard/Grid'
import { DEFAULT_SPLITER, SQL_NUMBER_TYPES } from 'app/globalConstants'
import OperatorType from 'utils/operatorTypes'
import { IFilters } from 'app/components/Filters/types'
import {getValidColumnValue} from 'app/components/Filters/util'
export type LinkageType = 'column' | 'variable'

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
    triggerType: LinkageType
    linkagerKey: string
    linkagerSqlType: string
    linkagerType: LinkageType
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
          triggerType: triggerType as LinkageType,
          linkagerKey,
          linkagerSqlType,
          linkagerType: linkagerType as LinkageType,
          relation
        })
      }
    })

    return mappingLinkage
}

export function processLinkage (itemId: number, triggerData, mappingLinkage: IMappingLinkage, interactingLinkage) {
  Object.keys(mappingLinkage).forEach((linkagerItemId) => {
    const linkage = mappingLinkage[+linkagerItemId]

    const linkageFilters: IFilters[] = []
    const linkageVariables: QueryVariable = []
    linkage.forEach((l) => {
      const { triggerKey, triggerSqlType, triggerType, linkagerKey, linkagerSqlType, linkagerType, relation } = l
      const actuallyData = Array.isArray(triggerData) ? triggerData[0][triggerKey] : triggerData[triggerKey]
      const interactValue = SQL_NUMBER_TYPES.includes(triggerSqlType)
        ? actuallyData
        : `'${actuallyData}'`

      if (linkagerType === 'column') {
        const validLinkagerKey = SQL_NUMBER_TYPES.includes(linkagerSqlType)
          ? linkagerKey.replace(/\w+\((\w+)\)/, '$1')
          : linkagerKey

        const filterJson: IFilters = {
          name : validLinkagerKey,
          type: 'filter',
          value: interactValue,
          sqlType: linkagerSqlType,
          operator: relation
        }
        linkageFilters.push(filterJson)
       // linkageFilters.push(`${validLinkagerKey} ${relation} ${interactValue}`)   // 联动filter生成在此处
      } else if (linkagerType === 'variable') {
        linkageVariables.push({ name: linkagerKey, value: interactValue })
      }
    })

    const existedQueryConditions = interactingLinkage[linkagerItemId]

    if (existedQueryConditions) {
      const { filters, variables } = existedQueryConditions
      existedQueryConditions.filters = linkageFilters.length > 0 ? { ...filters, [itemId]: linkageFilters } : filters
      existedQueryConditions.variables = linkageVariables.length > 0 ? { ...variables, [itemId]: linkageVariables } : variables
    } else {
      interactingLinkage[linkagerItemId] = {
        filters: linkageFilters.length > 0 ? { [itemId]: linkageFilters } : {},
        variables: linkageVariables.length > 0 ? { [itemId]: linkageVariables } : {}
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
        ['filters', 'variables'].forEach((key) => {
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

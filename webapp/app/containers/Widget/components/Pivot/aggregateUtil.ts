const AGG_PREFIX = "\t\n\t"
const AGG_FLAG = "__aggregated"
const AGG_TYPE = "__aggType"
const AVG_COUNT = "__avgCount"
const AVG_METRICS = "__avgMetrics"

export function pivotOnGetRenderData(props){
  if(props.data.length<1) return

  if(props.data[AGG_FLAG]!=undefined) return
  props.data[AGG_FLAG] = true
  if(props.metrics.length<1) return
  
  let metricName = props.metrics[0].agg + "(" + props.metrics[0].name.split("@davinci@")[0] + ")" // curretnly we only support aggregate 1 metrics
  
  if(props.editing){
    //in widget Editing mode: restore to original data as the data already contains aggregated data in previous rendering phases.
    let newData = []
    for(let i=props.data.length-1; i>=0; i--){
      let skip = false
      let item = props.data[i]
      for(let key in item)
        if(key===AGG_FLAG) {
          skip = true
          continue
        }

      if(!skip) newData.push(item)
    }
    props.data = newData
  }
  
  pivotAggregateData(props, "sum", metricName)
  pivotAggregateData(props, "max", metricName)
  pivotAggregateData(props, "min", metricName)
  pivotAggregateData(props, "avg", metricName)
  pivotAggregateData(props, "count", metricName)
}

export function pivotAggregateData(props, aggType, metricName){
  pivotAggregateRowsOrCols(props, "cols", aggType, metricName)
  pivotAggregateRowsOrCols(props, "rows", aggType, metricName)

  //one more step needs to be done for average/count as below:
  props.data.forEach( item=>{
    if(item[AVG_COUNT]!=undefined && item[AVG_COUNT]>0 && aggType==item[AGG_TYPE]){
      if(aggType=="avg")
        item[item[AVG_METRICS]] = (item[item[AVG_METRICS]] / item[AVG_COUNT]).toFixed(2)
      else if(aggType=="count")
        item[item[AVG_METRICS]] = item[AVG_COUNT]
    }
  })
}

export function pivotAggregateRowsOrCols(props, rowOrCol, aggType, metricName){
  let aggFields = []
  for(let i=props[rowOrCol].length-1; i>=0; i--) {
    let field = props[rowOrCol][i]
    let desc = field.field.desc
    if(desc!=undefined && desc.length>0){
      try {
        let fDesc = JSON.parse(desc)
        if(fDesc[aggType]!=undefined) aggFields.push({"field":field.name, "type": aggType, "title": fDesc[aggType]})
      }
      catch(ex){ console.log("error field desc: field=" + field.name + ", desc=" + desc)}
    }
  }
  aggFields.forEach( aggField=>{
    if(rowOrCol==="rows")
      pivotAggregateCellData(props.data, props.rows, props.cols, metricName, aggField["field"], aggField["type"], aggField["title"])
    else
      pivotAggregateCellData(props.data, props.cols, props.rows, metricName, aggField["field"], aggField["type"], aggField["title"])
  })
}

export function pivotAggregateValue(aggType, curVal, newVal) {
  curVal = Number(curVal)
  if( isNaN(curVal) ) curVal = 0

  newVal = Number(newVal)
  if( isNaN(newVal) ) newVal = 0
  
  if(aggType=="max") return curVal > newVal? curVal : newVal
  if(aggType=="min") return curVal > newVal? newVal : curVal

  // sum or avg
  return curVal + newVal
}

export function pivotAggregateCellData(dataList, keys1, keys2, metricName, keyName, aggType, aggTitle, aggTitles) {
  aggTitle = AGG_PREFIX + aggTitle
  let names1 = []
  keys1.forEach(key=>{
    names1.push(key.name)
  })
  let names2 = []
  keys2.forEach(key=>{
    names2.push(key.name)
  })
  
  let index = names1.indexOf(keyName)
  if(index<0) return

  let rowData = {}
  
  dataList.forEach(data=>{
    if(data[AGG_FLAG]!=true || data[AGG_TYPE]==aggType){
      let aggDepth = 0
      let dataKey = ""

      for(let i=0; i<index; i++){
        if(data[names1[i]]!=undefined) {
          if(data[names1[i]].startsWith(AGG_PREFIX)) aggDepth++
          dataKey = dataKey + (data[names1[i]]) + "_"
        }
      }
      
      names2.forEach(item=>{
        if(data[item]!=undefined){
          if(data[item].startsWith(AGG_PREFIX)) aggDepth++
          dataKey = dataKey + (data[item]) + "_"
        }
      })

      if(rowData[dataKey]===undefined) {
        rowData[dataKey] = {}
        rowData[dataKey][AGG_FLAG] = true
        
        for(let k in data) rowData[dataKey][k] = data[k]

        rowData[dataKey][names1[index]] = aggTitle
        
        for(let i=index+1; i<names1.length; i++){
          rowData[dataKey][names1[i]] = AGG_PREFIX + "/"
        }
        
        rowData[dataKey][AGG_TYPE] = aggType

        if(aggType=="avg" || aggType=="count" ){
          rowData[dataKey][AVG_COUNT] = (!data[AVG_COUNT]? 1 : data[AVG_COUNT])
          rowData[dataKey][AVG_METRICS] = metricName
        }
      }
      else{
        if(aggDepth>=1) {
          let depth = 0
          for(let k in data){
            let value = data[k]
            if(typeof(value)=="string" && value.startsWith(AGG_PREFIX)) {
              depth++
            }
          }
          
          if(data[AGG_FLAG]===true && data[AGG_TYPE]==aggType){
            if(aggDepth - depth >= 0){
              rowData[dataKey][metricName] = pivotAggregateValue(aggType, rowData[dataKey][metricName], data[metricName])
              if(aggType=="avg" || aggType=="count" ){
                if(!rowData[dataKey][AVG_COUNT]) rowData[dataKey][AVG_COUNT] = 1
                rowData[dataKey][AVG_COUNT] += !data[AVG_COUNT]? 1 : data[AVG_COUNT]
                rowData[dataKey][AVG_METRICS] = metricName
              }
            }
          }
        }
        else {
          if(data[AGG_FLAG]===undefined) {
            rowData[dataKey][metricName] = pivotAggregateValue(aggType, rowData[dataKey][metricName], data[metricName])
            if(aggType=="avg" || aggType=="count" ){
              rowData[dataKey][AVG_METRICS] = metricName
              if(!rowData[dataKey][AVG_COUNT]) rowData[dataKey][AVG_COUNT] = 1
              rowData[dataKey][AVG_COUNT] += !data[AVG_COUNT]? 1 : data[AVG_COUNT]
            }
          }
        }
      }
    }
  })
  
  for(let key in rowData) dataList.push(rowData[key])
  
  return rowData
}

export function pivotSortKey(fieldList){
  return function(key1, key2){
    for (let i = 0; i < key1.length; i++) {
      if(key1[i]==key2[i]) continue
      
      let isAscend = true
      if(fieldList[i].sort!=undefined ) {
        if(fieldList[i].sort.custom!=undefined && fieldList[i].sort.custom.sortList!=undefined){
          // support custom sort: sort by pre-defined list.
          let custList = fieldList[i].sort.custom.sortList
          let i1 = custList.indexOf(key1[i])
          let i2 = custList.indexOf(key2[i])
          if(i1>-1 && i2>-1) {
            return i1 > i2 ? 1 : -1
          }
        }
        else {
          isAscend = fieldList[i].sort.sortType == "desc"? false : true
        }
      }

      return pivotCompareHeaderNames(key1[i], key2[i], isAscend)
    }
    return 0
  }
}

export function pivotCompareHeaderNames(headerName1, headerName2, isAscend){
  if(!headerName1.startsWith(AGG_PREFIX) && !headerName2.startsWith(AGG_PREFIX)){
    if( isAscend )
      return headerName1.localeCompare(headerName2, "zh");  // ascending sort by Chinese char code
    else
      return -headerName1.localeCompare(headerName2, "zh");  // deascending sort by Chinese char code
  }

  if(headerName2.startsWith(AGG_PREFIX)) return -1
  if(headerName1.startsWith(AGG_PREFIX)) return 1
  
  return 1
}

export function pivotOnRender(props, rowHeaderWidths, rowNames, rowKeys, rowTree, colNames, colKeys, colTree, tree){
  // sort column header and row header before rendering
  colKeys.sort(pivotSortKey(props.cols));
  rowKeys.sort(pivotSortKey(props.rows));
}

export function pivotOnRenderCell(props, cellStyles){
  if(props["colKey"]===undefined) return;
  if(props["rowKey"]===undefined) return;
  
  if(props["colKey"].includes(AGG_PREFIX) || props["rowKey"].includes(AGG_PREFIX)){
    // for aggregated fields' cell: hightlight in blue color.
    cellStyles["color"] = "blue";
    cellStyles["backgroundColor"] = "#F7F7F7";
  }
}

export function pivotOnRenderRowHeader(props, rowKey, cellStyle, pivotStyles){
  if(!pivotStyles) pivotStyles = {};
  pivotStyles["rowHeaderDisplay"] = "block";
  
  rowKey.forEach(key=>{
    // for aggregated fields' row header: hightlight in blue color.
    if(key.includes(AGG_PREFIX)) cellStyle["color"] = "blue";
  });
}

export function pivotOnRenderColHeader(props, colKey, cellStyle){
  colKey.forEach(key=>{
    // for aggregated fields' column header: hightlight in blue color.
    if(key.includes(AGG_PREFIX)) cellStyle["color"] = "blue";
  });
}

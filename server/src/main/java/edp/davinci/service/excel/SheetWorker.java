package edp.davinci.service.excel;

import com.google.common.base.Stopwatch;
import com.google.common.collect.Maps;
import edp.core.model.QueryColumn;
import edp.core.utils.CollectionUtils;
import edp.core.utils.SqlUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang.StringUtils;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowCallbackHandler;
import org.springframework.jdbc.support.rowset.SqlRowSet;
import org.springframework.jdbc.support.rowset.SqlRowSetMetaData;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.Callable;
import java.util.concurrent.TimeUnit;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/28 18:23
 * To change this template use File | Settings | File Templates.
 */
@Slf4j
public class SheetWorker<T> extends AbstractSheetWriter implements Callable {
    private SheetContext context;

    public SheetWorker(SheetContext context){
        this.context=context;
    }

    @Override
    public T call() throws Exception {
        Stopwatch watch = Stopwatch.createStarted();
        Boolean rst=true;
        try{
            JdbcTemplate template=context.getSqlUtils().jdbcTemplate();
            propertiesSet(template);
            buildQueryColumn(template);
            super.init(context);
            super.writeHeader(context);
            template.setMaxRows(-1);
            template.setFetchSize(500);
            template.query(context.getQuerySql().get(context.getQuerySql().size() - 1), new RowCallbackHandler() {
                @Override
                public void processRow(ResultSet rs) throws SQLException {
                    Map<String,Object> dataMap= Maps.newHashMap();
                    for(int i=1;i<=rs.getMetaData().getColumnCount();i++){
                        dataMap.put(rs.getMetaData().getColumnLabel(i),rs.getObject(rs.getMetaData().getColumnLabel(i)));
                    }
                    writeLine(context,dataMap);
                }
            });
            super.refreshHeightWidth(context);
        }catch (Exception e){
            log.error("sheet worker error,context="+context.toString(),e);
            rst=false;
        }
        Object[] args={rst,context.getWrapper().getAction(),context.getWrapper().getxId(),
                context.getSheet().getSheetName(),context.getDashboardId(),context.getWidgetId()
                ,watch.elapsed(TimeUnit.MILLISECONDS)};
        log.info("sheet worker complete status={},action={},xid={},sheetName={},dashboardId={},widgetId={},cost={}ms",args);
        return (T)rst;
    }


    private void propertiesSet(JdbcTemplate template){
        if(!CollectionUtils.isEmpty(context.getExecuteSql())){
            context.getExecuteSql().stream().filter(x->x!=null).forEach(x->{
                String sql = SqlUtils.filterAnnotate(x);
                SqlUtils.checkSensitiveSql(sql);
                template.execute(sql);
            });
        }
        if(!CollectionUtils.isEmpty(context.getQuerySql())){
            for(int i=0;i<context.getQuerySql().size()-1;i++){
                String sql = SqlUtils.filterAnnotate(context.getQuerySql().get(i));
                SqlUtils.checkSensitiveSql(sql);
                template.execute(sql);
            }
        }
    }

    private void buildQueryColumn(JdbcTemplate template){
        template.setMaxRows(1);
        SqlRowSet rowSet=template.queryForRowSet(context.getQuerySql().get(context.getQuerySql().size() - 1));
        SqlRowSetMetaData metaData = rowSet.getMetaData();
        List<QueryColumn> totalColumns=new ArrayList<>();
        List<QueryColumn> queryColumns = new ArrayList<>();
        for (int i = 1; i <= metaData.getColumnCount(); i++) {
            String key = metaData.getColumnLabel(i);
            totalColumns.add(new QueryColumn(key,metaData.getColumnTypeName(i)));
            if (!CollectionUtils.isEmpty(context.getExcludeColumns()) && context.getExcludeColumns().contains(key)) {
                continue;
            }
            queryColumns.add(new QueryColumn(key,metaData.getColumnTypeName(i)));
        }
        if(CollectionUtils.isEmpty(totalColumns) || CollectionUtils.isEmpty(queryColumns)){
            throw new IllegalArgumentException("can not find any QueryColumn,widgetId="+context.getWidgetId()
                    +",sql="+context.getQuerySql().get(context.getQuerySql().size() - 1));
        }
        context.setTotalColumns(totalColumns);
        context.setQueryColumns(queryColumns);
    }
}

package edp.davinci.service.excel;

import edp.core.model.QueryColumn;
import edp.davinci.dto.viewDto.ViewExecuteParam;

import java.io.Serializable;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/29 15:28
 * To change this template use File | Settings | File Templates.
 */
public class SQLContext implements Serializable {

    private List<String> executeSql;

    private List<String> querySql;

    private List<QueryColumn> queryColumns;

    private ViewExecuteParam viewExecuteParam;

    private List<String> excludeColumns;


    public List<String> getExecuteSql() {
        return executeSql;
    }

    public void setExecuteSql(List<String> executeSql) {
        this.executeSql = executeSql;
    }

    public List<String> getQuerySql() {
        return querySql;
    }

    public void setQuerySql(List<String> querySql) {
        this.querySql = querySql;
    }

    public List<QueryColumn> getQueryColumns() {
        return queryColumns;
    }

    public void setQueryColumns(List<QueryColumn> queryColumns) {
        this.queryColumns = queryColumns;
    }

    public ViewExecuteParam getViewExecuteParam() {
        return viewExecuteParam;
    }

    public void setViewExecuteParam(ViewExecuteParam viewExecuteParam) {
        this.viewExecuteParam = viewExecuteParam;
    }

    public List<String> getExcludeColumns() {
        return excludeColumns;
    }

    public void setExcludeColumns(List<String> excludeColumns) {
        this.excludeColumns = excludeColumns;
    }
}

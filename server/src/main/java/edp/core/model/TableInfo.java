package edp.core.model;

import lombok.Data;

import java.util.List;

@Data
public class TableInfo {

    private String tableName;

    private List<String> primaryKeys;

    private List<QueryColumn> columns;

    public TableInfo(String tableName, List<String> primaryKeys, List<QueryColumn> columns) {
        this.tableName = tableName;
        this.primaryKeys = primaryKeys;
        this.columns = columns;
    }

    public TableInfo() {
    }
}

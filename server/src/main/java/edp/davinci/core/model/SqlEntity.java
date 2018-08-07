package edp.davinci.core.model;

import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class SqlEntity {

    //查询sql
    private List<String> querySql;

    //执行sql
    private List<String> executeSql;

    private Map<String, String> params;

    public SqlEntity() {
    }

    public SqlEntity(List<String> querySql, List<String> executeSql, Map<String, String> params) {
        this.querySql = querySql;
        this.executeSql = executeSql;
        this.params = params;
    }
}

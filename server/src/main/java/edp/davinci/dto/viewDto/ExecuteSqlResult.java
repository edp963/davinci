package edp.davinci.dto.viewDto;

import edp.core.model.QueryColumn;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
public class ExecuteSqlResult {

    private List<QueryColumn> columns;

    private List<Map<String, Object>> resultset;

    public ExecuteSqlResult(List<QueryColumn> columns, List<Map<String, Object>> resultset) {
        this.columns = columns;
        this.resultset = resultset;
    }
}

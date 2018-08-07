package edp.davinci.core.model;

import edp.core.model.QueryColumn;
import lombok.Data;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Data
public class CsvEntity {

    private Set<QueryColumn> headers;

    private List<Map<String, Object>> values;
}

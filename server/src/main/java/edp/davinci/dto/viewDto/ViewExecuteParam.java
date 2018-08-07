package edp.davinci.dto.viewDto;

import lombok.Data;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Data
public class ViewExecuteParam {
    private String[] groups;
    private List<Aggregator> aggregators;
    private List<Order> orders;
    private String[] filters;
    private List<Param> params;
    private Boolean cache;
    private Long expired;


    public List<String> getAggregators() {
        List<String> list = null;
        if (null != this.aggregators && this.aggregators.size() > 0) {
            Iterator<Aggregator> iterator = this.aggregators.iterator();
            list = new ArrayList<>();
            while (iterator.hasNext()) {
                Aggregator next = iterator.next();
                StringBuilder sb = new StringBuilder();
                if ("DISTINCT".equals(next.getFunc().trim().toUpperCase())) {
                    sb.append("COUNT(").append(next.getFunc().trim()).append(" ").append(next.getColumn()).append(")");
                    sb.append(" AS 'COUNTDISTINCT(");
                    sb.append(next.getColumn());
                    sb.append(")'");
                } else {
                    sb.append(next.getFunc()).append("(").append(next.getColumn()).append(")");
                }
                list.add(sb.toString());
            }
        }
        return list;
    }
}

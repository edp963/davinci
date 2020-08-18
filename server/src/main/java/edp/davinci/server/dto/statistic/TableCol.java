package edp.davinci.server.dto.statistic;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.annotation.JsonRawValue;
import com.fasterxml.jackson.databind.ObjectMapper;
import edp.davinci.commons.util.JSONUtils;
import edp.davinci.core.dao.entity.Source;
import edp.davinci.server.enums.OperateTypeEnum;
import edp.davinci.server.enums.TableTypeEnum;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@JsonPropertyOrder(value = {"col", "oldVal", "newVal"})
public class TableCol {
	private String col;
	private Object oldVal;
	private Object newVal;

	public TableCol(String col, Object oldVal, Object newVal) {
		this.col = col;
		this.oldVal = oldVal;
		this.newVal = newVal;
	}

	public TableCol() {

	}

}

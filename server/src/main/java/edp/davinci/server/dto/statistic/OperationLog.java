package edp.davinci.server.dto.statistic;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import com.fasterxml.jackson.annotation.JsonRawValue;
import edp.davinci.server.enums.OperateTypeEnum;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;


@Data
@JsonPropertyOrder(value= {"operatorId","operate","operationLogDetails"})
public class OperationLog {

	private Long operatorId;
	private String operate;
	private List<OperationLogDetail> operationLogDetails = new ArrayList<>();

	public OperationLog(OperateTypeEnum operationTypeEnum, Long operatorId ) {
		this.operate = operationTypeEnum.getOperate();
		this.operatorId = operatorId;
	}

	public void addOperationLogDetail(OperationLogDetail operationLogDetail) {
		this.operationLogDetails.add(operationLogDetail);
	}


}
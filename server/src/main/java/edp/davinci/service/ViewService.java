package edp.davinci.service;

import edp.core.exception.ServerException;
import edp.core.model.QueryColumn;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.service.CheckEntityService;
import edp.davinci.dto.viewDto.*;
import edp.davinci.model.User;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

public interface ViewService extends CheckEntityService {

    ResultMap getViews(Long projectId, User user, HttpServletRequest request);

    ResultMap createView(ViewCreate viewCreate, User user, HttpServletRequest request);

    ResultMap updateView(ViewUpdate viewUpdate, User user, HttpServletRequest request);

    ResultMap deleteView(Long id, User user, HttpServletRequest request);

    ResultMap getSourceSchema(Long sourceId, User user, HttpServletRequest request);

    ResultMap executeSql(ViewExecuteSql executeSql, User user, HttpServletRequest request);

    ResultMap getData(Long id, ViewExecuteParam executeParam, User user, HttpServletRequest request);

    List<Map<String, Object>> getResultDataList(ViewWithProjectAndSource viewWithProjectAndSource, ViewExecuteParam executeParam) throws ServerException;

    List<QueryColumn> getResultMeta(ViewWithProjectAndSource viewWithProjectAndSource, ViewExecuteParam executeParam) throws ServerException;
}

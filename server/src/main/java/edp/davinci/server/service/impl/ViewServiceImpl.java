/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2020 EDP
 *  ==
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *        http://www.apache.org/licenses/LICENSE-2.0
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *  >>
 *
 */

package edp.davinci.server.service.impl;

import static edp.davinci.commons.Constants.*;
import static edp.davinci.server.commons.Constants.NO_AUTH_PERMISSION;
import static edp.davinci.server.enums.SqlVariableTypeEnum.AUTHVAR;
import static edp.davinci.server.enums.SqlVariableTypeEnum.QUERYVAR;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Hashtable;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.type.TypeReference;
import com.google.common.base.Stopwatch;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.stringtemplate.v4.ST;
import org.stringtemplate.v4.STGroup;
import org.stringtemplate.v4.STGroupFile;

import edp.davinci.commons.util.CollectionUtils;
import edp.davinci.commons.util.JSONUtils;
import edp.davinci.commons.util.MD5Utils;
import edp.davinci.commons.util.StringUtils;
import edp.davinci.core.dao.entity.RelRoleView;
import edp.davinci.core.dao.entity.Source;
import edp.davinci.core.dao.entity.User;
import edp.davinci.core.dao.entity.View;
import edp.davinci.data.aggregator.AggregatorFactory;
import edp.davinci.data.aggregator.JdbcAggregator;
import edp.davinci.data.parser.ParserFactory;
import edp.davinci.data.parser.StatementParser;
import edp.davinci.data.pojo.ColumnModel;
import edp.davinci.data.pojo.PagingParam;
import edp.davinci.data.provider.DataProviderFactory;
import edp.davinci.data.util.JdbcSourceUtils;
import static edp.davinci.commons.Constants.*;

import edp.davinci.server.commons.Constants;
import edp.davinci.server.component.excel.SQLContext;
import edp.davinci.server.dao.RelRoleViewExtendMapper;
import edp.davinci.server.dao.SourceExtendMapper;
import edp.davinci.server.dao.ViewExtendMapper;
import edp.davinci.server.dao.WidgetExtendMapper;
import edp.davinci.server.dto.project.ProjectDetail;
import edp.davinci.server.dto.project.ProjectPermission;
import edp.davinci.server.dto.source.SourceBaseInfo;
import edp.davinci.server.dto.view.AuthParamValue;
import edp.davinci.server.dto.view.WidgetDistinctParam;
import edp.davinci.data.pojo.Param;
import edp.davinci.data.pojo.SqlQueryParam;
import edp.davinci.server.dto.view.RelRoleViewDTO;
import edp.davinci.server.dto.view.ViewBaseInfo;
import edp.davinci.server.dto.view.ViewCreate;
import edp.davinci.server.dto.view.ViewExecuteParam;
import edp.davinci.server.dto.view.WidgetQueryParam;
import edp.davinci.server.dto.view.ViewUpdate;
import edp.davinci.server.dto.view.ViewWithSource;
import edp.davinci.server.dto.view.ViewWithSourceBaseInfo;
import edp.davinci.server.enums.CheckEntityEnum;
import edp.davinci.server.enums.LogNameEnum;
import edp.davinci.server.enums.SqlVariableTypeEnum;
import edp.davinci.server.enums.SqlVariableValueTypeEnum;
import edp.davinci.server.enums.UserPermissionEnum;
import edp.davinci.server.exception.NotFoundException;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.exception.UnAuthorizedExecption;
import edp.davinci.server.model.Paging;
import edp.davinci.server.model.PagingWithQueryColumns;
import edp.davinci.server.model.SqlEntity;
import edp.davinci.server.model.SqlFilter;
import edp.davinci.server.model.SqlVariable;
import edp.davinci.server.service.ProjectService;
import edp.davinci.server.service.ViewService;
import edp.davinci.server.util.BaseLock;
import edp.davinci.server.util.RedisUtils;
import edp.davinci.server.util.AuthVarUtils;
import edp.davinci.server.util.DataUtils;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("viewService")
public class ViewServiceImpl extends BaseEntityService implements ViewService {

    private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

    @Autowired
    private ViewExtendMapper viewExtendMapper;

    @Autowired
    private SourceExtendMapper sourceExtendMapper;

    @Autowired
    private WidgetExtendMapper widgetMapper;

    @Autowired
    private RelRoleViewExtendMapper relRoleViewExtendMapper;

    @Autowired
    private DataUtils sqlUtils;

    @Autowired
    private RedisUtils redisUtils;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private AuthVarUtils authVarUtils;

    @Value("${sql_template_delimiter:$}")
    private String sqlTempDelimiter;

    private static final String SQL_VARABLE_KEY = "name";

    private static final CheckEntityEnum entity = CheckEntityEnum.VIEW;

    private static final ExecutorService roleParamThreadPool = Executors.newFixedThreadPool(8);

    @Value("${source.query-model:0.3}")
    private String queryModel;

    @Override
    public boolean isExist(String name, Long id, Long projectId) {
        Long viewId = viewExtendMapper.getByNameWithProjectId(name, projectId);
        if (null != id && null != viewId) {
            return !id.equals(viewId);
        }
        return null != viewId && viewId.longValue() > 0L;
    }

    /**
     * 获取View列表
     *
     * @param projectId
     * @param user
     * @return
     */
    @Override
    public List<ViewBaseInfo> getViews(Long projectId, User user)
            throws NotFoundException, UnAuthorizedExecption, ServerException {

        ProjectDetail projectDetail = null;
        try {
            projectDetail = projectService.getProjectDetail(projectId, user, false);
        } catch (UnAuthorizedExecption e) {
            return null;
        }

        List<ViewBaseInfo> views = viewExtendMapper.getViewBaseInfoByProject(projectId);
        if (null == views) {
            return null;
        }

        if (isHiddenPermission(projectDetail, user)) {
            return null;
        }

        return views;
    }

    private boolean isHiddenPermission(ProjectDetail projectDetail, User user) {
        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
        return projectPermission.getVizPermission() == UserPermissionEnum.HIDDEN.getPermission()
                && projectPermission.getWidgetPermission() == UserPermissionEnum.HIDDEN.getPermission()
                && projectPermission.getViewPermission() == UserPermissionEnum.HIDDEN.getPermission();
    }

    @Override
    public ViewWithSourceBaseInfo getView(Long id, User user)
            throws NotFoundException, UnAuthorizedExecption, ServerException {
        ViewWithSourceBaseInfo view = viewExtendMapper.getViewWithSourceBaseInfo(id);
        if (null == view) {
            throw new NotFoundException("View is not found");
        }

        ProjectDetail projectDetail = projectService.getProjectDetail(view.getProjectId(), user, false);
        if (isHiddenPermission(projectDetail, user)) {
            throw new UnAuthorizedExecption("Insufficient permissions");
        }

        List<RelRoleView> relRoleViews = relRoleViewExtendMapper.getByView(view.getId());
        view.setRoles(relRoleViews);
        return view;
    }

    /**
     * 新建View
     *
     * @param viewCreate
     * @param user
     * @return
     */
    @Override
    @Transactional
    public ViewWithSourceBaseInfo createView(ViewCreate viewCreate, User user)
            throws NotFoundException, UnAuthorizedExecption, ServerException {

        Long projectId = viewCreate.getProjectId();
        checkWritePermission(entity, projectId, user, "create");

        String name = viewCreate.getName();
        if (isExist(name, null, projectId)) {
            alertNameTaken(entity, name);
        }

        Long sourceId = viewCreate.getSourceId();
        Source source = getSource(sourceId);

        if (!DataProviderFactory.getProvider(source.getType()).test(source, user)) {
            throw new ServerException("Get source connection fail");
        }

        BaseLock lock = getLock(entity, name, projectId);
        if (lock != null && !lock.getLock()) {
            alertNameTaken(entity, name);
        }

        try {
            View view = new View();
            view.setCreateBy(user.getId());
            view.setCreateTime(new Date());
            BeanUtils.copyProperties(viewCreate, view);

            insertView(view);
            optLogger.info("View({}) is create by user({})", view.getId(), user.getId());

            if (!CollectionUtils.isEmpty(viewCreate.getRoles()) && !StringUtils.isEmpty(viewCreate.getVariable())) {
                insertRelRoleView(viewCreate.getVariable(), viewCreate.getRoles(), user, view);
            }

            SourceBaseInfo sourceBaseInfo = new SourceBaseInfo();
            BeanUtils.copyProperties(source, sourceBaseInfo);

            ViewWithSourceBaseInfo viewWithSource = new ViewWithSourceBaseInfo();
            BeanUtils.copyProperties(view, viewWithSource);

            viewWithSource.setSource(sourceBaseInfo);
            return viewWithSource;
        } finally {
            releaseLock(lock);
        }
    }

    @Transactional
    private void insertView(View view) {
        if (viewExtendMapper.insert(view) <= 0) {
            throw new ServerException("Create view fail");
        }
    }

    private Source getSource(Long id) {
        Source source = sourceExtendMapper.selectByPrimaryKey(id);
        if (null == source) {
            log.error("Source({}) not found", id);
            throw new NotFoundException("Source is not found");
        }
        return source;
    }

    /**
     * 更新View
     *
     * @param viewUpdate
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean updateView(ViewUpdate viewUpdate, User user)
            throws NotFoundException, UnAuthorizedExecption, ServerException {

        Long id = viewUpdate.getId();
        View view = getView(id);

        Long projectId = view.getProjectId();
        checkWritePermission(entity, projectId, user, "update");

        String name = viewUpdate.getName();
        if (isExist(name, id, projectId)) {
            alertNameTaken(entity, name);
        }

        Source source = getSource(view.getSourceId());

        // 测试连接
        if (!DataProviderFactory.getProvider(source.getType()).test(source, user)) {
            throw new ServerException("Get source connection fail");
        }

        BaseLock lock = getLock(entity, name, projectId);
        if (lock != null && !lock.getLock()) {
            alertNameTaken(entity, name);
        }

        try {

            String originStr = view.toString();
            BeanUtils.copyProperties(viewUpdate, view);
            view.setUpdateBy(user.getId());
            view.setUpdateTime(new Date());

            updateView(view);
            optLogger.info("View({}) is updated by user({}), origin:{}", view.getId(), user.getId(), originStr);

            if (CollectionUtils.isEmpty(viewUpdate.getRoles())) {
                relRoleViewExtendMapper.deleteByViewId(id);
            }

            if (!StringUtils.isEmpty(viewUpdate.getVariable())) {
                insertRelRoleView(viewUpdate.getVariable(), viewUpdate.getRoles(), user, view);
            }

            return true;

        } finally {
            releaseLock(lock);
        }
    }

    @Transactional
    private void updateView(View view) {
        if (viewExtendMapper.update(view) <= 0) {
            throw new ServerException("Update view fail");
        }
    }

    private View getView(Long id) {
        View view = viewExtendMapper.selectByPrimaryKey(id);
        if (null == view) {
            log.error("View({}) not found", id);
            throw new NotFoundException("View is not found");
        }
        return view;
    }

    /**
     * 删除View
     *
     * @param id
     * @param user
     * @return
     */
    @Override
    @Transactional
    public boolean deleteView(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        View view = getView(id);

        ProjectDetail projectDetail = null;
        try {
            projectDetail = projectService.getProjectDetail(view.getProjectId(), user, false);
        } catch (UnAuthorizedExecption e) {
            alertUnAuthorized(entity, user, "delete");
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
        if (projectPermission.getViewPermission() < UserPermissionEnum.DELETE.getPermission()) {
            alertUnAuthorized(entity, user, "delete");
        }

        if (!CollectionUtils.isEmpty(widgetMapper.getWidgetsByWiew(id))) {
            throw new ServerException(
                    "The current view has been referenced, please delete the reference and then operate");
        }

        if (viewExtendMapper.deleteByPrimaryKey(id) <= 0) {
            throw new ServerException("Delete view fail");
        }

        optLogger.info("View({}) is delete by user({})", view.getId(), user.getId());
        relRoleViewExtendMapper.deleteByViewId(id);
        return true;
    }

    /**
     * 执行sql
     * 
     * @param executeParam
     * @param user
     * @return
     * @throws NotFoundException
     * @throws UnAuthorizedExecption
     * @throws ServerException
     */
    public PagingWithQueryColumns execute(ViewExecuteParam executeParam, User user)
            throws NotFoundException, UnAuthorizedExecption, ServerException {

        Source source = getSource(executeParam.getSourceId());

        ProjectDetail projectDetail = null;
        try {
            projectDetail = projectService.getProjectDetail(source.getProjectId(), user, false);
        } catch (UnAuthorizedExecption e) {
            throw new UnAuthorizedExecption("You have not permission to execute sql");
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
        if (projectPermission.getSourcePermission() == UserPermissionEnum.HIDDEN.getPermission()
                || projectPermission.getViewPermission() < UserPermissionEnum.WRITE.getPermission()) {
            throw new UnAuthorizedExecption("You have not permission to execute sql");
        }

        boolean isMaintainer = isMaintainer(user, projectDetail);

        PagingWithQueryColumns pagingWithQueryColumns = new PagingWithQueryColumns();
        try {

            StatementParser parser = ParserFactory.getParser(source.getType());

            String statement = executeParam.getSql();

            SqlQueryParam queryParam = SqlQueryParam.builder().limit(executeParam.getLimit())
                    .pageNo(executeParam.getPageNo()).pageSize(executeParam.getPageSize()).isMaintainer(isMaintainer)
                    .nativeQuery(true).type("query").build();

            statement = parser.parseSystemVars(statement, queryParam, source, user);
            statement = parser.parseAuthVars(statement, queryParam, null, source, user);

            Map<String, Object> queryParams = new HashMap<>();
            List<SqlVariable> variables = executeParam.getVariables();
            setQueryVarValue(queryParams, variables, null);
            statement = parser.parseQueryVars(statement, queryParam, queryParams, source, user);

            List<String> executeStatements = parser.getExecuteStatement(statement, queryParam, source, user);
            List<String> queryStatements = parser.getQueryStatement(statement, queryParam, source, user);

            if (!CollectionUtils.isEmpty(executeStatements)) {
                executeStatements.forEach(s -> {
                    DataUtils.execute(source, s, user);
                });
            }

            if (!CollectionUtils.isEmpty(queryStatements)) {
                for (String s : queryStatements) {
                    PagingParam paging = new PagingParam(0, 0, queryParam.getLimit());
                    pagingWithQueryColumns = DataUtils.syncQuery4Paging(source, s, paging, new HashSet<String>(), user);
                }
            }

        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new ServerException(e.getMessage());
        }

        return pagingWithQueryColumns;
    }

    private void setQueryVarValue(Map<String, Object> queryParams, List<SqlVariable> variables, List<Param> params) {
        for (SqlVariable var : variables) {
            SqlVariableTypeEnum typeEnum = SqlVariableTypeEnum.typeOf(var.getType());
            if (typeEnum != SqlVariableTypeEnum.QUERYVAR) {
                continue;
            }

            String name = var.getName().trim();
            Object value = null;
            if (!CollectionUtils.isEmpty(params)) {
                Param param = params.stream().filter(p -> p.getName().equals(name)).findFirst().get();
                value = SqlVariableValueTypeEnum.getValue(var.getValueType(), param.getValue(), var.isUdf());
            }

            if (value == null) {
                queryParams.put(name,
                        SqlVariableValueTypeEnum.getValues(var.getValueType(), var.getDefaultValues(), var.isUdf()));
                continue;
            }

            if (value instanceof List && ((List) value).size() > 0) {
                value = ((List) value).stream().collect(Collectors.joining(COMMA)).toString();
            }

            queryParams.put(name, value);
        }
    }

    private boolean isMaintainer(User user, ProjectDetail projectDetail) {
        return projectService.isMaintainer(projectDetail, user);
    }

    /**
     * 返回view源数据集
     *
     * @param id
     * @param executeParam
     * @param user
     * @return
     */
    @Override
    public Paging<Map<String, Object>> getData(Long id, WidgetQueryParam executeParam, User user)
            throws NotFoundException, UnAuthorizedExecption, ServerException {

        if (CollectionUtils.isEmpty(executeParam.getGroups())
                && CollectionUtils.isEmpty(executeParam.getAggregators())) {
            return null;
        }

        ViewWithSource viewWithSource = getViewWithSource(id);
        ProjectDetail projectDetail = projectService.getProjectDetail(viewWithSource.getProjectId(), user, false);
        if (!projectService.allowGetData(projectDetail, user)) {
            alertUnAuthorized(entity, user, "get data from");
        }

        if (viewWithSource.getSource() == null) {
            throw new NotFoundException("Source is not found");
        }

        if (StringUtils.isEmpty(viewWithSource.getSql())) {
            return null;
        }

        return getPagingData(projectService.isMaintainer(projectDetail, user), viewWithSource, executeParam, user);
    }

    private ViewWithSource getViewWithSource(Long id) {
        ViewWithSource viewWithSource = viewExtendMapper.getViewWithSource(id);
        if (null == viewWithSource) {
            log.info("View({}) not found", id);
            throw new NotFoundException("View is not found");
        }
        return viewWithSource;
    }

    private PagingWithQueryColumns getPagingData(boolean isMaintainer, ViewWithSource viewWithSource,
            WidgetQueryParam param, User user) throws ServerException {

        PagingWithQueryColumns pagingWithQueryColumns = null;

        String cacheKey = null;
        boolean withCache = param.getCache() && param.getExpired() > 0L;

        try {

            Source source = viewWithSource.getSource();
            List<Param> params = param.getParams();
            List<SqlVariable> variables = getVariables(viewWithSource.getVariable());
            List<RelRoleView> roleViewList = relRoleViewExtendMapper.getByUserAndView(user.getId(),
                    viewWithSource.getId());
            String statement = viewWithSource.getSql();

            StatementParser parser = ParserFactory.getParser(source.getType());
            SqlQueryParam sqlQueryParam = SqlQueryParam.builder()
                                            .limit(param.getLimit())
                                            .pageNo(param.getPageNo())
                                            .pageSize(param.getPageSize())
                                            .isMaintainer(isMaintainer)
                                            .nativeQuery(param.isNativeQuery())
                                            .aggregators(param.getAggregators())
                                            .groups(param.getGroups())
                                            .filters(param.getFilters())
                                            .type(param.getType())
                                            .build();
            
            if("distinct".equals(param.getType())) {
                sqlQueryParam.setColumns(((WidgetDistinctParam)param).getColumns());
            }

            String sWithSysVar = parser.parseSystemVars(statement, sqlQueryParam, source, user);

            Map<String, Object> queryParams = new HashMap<>();
            setQueryVarValue(queryParams, variables, params);
            String sWithQueryVar = parser.parseQueryVars(sWithSysVar, sqlQueryParam, queryParams, source, user);

            Map<String, List<String>> authParams = new HashMap<>();
            setAuthVarValue(authParams, variables, roleViewList, user);
            String sWithAuthVar = parser.parseAuthVars(sWithQueryVar, sqlQueryParam, authParams, source, user);

            List<String> executeStatements = parser.getExecuteStatement(sWithAuthVar, sqlQueryParam, source, user);
            List<String> queryStatements = parser.getQueryStatement(sWithAuthVar, sqlQueryParam, source, user);

            if (withCache) {
                cacheKey = getCacheKey(source, queryStatements.get(queryStatements.size() - 1), param);
                if (!param.getFlush()) {
                    pagingWithQueryColumns = getPagingDataByCache(cacheKey);
                    if (pagingWithQueryColumns != null) {
                        return pagingWithQueryColumns;
                    }
                }
            }

            if (!CollectionUtils.isEmpty(executeStatements)) {
                executeStatements.forEach(s -> {
                    DataUtils.execute(source, s, user);
                });
            }

            if (!CollectionUtils.isEmpty(queryStatements)) {
                for (String s : queryStatements) {
                    PagingParam paging = new PagingParam(0, 0, sqlQueryParam.getLimit());
                    pagingWithQueryColumns = DataUtils.syncQuery4Paging(source, s, paging, new HashSet<String>(), user);
                }
            }

            // get exclude columns
            Set<String> excludeColumns = new HashSet<>();
            Set<String> columns = getExcludeColumns(roleViewList);
            if (!CollectionUtils.isEmpty(columns) && !isMaintainer) {
                excludeColumns.addAll(columns);
            }

            // use local aggregator
            Map<String, Object> configMap = JSONUtils.toObject(viewWithSource.getConfig(), Map.class);
            if (!CollectionUtils.isEmpty(configMap) && "local".equals(configMap.get("aggregator"))) {
                pagingWithQueryColumns = getPagingDataByLocalAggregator(sWithQueryVar, sqlQueryParam, authParams, excludeColumns, viewWithSource, user);
            } else {
                PagingParam paging = new PagingParam(param.getPageNo(), param.getPageSize(),
                        param.getLimit());
                for (String s : queryStatements) {
                    pagingWithQueryColumns = DataUtils.syncQuery4Paging(source, s, paging, excludeColumns, user);
                }
            }

        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new ServerException(e.getMessage());
        }

        if (!StringUtils.isEmpty(cacheKey) && pagingWithQueryColumns != null
                && !CollectionUtils.isEmpty(pagingWithQueryColumns.getResultList())) {
            redisUtils.set(cacheKey, pagingWithQueryColumns, param.getExpired(), TimeUnit.SECONDS);
        }

        return pagingWithQueryColumns;
    }

    public List<SqlVariable> getVariables(String variable) {

		if (StringUtils.isEmpty(variable)) {
			return null;
		}

		try {
			return JSONUtils.toObjectArray(variable, SqlVariable.class);
		} catch (Exception e) {
			e.printStackTrace();
		}

		return null;
	}

    private void setAuthVarValue(Map<String, List<String>> authParams, List<SqlVariable> variables,
            List<RelRoleView> roleViewList, User user) {

        // get auth var value
        if (!CollectionUtils.isEmpty(authParams)) {
            ExecutorService pool = Executors.newFixedThreadPool(Math.max(8, authParams.size()));
            List<Future> futures = new ArrayList<>();
            try {
                authParams.forEach((k, v) -> {
                    futures.add(pool.submit(() -> {
                        // find var then change value
                        variables.stream().filter(variable -> variable.getName().equals(k)).findFirst()
                                .ifPresent(var -> {
                                    // change null to default value
                                    roleViewList.forEach(r -> {
                                        List<AuthParamValue> paramValues = JSONUtils.toObjectArray(r.getRowAuth(),
                                                AuthParamValue.class);
                                        paramValues.stream().filter(paramValue -> paramValue.getName().equals(k))
                                                .findFirst().ifPresent(paramValue -> {
                                                    var.setDefaultValues(paramValue.getValues());
                                                });
                                    });

                                    // change default value to dac value if dac value is not empty
                                    List<String> values = authVarUtils.getValue(var, user.getEmail());
                                    if (values == null) {
                                        authParams.put(k, Arrays.asList(new String[] { NO_AUTH_PERMISSION }));
                                    } else if (!values.isEmpty()) {
                                        authParams.put(k, values);
                                    }
                                });
                    }));
                });

                for (Future future : futures) {
                    try {
                        future.get();
                    } catch (ExecutionException e) {
                        pool.shutdownNow();
                        throw new ServerException(e.getMessage());
                    }
                }
            } catch (Exception e) {
                log.error(e.getMessage(), e);
            } finally {
                pool.shutdown();
            }
        }
    }

    private String getCacheKey(Source source, String sql, WidgetQueryParam executeParam) {
        String md5 = MD5Utils.getMD5(sql, true, 16);
        return "CACHE:" + source.getId() + AT_SIGN + md5 + AT_SIGN + executeParam.getPageNo() + AT_SIGN
                + executeParam.getPageSize() + AT_SIGN + executeParam.getLimit();
    }

    private PagingWithQueryColumns getPagingDataByCache(String key) {
        try {
            return (PagingWithQueryColumns) redisUtils.get(key);
        } catch (Exception e) {
            log.error(e.getMessage(), e);
        }

        return null;
    }

    private PagingWithQueryColumns getPagingDataByLocalAggregator(String statement, SqlQueryParam queryParam,
            Map<String, List<String>> authParams, Set<String> excludeColumns, ViewWithSource viewWithSource,
            User user) {

        PagingWithQueryColumns pagingWithQueryColumns = null;

        Stopwatch watch = Stopwatch.createStarted();

        Source source = viewWithSource.getSource();
        StatementParser parser = ParserFactory.getParser(source.getType());
        statement = parser.parseAuthVars(statement, queryParam, null, source, user);

        // query with out paging from source
        PagingParam pagingParam = new PagingParam(0, 0, queryParam.getLimit());
        List<String> queryStatements = parser.getQueryStatement(statement, queryParam, source, user);
        for (String s : queryStatements) {
            pagingWithQueryColumns = DataUtils.syncQuery4Paging(source, s, pagingParam, excludeColumns, user);
        }

        String viewModel = viewWithSource.getModel();
        Map<String, ColumnModel> viewModelMap = JSONUtils.toObject(viewModel,
                new TypeReference<Map<String, ColumnModel>>() {
                });

        // get header from view model
        List<ColumnModel> header = viewModelMap.keySet().stream().map(k -> {
            ColumnModel m = viewModelMap.get(k);
            m.setName(k);
            return m;
        }).collect(Collectors.toList());

        // get data from pagingWithQueryColumns
        List<List<Object>> data = new ArrayList<>();
        pagingWithQueryColumns.getResultList().forEach(r -> {
            List<Object> row = new ArrayList<>();
            header.forEach(h -> {
                row.add(r.get(h.getName()));
            });
            data.add(row);
        });

        // table name like T_md5(sourceId + @ + sql)
        String table = "T_"
                + MD5Utils.getMD5(source.getId() + AT_SIGN + queryStatements.get(queryStatements.size() - 1), true, 16);

        JdbcAggregator aggregator = (JdbcAggregator) AggregatorFactory.getAggregator("jdbc");
        aggregator.loadData(table, header, data, watch.elapsed(TimeUnit.MILLISECONDS));

        String sql = "select * from " + table;
        Set<String> expSet = edp.davinci.data.util.SqlParseUtils.getAuthExpression(sql, sqlTempDelimiter);
        if (!CollectionUtils.isEmpty(expSet)) {
            Map<String, String> expMap = edp.davinci.data.util.SqlParseUtils.getAuthParsedExp(expSet, sqlTempDelimiter, authParams);
            int i = 0;
            for (String value : expMap.values()) {
                if (i == 0) {
                    sql += (" where " + value);
                    continue;
                }
                sql += (" and " + value);
                i++;
            }
        }

        source = aggregator.getSource();
        parser = ParserFactory.getParser(aggregator.getAggregatorType());
        queryStatements = parser.getQueryStatement(sql, queryParam, source, user);

        // paging query from local aggregator
        pagingParam.setPageNo(queryParam.getPageNo());
        pagingParam.setPageSize(queryParam.getPageSize());
        pagingParam.setLimit(queryParam.getLimit());
        
        pagingWithQueryColumns = DataUtils.syncQuery4Paging(source, queryStatements.get(0), pagingParam,
                excludeColumns, user);

        return pagingWithQueryColumns;
    }

    /**
     * 获取结果集
     *
     * @param isMaintainer
     * @param viewWithSource
     * @param executeParam
     * @param user
     * @return
     * @throws ServerException
     */
    @Override
    public PagingWithQueryColumns getDataWithQueryColumns(boolean isMaintainer, ViewWithSource viewWithSource,
            WidgetQueryParam executeParam, User user) throws ServerException {
        return getPagingData(isMaintainer, viewWithSource, executeParam, user);
    }

    @Override
    public List<Map<String, Object>> getDistinctValue(Long id, WidgetDistinctParam param, User user)
            throws NotFoundException, ServerException, UnAuthorizedExecption {
        ViewWithSource viewWithSource = getViewWithSource(id);
        if (viewWithSource.getSource() == null) {
            throw new NotFoundException("Source is not found");
        }

        if (StringUtils.isEmpty(viewWithSource.getSql())) {
            return null;
        }

        ProjectDetail projectDetail = projectService.getProjectDetail(viewWithSource.getProjectId(), user, false);
        if (!projectService.allowGetData(projectDetail, user)) {
            alertUnAuthorized(entity, user, "get data from");
        }

        return getDistinctValue(projectService.isMaintainer(projectDetail, user), viewWithSource, param, user);
    }

    private List<Map<String, Object>> getDistinctValue(boolean isMaintainer, ViewWithSource viewWithSource,
            WidgetDistinctParam param, User user) throws ServerException {
        return getPagingData(isMaintainer, viewWithSource, param, user).getResultList();
    }

    private Set<String> getExcludeColumns(List<RelRoleView> roleViewList) {
        if (CollectionUtils.isEmpty(roleViewList)) {
            return null;
        }

        Set<String> columns = new HashSet<>();
        boolean isFullAuth = false;
        for (RelRoleView r : roleViewList) {
            if (!StringUtils.isEmpty(r.getColumnAuth())) {
                columns.addAll(JSONUtils.toObjectArray(r.getColumnAuth(), String.class));
            } else {
                isFullAuth = true;
                break;
            }
        }
        return isFullAuth ? null : columns;
    }

    private void insertRelRoleView(String sqlVarible, List<RelRoleViewDTO> roles, User user, View view) {

        List<SqlVariable> variables = JSONUtils.toObjectArray(sqlVarible, SqlVariable.class);
        if (CollectionUtils.isEmpty(roles)) {
            relRoleViewExtendMapper.deleteByViewId(view.getId());
            return;
        }

        roleParamThreadPool.submit(() -> {
            Set<String> vars = null, columns = null;

            if (!CollectionUtils.isEmpty(variables)) {
                vars = variables.stream().map(SqlVariable::getName).collect(Collectors.toSet());
            }
            if (!StringUtils.isEmpty(view.getModel())) {
                columns = JSONUtils.toObject(view.getModel(), Map.class).keySet();
            }

            Set<String> finalColumns = columns;
            Set<String> finalVars = vars;

            List<RelRoleView> relRoleViews = new ArrayList<>();
            roles.forEach(r -> {
                if (r.getRoleId().longValue() <= 0L) {
                    return;
                }

                String rowAuth = null, columnAuth = null;
                if (!StringUtils.isEmpty(r.getRowAuth())) {
                    List<Map> rowAuthList = JSONUtils.toObjectArray(r.getRowAuth(), Map.class);
                    if (!CollectionUtils.isEmpty(rowAuthList)) {
                        List<Map> newRowAuthList = new ArrayList<Map>();
                        for (Map jsonMap : rowAuthList) {
                            String name = (String) jsonMap.get(SQL_VARABLE_KEY);
                            if (finalVars.contains(name)) {
                                newRowAuthList.add(jsonMap);
                            }
                        }
                        rowAuth = JSONUtils.toString(newRowAuthList);
                        newRowAuthList.clear();
                    }
                }

                if (null != finalColumns && !StringUtils.isEmpty(r.getColumnAuth())) {
                    List<String> clms = JSONUtils.toObjectArray(r.getColumnAuth(), String.class);
                    List<String> collect = clms.stream().filter(c -> finalColumns.contains(c))
                            .collect(Collectors.toList());
                    columnAuth = JSONUtils.toString(collect);
                }

                RelRoleView relRoleView = new RelRoleView();
                relRoleView.setRoleId(r.getRoleId());
                relRoleView.setViewId(view.getId());
                relRoleView.setRowAuth(rowAuth);
                relRoleView.setColumnAuth(columnAuth);
                relRoleView.setCreateBy(user.getId());
                relRoleView.setCreateTime(new Date());
                relRoleViews.add(relRoleView);
            });

            if (!CollectionUtils.isEmpty(relRoleViews)) {
                relRoleViewExtendMapper.insertBatch(relRoleViews);
            }
        });
    }

    @Override
    public PagingWithQueryColumns getDataWithQueryColumns(Long id, WidgetQueryParam executeParam, User user)
            throws NotFoundException, UnAuthorizedExecption, ServerException {
        return (PagingWithQueryColumns) getData(id, executeParam, user);
    }

}
/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2019 EDP
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

package edp.davinci.service.impl;

import com.alibaba.druid.util.StringUtils;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedException;
import edp.core.model.Paginate;
import edp.core.model.PaginateWithQueryColumns;
import edp.core.utils.*;
import edp.davinci.core.common.Constants;
import edp.davinci.core.enums.*;
import edp.davinci.core.model.SqlEntity;
import edp.davinci.core.model.SqlFilter;
import edp.davinci.core.utils.SqlParseUtils;
import edp.davinci.dao.RelRoleViewMapper;
import edp.davinci.dao.SourceMapper;
import edp.davinci.dao.ViewMapper;
import edp.davinci.dao.WidgetMapper;
import edp.davinci.dto.projectDto.ProjectDetail;
import edp.davinci.dto.projectDto.ProjectPermission;
import edp.davinci.dto.sourceDto.SourceBaseInfo;
import edp.davinci.dto.viewDto.*;
import edp.davinci.model.*;
import edp.davinci.service.ProjectService;
import edp.davinci.service.ViewService;
import edp.davinci.service.excel.SQLContext;
import lombok.extern.slf4j.Slf4j;
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

import java.sql.SQLException;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

import static edp.core.consts.Consts.COMMA;
import static edp.core.consts.Consts.MINUS;
import static edp.davinci.core.common.Constants.NO_AUTH_PERMISSION;
import static edp.davinci.core.enums.SqlVariableTypeEnum.AUTHVAR;
import static edp.davinci.core.enums.SqlVariableTypeEnum.QUERYVAR;

@Slf4j
@Service("viewService")
public class
ViewServiceImpl extends BaseEntityService implements ViewService {

    private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

    @Autowired
    private ViewMapper viewMapper;

    @Autowired
    private SourceMapper sourceMapper;

    @Autowired
    private WidgetMapper widgetMapper;

    @Autowired
    private RelRoleViewMapper relRoleViewMapper;

    @Autowired
    private SqlUtils sqlUtils;

    @Autowired
    private RedisUtils redisUtils;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private SqlParseUtils sqlParseUtils;

    @Value("${sql_template_delimiter:$}")
    private String sqlTempDelimiter;

    private static final String SQL_VARABLE_KEY = "name";

    private static final CheckEntityEnum entity = CheckEntityEnum.VIEW;
    
    private static final  ExecutorService ROLEPARAM_THREADPOOL = Executors.newFixedThreadPool(8);

    @Override
    public boolean isExist(String name, Long id, Long projectId) {
        Long viewId = viewMapper.getByNameWithProjectId(name, projectId);
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
    public List<ViewBaseInfo> getViews(Long projectId, User user) throws NotFoundException, UnAuthorizedException, ServerException {

        ProjectDetail projectDetail = null;
        try {
            projectDetail = projectService.getProjectDetail(projectId, user, false);
        } catch (UnAuthorizedException e) {
            return null;
        }

        List<ViewBaseInfo> views = viewMapper.getViewBaseInfoByProject(projectId);
        if (null == views) {
            return null;
        }

        if (isHiddenPermission(projectDetail, user, true)) {
            return null;
        }

        return views;
    }

    private boolean isHiddenPermission(ProjectDetail projectDetail, User user, boolean basePermission) {
        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
        return (projectPermission.getVizPermission() == UserPermissionEnum.HIDDEN.getPermission() || basePermission)
                && projectPermission.getWidgetPermission() == UserPermissionEnum.HIDDEN.getPermission()
                && projectPermission.getViewPermission() == UserPermissionEnum.HIDDEN.getPermission();
    }

    @Override
    public ViewWithSourceBaseInfo getView(Long id, User user) throws NotFoundException, UnAuthorizedException, ServerException {
        ViewWithSourceBaseInfo view = viewMapper.getViewWithSourceBaseInfo(id);
        if (null == view) {
            throw new NotFoundException("view is not found");
        }

        ProjectDetail projectDetail = projectService.getProjectDetail(view.getProjectId(), user, false);
        if (isHiddenPermission(projectDetail, user, false)) {
            throw new UnAuthorizedException("Insufficient permissions");
        }

        List<RelRoleView> relRoleViews = relRoleViewMapper.getByView(view.getId());
        view.setRoles(relRoleViews);
        return view;
    }

    @Override
    public SQLContext getSQLContext(boolean isMaintainer, ViewWithSource viewWithSource, ViewExecuteParam executeParam, User user) {

        if (null == executeParam || (CollectionUtils.isEmpty(executeParam.getGroups()) && CollectionUtils.isEmpty(executeParam.getAggregators()))) {
            return null;
        }

        Source source = viewWithSource.getSource();
        if (null == source) {
            throw new NotFoundException("source is not found");
        }

        String sql = viewWithSource.getSql();
        if (StringUtils.isEmpty(sql)) {
            throw new NotFoundException("sql is not found");
        }

        SQLContext context = new SQLContext();
        //解析变量
        List<SqlVariable> variables = viewWithSource.getVariables();
        //解析sql
        SqlEntity sqlEntity = sqlParseUtils.parseSql(sql, variables, sqlTempDelimiter, user, isMaintainer);
        //列权限（只记录被限制访问的字段）
        Set<String> excludeColumns = new HashSet<>();

        packageParams(isMaintainer, viewWithSource.getId(), sqlEntity, variables, executeParam.getParams(), excludeColumns, user);

        String srcSql = sqlParseUtils.replaceParams(sqlEntity.getSql(), sqlEntity.getQuaryParams(), sqlEntity.getAuthParams(), sqlTempDelimiter);
        context.setExecuteSql(sqlParseUtils.getSqls(srcSql, Boolean.FALSE));

        List<String> querySqlList = sqlParseUtils.getSqls(srcSql, Boolean.TRUE);
        if (!CollectionUtils.isEmpty(querySqlList)) {
            buildQuerySql(querySqlList, source, executeParam);
            executeParam.addExcludeColumn(excludeColumns, source.getJdbcUrl(), source.getDbVersion());
            context.setQuerySql(querySqlList);
            context.setViewExecuteParam(executeParam);
        }
        if (!CollectionUtils.isEmpty(excludeColumns)) {
            List<String> excludeList = excludeColumns.stream().collect(Collectors.toList());
            context.setExcludeColumns(excludeList);
        }
        return context;
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
    public ViewWithSourceBaseInfo createView(ViewCreate viewCreate, User user) throws NotFoundException, UnAuthorizedException, ServerException {

        Long projectId = viewCreate.getProjectId();
        checkWritePermission(entity, projectId, user, "create");

        String name = viewCreate.getName();
        if (isExist(name, null, projectId)) {
            alertNameTaken(entity, name);
        }

        Long sourceId = viewCreate.getSourceId();
        Source source = getSource(sourceId);

        // 测试连接
        if (!sqlUtils.init(source).testConnection()) {
            throw new ServerException("get source connection fail");
        }

        BaseLock lock = getLock(entity, name, projectId);
        if (lock != null && !lock.getLock()) {
            alertNameTaken(entity, name);
        }

        try {
            View view = new View().createdBy(user.getId());
            BeanUtils.copyProperties(viewCreate, view);
            if (viewMapper.insert(view) <= 0) {
                throw new ServerException("create view fail");
            }

            optLogger.info("view ({}) is create by user (:{})", view.toString(), user.getId());

            if (!CollectionUtils.isEmpty(viewCreate.getRoles()) && !StringUtils.isEmpty(viewCreate.getVariable())) {
                checkAndInsertRoleParam(viewCreate.getVariable(), viewCreate.getRoles(), user, view);
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

    private Source getSource(Long id) {
        Source source = sourceMapper.getById(id);
        if (null == source) {
            log.error("source (:{}) not found", id);
            throw new NotFoundException("source is not found");
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
    public boolean updateView(ViewUpdate viewUpdate, User user) throws NotFoundException, UnAuthorizedException, ServerException {

        Long id = viewUpdate.getId();
        View view = getView(id);

        Long projectId = view.getProjectId();
        checkWritePermission(entity, projectId, user, "update");

        String name = viewUpdate.getName();
        if (isExist(name, id, projectId)) {
            alertNameTaken(entity, name);
        }

        Source source = getSource(view.getSourceId());

        //测试连接
        if (!sqlUtils.init(source).testConnection()) {
            throw new ServerException("get source connection fail");
        }

        BaseLock lock = getLock(entity, name, projectId);
        if (lock != null && !lock.getLock()) {
            alertNameTaken(entity, name);
        }

        try {

            String originStr = view.toString();
            BeanUtils.copyProperties(viewUpdate, view);
            view.updatedBy(user.getId());

            if (viewMapper.update(view) <= 0) {
                throw new ServerException("update view fail");
            }

            optLogger.info("view ({}) is updated by user(:{}), origin: ({})", view.toString(), user.getId(), originStr);

            if (CollectionUtils.isEmpty(viewUpdate.getRoles())) {
                relRoleViewMapper.deleteByViewId(id);
            }

            if (!StringUtils.isEmpty(viewUpdate.getVariable())) {
                checkAndInsertRoleParam(viewUpdate.getVariable(), viewUpdate.getRoles(), user, view);
            }

            return true;

        } finally {
            releaseLock(lock);
        }
    }

    private View getView(Long id) {
        View view = viewMapper.getById(id);
        if (null == view) {
            log.error("view ({}) not found", id);
            throw new NotFoundException("view is not found");
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
    public boolean deleteView(Long id, User user) throws NotFoundException, UnAuthorizedException, ServerException {

        View view = getView(id);

        ProjectDetail projectDetail = null;
        try {
            projectDetail = projectService.getProjectDetail(view.getProjectId(), user, false);
        } catch (UnAuthorizedException e) {
            throw new UnAuthorizedException("you have not permission to delete this view");
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
        if (projectPermission.getViewPermission() < UserPermissionEnum.DELETE.getPermission()) {
            throw new UnAuthorizedException("you have not permission to delete this view");
        }

        if (!CollectionUtils.isEmpty(widgetMapper.getWidgetsByWiew(id))) {
            throw new ServerException("The current view has been referenced, please delete the reference and then operate");
        }

        if (viewMapper.deleteById(id) <= 0) {
            throw new ServerException("delete view fail");
        }

        optLogger.info("view ( {} ) delete by user( :{} )", view.toString(), user.getId());
        relRoleViewMapper.deleteByViewId(id);
        return true;
    }


    /**
     * 执行sql
     *
     * @param executeSql
     * @param user
     * @return
     */
    @Override
    public PaginateWithQueryColumns executeSql(ViewExecuteSql executeSql, User user) throws NotFoundException, UnAuthorizedException, ServerException {

        Source source = getSource(executeSql.getSourceId());

        ProjectDetail projectDetail = null;
        try {
            projectDetail = projectService.getProjectDetail(source.getProjectId(), user, false);
        } catch (UnAuthorizedException e) {
            throw new UnAuthorizedException("you have not permission to execute sql");
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
        if (projectPermission.getSourcePermission() == UserPermissionEnum.HIDDEN.getPermission()
                || projectPermission.getViewPermission() < UserPermissionEnum.WRITE.getPermission()) {
            throw new UnAuthorizedException("you have not permission to execute sql");
        }

        //结构化Sql
        PaginateWithQueryColumns paginateWithQueryColumns = null;
        try {
            SqlEntity sqlEntity = sqlParseUtils.parseSql(executeSql.getSql(), executeSql.getVariables(), sqlTempDelimiter, user, true);
            if (null == sqlUtils || null == sqlEntity || StringUtils.isEmpty(sqlEntity.getSql())) {
                return paginateWithQueryColumns;
            }

            if (isMaintainer(user, projectDetail)) {
                sqlEntity.setAuthParams(null);
            }

            if (!CollectionUtils.isEmpty(sqlEntity.getQuaryParams())) {
                sqlEntity.getQuaryParams().forEach((k, v) -> {
                    if (v instanceof List && ((List) v).size() > 0) {
                        v = ((List) v).stream().collect(Collectors.joining(COMMA)).toString();
                    }
                    sqlEntity.getQuaryParams().put(k, v);
                });
            }

            String srcSql = sqlParseUtils.replaceParams(sqlEntity.getSql(), sqlEntity.getQuaryParams(),
                    sqlEntity.getAuthParams(), sqlTempDelimiter);

            SqlUtils sqlUtils = this.sqlUtils.init(source);

            List<String> executeSqlList = sqlParseUtils.getSqls(srcSql, false);

            List<String> querySqlList = sqlParseUtils.getSqls(srcSql, true);

            if (!CollectionUtils.isEmpty(executeSqlList)) {
                executeSqlList.forEach(sql -> sqlUtils.execute(sql));
            }

            if (!CollectionUtils.isEmpty(querySqlList)) {
                for (String sql : querySqlList) {
                    sql = SqlParseUtils.rebuildSqlWithFragment(sql);
                    paginateWithQueryColumns = sqlUtils.syncQuery4Paginate(sql, null, null, null, executeSql.getLimit(),
                            null);
                }
            }

        } catch (Exception e) {
            throw new ServerException(e.getMessage());
        }

        return paginateWithQueryColumns;
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
    public Paginate<Map<String, Object>> getData(Long id, ViewExecuteParam executeParam, User user) throws NotFoundException, UnAuthorizedException, ServerException, SQLException {

        if (null == executeParam || (CollectionUtils.isEmpty(executeParam.getGroups()) && CollectionUtils.isEmpty(executeParam.getAggregators()))) {
            return null;
        }

        ViewWithSource viewWithSource = getViewWithSource(id);
        ProjectDetail projectDetail = projectService.getProjectDetail(viewWithSource.getProjectId(), user, false);
        if (!projectService.allowGetData(projectDetail, user)) {
            throw new UnAuthorizedException("you have not permission to get data");
        }

        return getResultDataList(projectService.isMaintainer(projectDetail, user), viewWithSource, executeParam, user);
    }

    private ViewWithSource getViewWithSource(Long id) {
        ViewWithSource viewWithSource = viewMapper.getViewWithSource(id);
        if (null == viewWithSource) {
            log.info("view (:{}) not found", id);
            throw new NotFoundException("view is not found");
        }
        return viewWithSource;
    }

    public void buildQuerySql(List<String> querySqlList, Source source, ViewExecuteParam executeParam) {
        if (null == executeParam) {
            return;
        }

        // 构造参数， 原有的被传入的替换
        STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);
        ST st = stg.getInstanceOf("querySql");
        st.add("nativeQuery", executeParam.isNativeQuery());
        st.add("groups", executeParam.getGroups());

        if (executeParam.isNativeQuery()) {
            st.add("aggregators", executeParam.getAggregators());
        } else {
            st.add("aggregators", executeParam.getAggregators(source.getJdbcUrl(), source.getDbVersion()));
        }
        st.add("orders", executeParam.getOrders(source.getJdbcUrl(), source.getDbVersion()));
        st.add("filters", convertFilters(executeParam.getFilters(), source));
        st.add("keywordPrefix", sqlUtils.getKeywordPrefix(source.getJdbcUrl(), source.getDbVersion()));
        st.add("keywordSuffix", sqlUtils.getKeywordSuffix(source.getJdbcUrl(), source.getDbVersion()));

        for (int i = 0; i < querySqlList.size(); i++) {
            st.add("sql", querySqlList.get(i));
            querySqlList.set(i, st.render());
        }
    }

    public List<String> convertFilters(List<String> filterStrs, Source source) {
        List<String> whereClauses = new ArrayList<>();
        List<SqlFilter> filters = new ArrayList<>();
        try {
            if (null == filterStrs || filterStrs.isEmpty()) {
                return null;
            }

            for (String str : filterStrs) {
                SqlFilter obj = JSON.parseObject(str, SqlFilter.class);
                if (!StringUtils.isEmpty(obj.getName())) {
                    obj.setName(ViewExecuteParam.getField(obj.getName(), source.getJdbcUrl(), source.getDbVersion()));
                }
                filters.add(obj);
            }
            filters.forEach(filter -> whereClauses.add(SqlFilter.dealFilter(filter)));

        } catch (Exception e) {
            log.error("convertFilters error . filterStrs = {}, source = {}, filters = {} , whereClauses = {} ",
                    JSON.toJSON(filterStrs), JSON.toJSON(source), JSON.toJSON(filters), JSON.toJSON(whereClauses));
            throw e;
        }
        return whereClauses;
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
    public PaginateWithQueryColumns getResultDataList(boolean isMaintainer,
                                                      ViewWithSource viewWithSource,
                                                      ViewExecuteParam executeParam,
                                                      User user) throws ServerException, SQLException {

        PaginateWithQueryColumns paginate = null;

        if (null == executeParam || (CollectionUtils.isEmpty(executeParam.getGroups()) && CollectionUtils.isEmpty(executeParam.getAggregators()))) {
            return null;
        }

        if (null == viewWithSource.getSource()) {
            throw new NotFoundException("source is not found");
        }

        String cacheKey = null;
        try {

            if (StringUtils.isEmpty(viewWithSource.getSql())) {
                return paginate;
            }

            List<SqlVariable> variables = viewWithSource.getVariables();
            SqlEntity sqlEntity = sqlParseUtils.parseSql(viewWithSource.getSql(), variables, sqlTempDelimiter, user, isMaintainer);
            Set<String> excludeColumns = new HashSet<>();
            packageParams(isMaintainer, viewWithSource.getId(), sqlEntity, variables, executeParam.getParams(), excludeColumns, user);

            String srcSql = sqlParseUtils.replaceParams(sqlEntity.getSql(), sqlEntity.getQuaryParams(), sqlEntity.getAuthParams(), sqlTempDelimiter);

            Source source = viewWithSource.getSource();

            SqlUtils sqlUtils = this.sqlUtils.init(source);

            List<String> executeSqlList = sqlParseUtils.getSqls(srcSql, false);
            if (!CollectionUtils.isEmpty(executeSqlList)) {
                executeSqlList.forEach(sqlUtils::execute);
            }

            List<String> querySqlList = sqlParseUtils.getSqls(srcSql, true);
            if (!CollectionUtils.isEmpty(querySqlList)) {
                buildQuerySql(querySqlList, source, executeParam);
                executeParam.addExcludeColumn(excludeColumns, source.getJdbcUrl(), source.getDbVersion());

                if (null != executeParam.getCache() && executeParam.getCache() && executeParam.getExpired() > 0L) {

                    StringBuilder saltBuilder = new StringBuilder();
                    saltBuilder.append(executeParam.getPageNo());
                    saltBuilder.append(MINUS);
                    saltBuilder.append(executeParam.getLimit());
                    saltBuilder.append(MINUS);
                    saltBuilder.append(executeParam.getPageSize());
                    excludeColumns.forEach(saltBuilder::append);
                    cacheKey = MD5Util.getMD5(saltBuilder.toString() + querySqlList.get(querySqlList.size() - 1), true,
                            32);
                    if (!executeParam.getFlush()) {

                        try {
                            Object object = redisUtils.get(cacheKey);
                            if (null != object && executeParam.getCache()) {
                                paginate = (PaginateWithQueryColumns) object;
                                return paginate;
                            }
                        } catch (Exception e) {
                            log.warn("get data by cache: {}", e.getMessage());
                        }
                    }
                }

                for (String sql : querySqlList) {
                    paginate = sqlUtils.syncQuery4Paginate(SqlParseUtils.rebuildSqlWithFragment(sql),
                            executeParam.getPageNo(), executeParam.getPageSize(), executeParam.getTotalCount(),
                            executeParam.getLimit(), excludeColumns);
                }
            }

        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new ServerException(e.getMessage());
        }

        if (null != executeParam.getCache() && executeParam.getCache() && executeParam.getExpired() > 0L
                && null != paginate && !CollectionUtils.isEmpty(paginate.getResultList())) {
            redisUtils.set(cacheKey, paginate, executeParam.getExpired(), TimeUnit.SECONDS);
        }

        return paginate;
    }


    @Override
    public List<Map<String, Object>> getDistinctValue(Long id, DistinctParam param, User user) throws NotFoundException, ServerException, UnAuthorizedException {
        ViewWithSource viewWithSource = getViewWithSource(id);
        ProjectDetail projectDetail = projectService.getProjectDetail(viewWithSource.getProjectId(), user, false);
        if (!projectService.allowGetData(projectDetail, user)) {
            throw new UnAuthorizedException();
        }
        return getDistinctValueData(projectService.isMaintainer(projectDetail, user), viewWithSource, param, user);
    }


    @Override
    public List<Map<String, Object>> getDistinctValueData(boolean isMaintainer, ViewWithSource viewWithSource, DistinctParam param, User user) throws ServerException {

        try {

            if (StringUtils.isEmpty(viewWithSource.getSql())) {
                return null;
            }

            List<SqlVariable> variables = viewWithSource.getVariables();
            SqlEntity sqlEntity = sqlParseUtils.parseSql(viewWithSource.getSql(), variables, sqlTempDelimiter, user, isMaintainer);
            packageParams(isMaintainer, viewWithSource.getId(), sqlEntity, variables, param.getParams(), null, user);

            String srcSql = sqlParseUtils.replaceParams(sqlEntity.getSql(), sqlEntity.getQuaryParams(), sqlEntity.getAuthParams(), sqlTempDelimiter);

            Source source = viewWithSource.getSource();

            SqlUtils sqlUtils = this.sqlUtils.init(source);

            List<String> executeSqlList = sqlParseUtils.getSqls(srcSql, false);
            if (!CollectionUtils.isEmpty(executeSqlList)) {
                executeSqlList.forEach(sqlUtils::execute);
            }

            List<String> querySqlList = sqlParseUtils.getSqls(srcSql, true);
            if (!CollectionUtils.isEmpty(querySqlList)) {
                String cacheKey = null;
                if (null != param) {
                    STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);
                    ST st = stg.getInstanceOf("queryDistinctSql");
                    st.add("columns", param.getColumns());
                    st.add("filters", convertFilters(param.getFilters(), source));
                    st.add("sql", querySqlList.get(querySqlList.size() - 1));
                    st.add("keywordPrefix", SqlUtils.getKeywordPrefix(source.getJdbcUrl(), source.getDbVersion()));
                    st.add("keywordSuffix", SqlUtils.getKeywordSuffix(source.getJdbcUrl(), source.getDbVersion()));

                    String sql = st.render();
                    querySqlList.set(querySqlList.size() - 1, sql);

                    if (null != param.getCache() && param.getCache() && param.getExpired().longValue() > 0L) {
                        cacheKey = MD5Util.getMD5("DISTINCI" + sql, true, 32);

                        try {
                            Object object = redisUtils.get(cacheKey);
                            if (null != object) {
                                return (List) object;
                            }
                        } catch (Exception e) {
                            log.warn("get distinct value by cache: {}", e.getMessage());
                        }
                    }
                }
                List<Map<String, Object>> list = null;
                for (String sql : querySqlList) {
                    list = sqlUtils.query4List(SqlParseUtils.rebuildSqlWithFragment(sql), -1);
                }

                if (null != param.getCache() && param.getCache() && param.getExpired().longValue() > 0L) {
                    redisUtils.set(cacheKey, list, param.getExpired(), TimeUnit.SECONDS);
                }

                if (null != list) {
                    return list;
                }
            }

        } catch (Exception e) {
            log.error(e.getMessage(), e);
            throw new ServerException(e.getMessage());
        }

        return null;
    }

    public void packageParams(boolean isProjectMaintainer, Long viewId, SqlEntity sqlEntity, List<SqlVariable> variables, List<Param> paramList, Set<String> excludeColumns, User user) {

        List<SqlVariable> queryVariables = getQueryVariables(variables);
        List<SqlVariable> authVariables = null;
        if (!isProjectMaintainer) {
            List<RelRoleView> roleViewList = relRoleViewMapper.getByUserAndView(user.getId(), viewId);
            authVariables = getAuthVariables(roleViewList, variables);
            if (null != excludeColumns) {
                Set<String> columns = getExcludeColumnsViaOneView(roleViewList);
                if (!CollectionUtils.isEmpty(columns)) {
                    excludeColumns.addAll(columns);
                }
            }
        }

        //查询参数
        if (!CollectionUtils.isEmpty(queryVariables) && !CollectionUtils.isEmpty(sqlEntity.getQuaryParams())) {
            if (!CollectionUtils.isEmpty(paramList)) {
                Map<String, List<SqlVariable>> map = queryVariables.stream().collect(Collectors.groupingBy(SqlVariable::getName));
                paramList.forEach(p -> {
                    if (map.containsKey(p.getName())) {
                        List<SqlVariable> list = map.get(p.getName());
                        if (!CollectionUtils.isEmpty(list)) {
                            SqlVariable v = list.get(list.size() - 1);
                            if (null == sqlEntity.getQuaryParams()) {
                                sqlEntity.setQuaryParams(new HashMap<>());
                            }
                            sqlEntity.getQuaryParams().put(p.getName().trim(), SqlVariableValueTypeEnum.getValue(v.getValueType(), p.getValue(), v.isUdf()));
                        }
                    }
                });
            }

            sqlEntity.getQuaryParams().forEach((k, v) -> {
                if (v instanceof List && ((List) v).size() > 0) {
                    v = ((List) v).stream().collect(Collectors.joining(COMMA)).toString();
                }
                sqlEntity.getQuaryParams().put(k, v);
            });
        }

        //如果当前用户是project的维护者，直接不走行权限
        if (isProjectMaintainer) {
            sqlEntity.setAuthParams(null);
            return;
        }

        //权限参数
        if (!CollectionUtils.isEmpty(authVariables)) {
            ExecutorService executorService = Executors.newFixedThreadPool(authVariables.size() > 8 ? 8 : authVariables.size());
            Map<String, Set<String>> map = new Hashtable<>();
            List<Future> futures = new ArrayList<>(authVariables.size());
            try {
                authVariables.forEach(sqlVariable -> {
                    futures.add(executorService.submit(() -> {
                        if (null != sqlVariable) {
                            Set<String> vSet = null;
                            if (map.containsKey(sqlVariable.getName().trim())) {
                                vSet = map.get(sqlVariable.getName().trim());
                            } else {
                                vSet = new HashSet<>();
                            }

                            List<String> values = sqlParseUtils.getAuthVarValue(sqlVariable, user.getEmail());
                            if (null == values) {
                                vSet.add(NO_AUTH_PERMISSION);
                            } else if (!values.isEmpty()) {
                                vSet.addAll(values);
                            }
                            map.put(sqlVariable.getName().trim(), vSet);
                        }
                    }));
                });
                try {
                    for (Future future : futures) {
                        future.get();
                    }
                } catch (ExecutionException e) {
                    executorService.shutdownNow();
                    throw new ServerException(e.getMessage());
                }
            } catch (InterruptedException e) {
                log.error(e.getMessage(), e);
            } finally {
                executorService.shutdown();
            }

            if (!CollectionUtils.isEmpty(map)) {
                if (null == sqlEntity.getAuthParams()) {
                    sqlEntity.setAuthParams(new HashMap<>());
                }
                map.forEach((k, v) -> sqlEntity.getAuthParams().put(k, new ArrayList<String>(v)));
            }
        } else {
            sqlEntity.setAuthParams(null);
        }
    }


    private Set<String> getExcludeColumnsViaOneView(List<RelRoleView> roleViewList) {
        if (!CollectionUtils.isEmpty(roleViewList)) {
            Set<String> columns = new HashSet<>();
            boolean isFullAuth = false;
            for (RelRoleView r : roleViewList) {
                if (!StringUtils.isEmpty(r.getColumnAuth())) {
                    columns.addAll(JSONObject.parseArray(r.getColumnAuth(), String.class));
                } else {
                    isFullAuth = true;
                    break;
                }
            }
            return isFullAuth ? null : columns;
        }
        return null;
    }


    private List<SqlVariable> getQueryVariables(List<SqlVariable> variables) {
        if (!CollectionUtils.isEmpty(variables)) {
            return variables.stream().filter(v -> QUERYVAR == SqlVariableTypeEnum.typeOf(v.getType())).collect(Collectors.toList());
        }
        return null;
    }

    private List<SqlVariable> getAuthVariables(List<RelRoleView> roleViewList, List<SqlVariable> variables) {

        if (CollectionUtils.isEmpty(variables)) {
            return null;
        }

        List<SqlVariable> list = new ArrayList<>();
        variables.forEach(v -> {
            if (null != v.getChannel()) {
                list.add(v);
            }
        });

        if (CollectionUtils.isEmpty(roleViewList)) {
            return list;
        }

        List<SqlVariable> authVars = variables.stream()
                .filter(v -> AUTHVAR == SqlVariableTypeEnum.typeOf(v.getType())).collect(Collectors.toList());

        Map<String, SqlVariable> authVarMap = new HashMap<>();
        authVars.forEach(v -> authVarMap.put(v.getName(), v));

        List<SqlVariable> dacVars = authVars.stream()
                .filter(v -> null != v.getChannel() && !v.getChannel().getBizId().equals(0L))
                .collect(Collectors.toList());

        roleViewList.forEach(r -> {
            if (!StringUtils.isEmpty(r.getRowAuth())) {
                List<AuthParamValue> authParamValues = JSONObject.parseArray(r.getRowAuth(), AuthParamValue.class);
                authVarMap.forEach((k, v) -> {
                    SqlVariable sqlVariable = v;
                    Optional<AuthParamValue> optional = authParamValues.stream().filter(p -> k.equals(p.getName())).findFirst();

                    List<Object> defaultValues = sqlVariable.getDefaultValues();
                    // first time defaultValues will be null
                    if (defaultValues == null) {
                        // empty list means has all data auth
                        sqlVariable.setDefaultValues(new ArrayList<>());
                        optional.ifPresent(p -> {
                            if (p.isEnable()) {
                                if (CollectionUtils.isEmpty(p.getValues())) {
                                    sqlVariable.setDefaultValues(Arrays.asList(new String[]{NO_AUTH_PERMISSION}));
                                } else {
                                    sqlVariable.setDefaultValues(p.getValues());
                                }
                            }
                        });
                        return;
                    }

                    if (optional.isPresent()) {
                        AuthParamValue p = optional.get();
                        if (p.isEnable()) {
                            if (!CollectionUtils.isEmpty(p.getValues())) {
                                boolean denied = defaultValues.size() == 1 && defaultValues.get(0).equals(NO_AUTH_PERMISSION);
                                boolean disable = defaultValues.size() == 0;
                                if (denied) {
                                    sqlVariable.setDefaultValues(p.getValues());
                                } else if (!disable) {
                                    sqlVariable.getDefaultValues().addAll(p.getValues());
                                }
                            }
                        } else {
                            sqlVariable.setDefaultValues(new ArrayList<>());
                        }
                        return;
                    }

                    sqlVariable.setDefaultValues(new ArrayList<>());

                });

                list.addAll(authVarMap.values());
            } else {
                list.addAll(dacVars);
            }
        });

        return list;
    }

    private void checkAndInsertRoleParam(String sqlVariable, List<RelRoleViewDto> roles, User user, View view) {
        List<SqlVariable> variables = JSONObject.parseArray(sqlVariable, SqlVariable.class);
        if (CollectionUtils.isEmpty(roles)) {
            relRoleViewMapper.deleteByViewId(view.getId());
            return;
        }
        
        ROLEPARAM_THREADPOOL.execute(()->{
			Set<String> vars = null, columns = null;

			if (!CollectionUtils.isEmpty(variables)) {
				vars = variables.stream().map(SqlVariable::getName).collect(Collectors.toSet());
			}
			if (!StringUtils.isEmpty(view.getModel())) {
				columns = JSONObject.parseObject(view.getModel(), HashMap.class).keySet();
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
					JSONArray rowAuthArray = JSONObject.parseArray(r.getRowAuth());
					if (!CollectionUtils.isEmpty(rowAuthArray)) {
						JSONArray newRowAuthArray = new JSONArray();
						for (int i = 0; i < rowAuthArray.size(); i++) {
							JSONObject rowAuthObj = rowAuthArray.getJSONObject(i);
							String name = rowAuthObj.getString(SQL_VARABLE_KEY);
							if (finalVars.contains(name)) {
								newRowAuthArray.add(rowAuthObj);
							}
						}
						rowAuth = newRowAuthArray.toJSONString();
						newRowAuthArray.clear();
					}
				}

				if (null != finalColumns && !StringUtils.isEmpty(r.getColumnAuth())) {
					List<String> clms = JSONObject.parseArray(r.getColumnAuth(), String.class);
					List<String> collect = clms.stream().filter(c -> finalColumns.contains(c))
							.collect(Collectors.toList());
					columnAuth = JSONObject.toJSONString(collect);
				}

				RelRoleView relRoleView = new RelRoleView(view.getId(), r.getRoleId(), rowAuth, columnAuth)
						.createdBy(user.getId());
				relRoleViews.add(relRoleView);
			});

			if (!CollectionUtils.isEmpty(relRoleViews)) {
				relRoleViewMapper.insertBatch(relRoleViews);
			}
        });
    }
}


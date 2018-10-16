package edp.davinci.service.impl;

import com.alibaba.druid.util.StringUtils;
import com.alibaba.fastjson.JSONObject;
import edp.core.enums.HttpCodeEnum;
import edp.core.exception.ServerException;
import edp.core.exception.SourceException;
import edp.core.model.QueryColumn;
import edp.core.model.TableInfo;
import edp.core.utils.*;
import edp.davinci.common.service.CommonService;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.UserOrgRoleEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.core.enums.UserTeamRoleEnum;
import edp.davinci.core.model.SqlEntity;
import edp.davinci.core.utils.SqlParseUtils;
import edp.davinci.dao.*;
import edp.davinci.dto.projectDto.UserMaxProjectPermission;
import edp.davinci.dto.sourceDto.SourceBaseInfo;
import edp.davinci.dto.sourceDto.SourceWithProject;
import edp.davinci.dto.viewDto.*;
import edp.davinci.model.*;
import edp.davinci.service.ViewService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.stringtemplate.v4.ST;
import org.stringtemplate.v4.STGroup;
import org.stringtemplate.v4.STGroupFile;

import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.concurrent.TimeUnit;

import static edp.core.consts.Consts.*;

@Slf4j
@Service("viewService")
public class ViewServiceImpl extends CommonService<View> implements ViewService {

    @Autowired
    private ViewMapper viewMapper;

    @Autowired
    private ProjectMapper projectMapper;

    @Autowired
    private SourceMapper sourceMapper;

    @Autowired
    private RelUserOrganizationMapper relUserOrganizationMapper;

    @Autowired
    private RelUserTeamMapper relUserTeamMapper;

    @Autowired
    private WidgetMapper widgetMapper;

    @Autowired
    private RelTeamProjectMapper relTeamProjectMapper;

    @Autowired
    private SqlUtils sqlUtils;

    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    private RedisUtils redisUtils;

    @Value("${sql_template_delimiter:$}")
    private String sqlTempDelimiter;

    private static final String viewDataCacheKey = "view_data_";

    private static final String viewMetaCacheKey = "view_meta_";

    private static final String viewTeamVarKey = "team";


    @Override
    public synchronized boolean isExist(String name, Long id, Long projectId) {
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
     * @param request
     * @return
     */
    @Override
    public ResultMap getViews(Long projectId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Project project = projectMapper.getById(projectId);

        if (null == project) {
            log.info("project {} not found", project);
            return resultMap.successAndRefreshToken(request).message("project not found");
        }

        if (!allowRead(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED);
        }

        List<ViewWithSourceBaseInfo> views = viewMapper.getByProject(projectId);

//        if (null != views && views.size() > 0) {
//
//            //获取当前用户在organization的role
//            RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());
//
//            //当前用户是project的创建者和organization的owner，直接返回
//            if (!isProjectAdmin(project, user) && (null == orgRel || orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole())) {
//                //查询project所属team中当前用户最高角色
//                short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(projectId, user.getId());
//
//                //如果当前用户是team的matainer 全部返回，否则验证 当前用户team对project的权限
//                if (maxTeamRole == UserTeamRoleEnum.MEMBER.getRole()) {
//                    //查询当前用户在的 project所属team对project view的最高权限
//                    short maxViewPermission = relTeamProjectMapper.getMaxViewPermission(projectId, user.getId());
//                    if (maxViewPermission == UserPermissionEnum.HIDDEN.getPermission()) {
//                        //隐藏
//                        views = null;
//                    }
//                }
//            }
//        }

        return resultMap.successAndRefreshToken(request).payloads(views);
    }

    /**
     * 新建View
     *
     * @param viewCreate
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap createView(ViewCreate viewCreate, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Project project = projectMapper.getById(viewCreate.getProjectId());
        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to create view", user.getUsername());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to create view");
        }

        if (isExist(viewCreate.getName(), null, viewCreate.getProjectId())) {
            log.info("the view {} name is already taken", viewCreate.getName());
            return resultMap.failAndRefreshToken(request).message("the view name is already taken");
        }


        Source source = sourceMapper.getById(viewCreate.getSourceId());
        if (null == source) {
            log.info("source not found");
            return resultMap.failAndRefreshToken(request).message("source not found");
        }

        //测试连接
        boolean testConnection = false;
        try {
            testConnection = sqlUtils.init(source.getJdbcUrl(), source.getUsername(), source.getPassword()).testConnection();
        } catch (SourceException e) {
            log.error(e.getMessage());
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        if (testConnection) {
            View view = new View();
            BeanUtils.copyProperties(viewCreate, view);

            int insert = viewMapper.insert(view);
            if (insert > 0) {
                SourceBaseInfo sourceBaseInfo = new SourceBaseInfo();
                BeanUtils.copyProperties(source, sourceBaseInfo);

                ViewWithSourceBaseInfo viewWithSource = new ViewWithSourceBaseInfo();
                BeanUtils.copyProperties(view, viewWithSource);
                viewWithSource.setSource(sourceBaseInfo);
                return resultMap.successAndRefreshToken(request).payload(viewWithSource);
            } else {
                return resultMap.failAndRefreshToken(request).message("create view fail");
            }
        } else {
            return resultMap.failAndRefreshToken(request).message("get source connection fail");
        }
    }

    /**
     * 更新View
     *
     * @param viewUpdate
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateView(ViewUpdate viewUpdate, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        ViewWithProjectAndSource viewWithProjectAndSource = viewMapper.getViewWithProjectAndSourceById(viewUpdate.getId());
        if (null == viewWithProjectAndSource) {
            return resultMap.failAndRefreshToken(request).message("view not found");
        }

        Project project = viewWithProjectAndSource.getProject();
        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to update view", user.getUsername());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to update view");
        }

        if (isExist(viewUpdate.getName(), viewUpdate.getId(), project.getId())) {
            log.info("the view {} name is already taken", viewUpdate.getName());
            return resultMap.failAndRefreshToken(request).message("the view name is already taken");
        }

        Source source = viewWithProjectAndSource.getSource();
        if (null == source) {
            log.info("source not found");
            return resultMap.failAndRefreshToken(request).message("source not found");
        }

        //测试连接
        boolean testConnection = false;
        try {
            testConnection = sqlUtils.init(source.getJdbcUrl(), source.getUsername(), source.getPassword()).testConnection();
        } catch (SourceException e) {
            log.error(e.getMessage());
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        if (testConnection) {
            View view = new View();
            BeanUtils.copyProperties(viewUpdate, view);
            view.setProjectId(project.getId());
            viewMapper.update(view);
            return resultMap.successAndRefreshToken(request);
        } else {
            return resultMap.failAndRefreshToken(request).message("get source connection fail");
        }
    }

    /**
     * 删除View
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap deleteView(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        ViewWithProjectAndSource viewWithProjectAndSource = viewMapper.getViewWithProjectAndSourceById(id);

        if (null == viewWithProjectAndSource) {
            log.info("view (:{}) not found", id);
            return resultMap.failAndRefreshToken(request).message("view not found");
        }

        if (null == viewWithProjectAndSource.getProject()) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowDelete(viewWithProjectAndSource.getProject(), user)) {
            log.info("user {} have not permisson to delete the view {}", user.getUsername(), id);
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to delete the view");
        }

        List<Widget> widgets = widgetMapper.getWidgetsByWiew(id);
        if (null != widgets && widgets.size() > 0) {
            return resultMap.failAndRefreshToken(request).message("The current view has been referenced, please delete the reference and then operate");
        }

        viewMapper.deleteById(id);

        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 获取View对应Source的Schema
     *
     * @param sourceId
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getSourceSchema(Long sourceId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        SourceWithProject sourceWithProject = sourceMapper.getSourceWithProjectById(sourceId);
        if (null == sourceWithProject) {
            log.info("source (:{}) not found", sourceId);
            return resultMap.failAndRefreshToken(request).message("source not found");
        }

        Project project = sourceWithProject.getProject();
        if (null == project) {
            log.info("project (:{}) not found", sourceWithProject.getProjectId());
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //获取当前用户在organization的role
        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());

        List<TableInfo> tableList = null;

        try {
            tableList = sqlUtils.init(sourceWithProject.getJdbcUrl(), sourceWithProject.getUsername(), sourceWithProject.getPassword()).getTableList();
        } catch (SourceException e) {
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        if (null != tableList) {
            //当前用户是project的创建者和organization的owner，直接返回
            if (!isProjectAdmin(project, user) && (null == orgRel || orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole())) {
                //查询project所属team中当前用户最高角色
                short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(project.getId(), user.getId());

                //如果当前用户是team的matainer 全部返回，否则验证 当前用户team对project的权限
                if (maxTeamRole == UserTeamRoleEnum.MEMBER.getRole()) {

                    //查询当前用户在的 project所属team对project source的最高权限
                    short maxSourcePermission = relTeamProjectMapper.getMaxSourcePermission(project.getId(), user.getId());

                    if (maxSourcePermission == UserPermissionEnum.HIDDEN.getPermission()) {
                        tableList = null;
                    }
                }
            }
        }

        return resultMap.successAndRefreshToken(request).payloads(tableList);
    }

    /**
     * 执行sql
     *
     * @param executeSql
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap executeSql(ViewExecuteSql executeSql, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        SourceWithProject sourceWithProject = sourceMapper.getSourceWithProjectById(executeSql.getSourceId());
        if (null == sourceWithProject) {
            log.info("source (:{}) not found", executeSql.getSourceId());
            return resultMap.failAndRefreshToken(request).message("source not found");
        }

        Project project = sourceWithProject.getProject();
        if (null == project) {
            log.info("project (:{}) not found", sourceWithProject.getProjectId());
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //获取当前用户在organization的role
        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());

        //当前用户是project的创建者和organization的owner，直接返回
        if (!isProjectAdmin(project, user) && (null == orgRel || orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole())) {
            //查询project所属team中当前用户最高角色
            short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(project.getId(), user.getId());

            //如果当前用户是team的matainer 全部返回，否则验证 当前用户team对project的权限
            if (maxTeamRole == UserTeamRoleEnum.MEMBER.getRole()) {
                short maxViewPermission = relTeamProjectMapper.getMaxViewPermission(project.getId(), user.getId());
                if (maxViewPermission == UserPermissionEnum.HIDDEN.getPermission()) {
                    return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to execute sql in this view");
                }
            }
        }

        //结构化Sql
        List<Map<String, Object>> resultList = null;
        List<QueryColumn> columns = null;
        try {
            SqlEntity sqlEntity = SqlParseUtils.parseSql(executeSql.getSql(), sqlTempDelimiter);
            if (null != sqlUtils && null != sqlEntity) {
                if (!StringUtils.isEmpty(sqlEntity.getSql())) {
                    String srcSql = SqlParseUtils.replaceParams(sqlEntity.getSql(), sqlEntity.getQuaryParams(), sqlEntity.getTeamParams(), sqlTempDelimiter);
                    SqlUtils sqlUtils = this.sqlUtils.init(sourceWithProject.getJdbcUrl(), sourceWithProject.getUsername(), sourceWithProject.getPassword());
                    List<String> executeSqlList = SqlParseUtils.getExecuteSqlList(srcSql);
                    List<String> querySqlList = SqlParseUtils.getQuerySqlList(srcSql);
                    if (null != executeSqlList && executeSqlList.size() > 0) {
                        for (String sql : executeSqlList) {
                            sqlUtils.execute(sql);
                        }
                    }
                    if (null != querySqlList && querySqlList.size() > 0) {
                        for (String sql : querySqlList) {
                            resultList = sqlUtils.syncQuery4List(sql);
                        }
                        columns = sqlUtils.getColumns(querySqlList.get(querySqlList.size() - 1));
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        return resultMap.successAndRefreshToken(request).payload(new ExecuteSqlResult(columns, resultList));
    }

    /**
     * 返回view源数据集
     *
     * @param id
     * @param executeParam
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getData(Long id, ViewExecuteParam executeParam, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);
        List<Map<String, Object>> list = null;

        if (null == executeParam || (CollectionUtils.isEmpty(executeParam.getGroups()) && CollectionUtils.isEmpty(executeParam.getAggregators()))) {
            return resultMap.successAndRefreshToken(request).payloads(null);
        }

        ViewWithProjectAndSource viewWithProjectAndSource = viewMapper.getViewWithProjectAndSourceById(id);
        if (null == viewWithProjectAndSource) {
            log.info("view (:{}) not found", id);
            return resultMap.failAndRefreshToken(request).message("view not found");
        }

        Project project = viewWithProjectAndSource.getProject();
        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //获取当前用户在organization的role
        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());

        //当前用户是project的创建者和organization的owner，直接返回
        if (!allowGetData(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to get data");
        }

        try {
            list = getResultDataList(viewWithProjectAndSource, executeParam, user);
        } catch (ServerException e) {
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        return resultMap.successAndRefreshToken(request).payloads(list);
    }


    /**
     * 构造查询语句
     *
     * @param sqlEntity
     * @param executeParam
     * @return
     */
    public void buildQuerySql(List<String> querySqlList, SqlEntity sqlEntity, ViewExecuteParam executeParam, Source source) {
        if (null != sqlEntity && !StringUtils.isEmpty(sqlEntity.getSql())) {
            if (null != executeParam) {
                //构造参数， 原有的被传入的替换
                if (null == executeParam.getGroups() || executeParam.getGroups().length < 1) {
                    executeParam.setGroups(null);
                }

                if (null == executeParam.getFilters() || executeParam.getFilters().length < 1) {
                    executeParam.setFilters(null);
                }

                STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);
                ST st = stg.getInstanceOf("querySql");
                st.add("groups", executeParam.getGroups());
                st.add("aggregators", executeParam.getAggregators(source.getJdbcUrl()));
                st.add("orders", executeParam.getOrders(source.getJdbcUrl()));
                st.add("filters", executeParam.getFilters());
                st.add("keywordPrefix", sqlUtils.getKeywordPrefix(source.getJdbcUrl()));
                st.add("keywordSuffix", sqlUtils.getKeywordSuffix(source.getJdbcUrl()));
                st.add("sql", querySqlList.get(querySqlList.size() - 1));

                querySqlList.set(querySqlList.size() - 1, st.render());
            }
        }
    }


    /**
     * 获取结果集
     *
     * @param viewWithProjectAndSource
     * @param executeParam
     * @param user
     * @return
     * @throws ServerException
     */
    @Override
    public List<Map<String, Object>> getResultDataList(ViewWithProjectAndSource viewWithProjectAndSource, ViewExecuteParam executeParam, User user) throws ServerException {
        List<Map<String, Object>> list = null;

        if (null == executeParam || (CollectionUtils.isEmpty(executeParam.getGroups()) && CollectionUtils.isEmpty(executeParam.getAggregators()))) {
            return null;
        }

        String cacheKey = null;
        try {

            if (!StringUtils.isEmpty(viewWithProjectAndSource.getSql())) {
                SqlEntity sqlEntity = SqlParseUtils.parseSql(viewWithProjectAndSource.getSql(), sqlTempDelimiter);

                Source source = viewWithProjectAndSource.getSource();
                if (null == viewWithProjectAndSource) {
                    throw new ServerException("source not found");
                }
                if (!StringUtils.isEmpty(sqlEntity.getSql())) {
                    Map<String, List<String>> teamParams = parseTeamParams(sqlEntity.getTeamParams(), viewWithProjectAndSource, user, sqlTempDelimiter);
                    Map<String, String> queryParam = getQueryParam(sqlEntity, executeParam);

                    cacheKey = getCacheKey(viewDataCacheKey, viewWithProjectAndSource, executeParam, teamParams, queryParam);
                    try {
                        Object object = redisUtils.get(cacheKey);
                        if (null != object && executeParam.getCache()) {
                            list = (List<Map<String, Object>>) object;
                            return list;
                        }
                    } catch (Exception e) {
                        log.warn("get data by cache: {}", e.getMessage());
                    }

                    String srcSql = SqlParseUtils.replaceParams(sqlEntity.getSql(), queryParam, teamParams, sqlTempDelimiter);

                    SqlUtils sqlUtils = this.sqlUtils.init(source);
                    List<String> executeSqlList = SqlParseUtils.getExecuteSqlList(srcSql);
                    List<String> querySqlList = SqlParseUtils.getQuerySqlList(srcSql);
                    if (null != executeSqlList && executeSqlList.size() > 0) {
                        for (String sql : executeSqlList) {
                            sqlUtils.execute(sql);
                        }
                    }
                    if (null != querySqlList && querySqlList.size() > 0) {
                        buildQuerySql(querySqlList, sqlEntity, executeParam, source);
                        for (String sql : querySqlList) {
                            list = sqlUtils.syncQuery4ListByLimit(sql, executeParam.getLimit());
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        }

        if (null != executeParam
                && null != executeParam.getCache()
                && executeParam.getCache()
                && executeParam.getExpired() > 0L
                && null != list && list.size() > 0) {
            redisUtils.set(cacheKey, list, executeParam.getExpired(), TimeUnit.SECONDS);
        }

        return list;
    }

    /**
     * 获取查询meta
     *
     * @param viewWithProjectAndSource
     * @param executeParam
     * @param user
     * @return
     * @throws ServerException
     */
    @Override
    public List<QueryColumn> getResultMeta(ViewWithProjectAndSource viewWithProjectAndSource, ViewExecuteParam executeParam, User user) throws ServerException {
        List<QueryColumn> columns = null;

        String cacheKey = null;
        try {

            if (!StringUtils.isEmpty(viewWithProjectAndSource.getSql())) {
                SqlEntity sqlEntity = SqlParseUtils.parseSql(viewWithProjectAndSource.getSql(), sqlTempDelimiter);

                Source source = viewWithProjectAndSource.getSource();
                if (null == viewWithProjectAndSource) {
                    throw new ServerException("source not found");
                }
                if (!StringUtils.isEmpty(sqlEntity.getSql())) {
                    SqlUtils sqlUtils = this.sqlUtils.init(source);
                    //解析team@var查询参数
                    Map<String, List<String>> teamParams = parseTeamParams(sqlEntity.getTeamParams(), viewWithProjectAndSource, user, sqlTempDelimiter);
                    Map<String, String> queryParam = getQueryParam(sqlEntity, executeParam);

                    cacheKey = getCacheKey(viewMetaCacheKey, viewWithProjectAndSource, executeParam, teamParams, queryParam);
                    try {
                        Object object = redisUtils.get(cacheKey);
                        if (null != object && executeParam.getCache()) {
                            columns = (List<QueryColumn>) object;
                            return columns;
                        }
                    } catch (Exception e) {
                        log.warn("get data meta by cache: {}", e.getMessage());
                    }

                    String srcSql = SqlParseUtils.replaceParams(sqlEntity.getSql(), queryParam, teamParams, sqlTempDelimiter);
                    List<String> executeSqlList = SqlParseUtils.getExecuteSqlList(srcSql);
                    List<String> querySqlList = SqlParseUtils.getQuerySqlList(srcSql);
                    if (null != executeSqlList && executeSqlList.size() > 0) {
                        for (String sql : executeSqlList) {
                            sqlUtils.execute(sql);
                        }
                    }
                    if (null != querySqlList && querySqlList.size() > 0) {
                        buildQuerySql(querySqlList, sqlEntity, executeParam, source);
                        //逐条查询的目的是为了执行用户sql中的变量定义
                        for (String sql : querySqlList) {
                            sqlUtils.syncQuery4List(sql);
                        }
                        //只返回最后一条sql的结果
                        columns = sqlUtils.getColumns(querySqlList.get(querySqlList.size() - 1));
                    }
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        }

        if (null != executeParam
                && null != executeParam.getCache()
                && executeParam.getCache()
                && executeParam.getExpired() > 0L
                && null != columns && columns.size() > 0) {
            redisUtils.set(cacheKey, columns, executeParam.getExpired(), TimeUnit.SECONDS);
        }

        return columns;
    }


    @Override
    public ResultMap getDistinctValue(Long id, DistinctParam param, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Map<String, Object> map = null;

        ViewWithProjectAndSource viewWithProjectAndSource = viewMapper.getViewWithProjectAndSourceById(id);
        if (null == viewWithProjectAndSource) {
            log.info("view (:{}) not found", id);
            return resultMap.failAndRefreshToken(request).message("view not found");
        }

        Project project = viewWithProjectAndSource.getProject();
        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //当前用户是project的创建者和organization的owner，直接返回
        if (!allowGetData(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to get data");
        }

        try {
            map = getDistinctValueData(viewWithProjectAndSource, param, user);
        } catch (ServerException e) {
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        return resultMap.successAndRefreshToken(request).payload(map);
    }


    public Map<String, Object> getDistinctValueData(ViewWithProjectAndSource viewWithProjectAndSource, DistinctParam param, User user) throws ServerException {
        Map<String, Object> map = null;
        try {
            if (!StringUtils.isEmpty(viewWithProjectAndSource.getSql())) {
                SqlEntity sqlEntity = SqlParseUtils.parseSql(viewWithProjectAndSource.getSql(), sqlTempDelimiter);
                Source source = viewWithProjectAndSource.getSource();
                if (null == viewWithProjectAndSource) {
                    throw new ServerException("source not found");
                }
                if (!StringUtils.isEmpty(sqlEntity.getSql())) {
                    SqlUtils sqlUtils = this.sqlUtils.init(source);

                    //解析team@var查询参数
                    Map<String, List<String>> teamParams = parseTeamParams(sqlEntity.getTeamParams(), viewWithProjectAndSource, user, sqlTempDelimiter);
                    String srcSql = SqlParseUtils.replaceParams(sqlEntity.getSql(), sqlEntity.getQuaryParams(), teamParams, sqlTempDelimiter);
                    List<String> executeSqlList = SqlParseUtils.getExecuteSqlList(srcSql);
                    List<String> querySqlList = SqlParseUtils.getQuerySqlList(srcSql);
                    if (null != executeSqlList && executeSqlList.size() > 0) {
                        for (String sql : executeSqlList) {
                            sqlUtils.execute(sql);
                        }
                    }
                    if (null != querySqlList && querySqlList.size() > 0) {
                        if (null != param) {
                            STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);
                            ST st = stg.getInstanceOf("queryDistinctSql");
                            st.add("column", param.getColumn());
                            st.add("params", param.getParents());
                            st.add("sql", querySqlList.get(querySqlList.size() - 1));
                            st.add("keywordPrefix", sqlUtils.getKeywordPrefix(source.getJdbcUrl()));
                            st.add("keywordSuffix", sqlUtils.getKeywordSuffix(source.getJdbcUrl()));

                            querySqlList.set(querySqlList.size() - 1, st.render());
                        }
                        List<Map<String, Object>> list = null;
                        for (String sql : querySqlList) {
                            list = sqlUtils.query4List(sql, -1);
                        }
                        if (null != list && list.size() > 0) {
                            List<Object> objects = new ArrayList<>();
                            for (Map<String, Object> objMap : list) {
                                if (null != objMap.get(param.getColumn())) {
                                    objects.add(objMap.get(param.getColumn()));
                                }
                            }
                            if (null != objects) {
                                map = new HashMap<>();
                                map.put(param.getColumn(), objects);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        }

        return map;
    }


    private Map<String, List<String>> parseTeamParams(Map<String, List<String>> paramMap, View view, User user, String sqlTempDelimiter) {
        if (null != view && !StringUtils.isEmpty(view.getConfig())) {
            JSONObject jsonObject = JSONObject.parseObject(view.getConfig());
            if (null != jsonObject && jsonObject.containsKey(viewTeamVarKey)) {
                String teamVarString = jsonObject.getString(viewTeamVarKey);
                if (!StringUtils.isEmpty(teamVarString)) {
                    List<TeamVar> varList = JSONObject.parseArray(teamVarString, TeamVar.class);
                    if (null != varList && varList.size() > 0) {
                        Set<Long> tIds = relUserTeamMapper.getUserTeamId(user.getId());
                        for (String key : paramMap.keySet()) {
                            List<String> params = new ArrayList<>();
                            for (TeamVar teamVar : varList) {
                                if (tIds.contains(teamVar.getId())) {
                                    for (TeamParam teamParam : teamVar.getParams()) {

                                        String k = key.replace(String.valueOf(SqlParseUtils.getSqlTempDelimiter(sqlTempDelimiter)), "");
                                        if (teamParam.getK().equals(k)) {
                                            params.add(teamParam.getV());
                                        }
                                    }
                                }
                            }

                            if (params.size() > 0) {
                                paramMap.put(key, params);
                            }
                        }
                    }
                }
            }
        }
        return paramMap;
    }

    private Map<String, String> getQueryParam(SqlEntity sqlEntity, ViewExecuteParam viewExecuteParam) {
        Map<String, String> map = null;
        if (null != sqlEntity && null != viewExecuteParam) {
            map = new HashMap<>();
            if (null != sqlEntity.getQuaryParams() && sqlEntity.getQuaryParams().size() > 0) {
                map.putAll(sqlEntity.getQuaryParams());
            }
            if (null != viewExecuteParam.getParams() && viewExecuteParam.getParams().size() > 0) {
                for (Param param : viewExecuteParam.getParams()) {
                    map.put(param.getName().trim(), param.getValue());
                }
            }
        }
        return map;
    }


    /**
     * 允许获取数据
     *
     * @param project
     * @param user
     * @return
     */
    public boolean allowGetData(Project project, User user) {
        RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());
        if (isProjectAdmin(project, user)) {
            return true;
        }
        if (null != orgRel && UserOrgRoleEnum.OWNER.getRole() == orgRel.getRole()) {
            return true;
        }

        short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(project.getId(), user.getId());
        if (UserTeamRoleEnum.MAINTAINER.getRole() == maxTeamRole) {
            return true;
        } else {
            Integer teamNumOfOrgByUser = relUserTeamMapper.getTeamNumOfOrgByUser(project.getOrgId(), user.getId());
            if (teamNumOfOrgByUser > 0) {
                UserMaxProjectPermission userMaxPermission = relTeamProjectMapper.getUserMaxPermission(project.getId(), user.getId());
                if (null != userMaxPermission && 0L != userMaxPermission.getProjectId().longValue()) {
                    if (userMaxPermission.getVizPermission() > UserPermissionEnum.HIDDEN.getPermission()
                            || userMaxPermission.getWidgetPermission() > UserPermissionEnum.HIDDEN.getPermission()
                            || userMaxPermission.getViewPermission() > UserPermissionEnum.HIDDEN.getPermission()
                            || userMaxPermission.getSourcePermission() > UserPermissionEnum.HIDDEN.getPermission()
                            || userMaxPermission.getSchedulePermission() > UserPermissionEnum.HIDDEN.getPermission()
                            || userMaxPermission.getSharePermission()
                            || userMaxPermission.getDownloadPermission()) {
                        return true;
                    }
                }
            } else {
                Organization organization = organizationMapper.getById(project.getOrgId());
                if (project.getVisibility() && organization.getMemberPermission() > UserPermissionEnum.HIDDEN.getPermission()) {
                    return true;
                }
            }
        }
        return false;
    }


    private String getCacheKey(String prefix, ViewWithProjectAndSource viewWithProjectAndSource, ViewExecuteParam executeParam, Map<String, List<String>> teamParams, Map<String, String> queryParams) {

        StringBuilder sqlKey = new StringBuilder(prefix)
                .append(String.valueOf(viewWithProjectAndSource.getSource().getId()))
                .append("-")
                .append(String.valueOf(viewWithProjectAndSource.getId()));

        STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);
        ST st = stg.getInstanceOf("querySql");
        st.add("groups", executeParam.getGroups());
        st.add("aggregators", executeParam.getAggregators(viewWithProjectAndSource.getSource().getJdbcUrl()));
        st.add("orders", executeParam.getOrders());
        st.add("filters", executeParam.getFilters());
        st.add("keywordPrefix", sqlUtils.getKeywordPrefix(viewWithProjectAndSource.getSource().getJdbcUrl()));
        st.add("keywordSuffix", sqlUtils.getKeywordSuffix(viewWithProjectAndSource.getSource().getJdbcUrl()));
        st.add("sql", sqlKey.toString());

        StringBuilder keyBuilder = new StringBuilder(st.render()).append("-");

        if (null != queryParams && queryParams.size() > 0) {
            for (String key : teamParams.keySet()) {
                keyBuilder.append(key).append(":").append(teamParams.get(key)).append(",");
            }
        }
        if (null != teamParams && teamParams.size() > 0) {
            for (String key : teamParams.keySet()) {
                List<String> list = teamParams.get(key);
                if (null != list && list.size() > 0) {
                    keyBuilder.append(key).append(":").append("[");
                    for (String str : list) {
                        keyBuilder.append(str).append(",");
                    }
                    keyBuilder.append(key).append(":").append("]");
                }
            }
        }

        String src = keyBuilder.toString()
                .replaceAll(newLineChar, "")
                .replaceAll(space, "")
                .replace(mysqlKeyDelimiter, "")
                .replace(apostrophe, "")
                .replace(doubleQuotes, "");

        return MD5Util.getMD5(src, true, 32);
    }

}


package edp.davinci.service.impl;

import com.alibaba.druid.util.StringUtils;
import com.alibaba.fastjson.JSONObject;
import edp.core.enums.HttpCodeEnum;
import edp.core.exception.ServerException;
import edp.core.exception.SourceException;
import edp.core.model.Paginate;
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
import edp.davinci.dto.teamDto.TeamFullId;
import edp.davinci.dto.viewDto.*;
import edp.davinci.model.*;
import edp.davinci.service.AdditionalTeamVarService;
import edp.davinci.service.ViewService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.BeanFactory;
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
import java.util.stream.Collectors;

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
    private TeamMapper teamMapper;

    @Autowired
    private RelTeamProjectMapper relTeamProjectMapper;


    @Autowired
    private SqlUtils sqlUtils;

    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    private RedisUtils redisUtils;

    @Autowired
    private BeanFactory beanFactory;

    @Autowired(required = false)
    private AdditionalTeamVarService additionalTeamVarService;

    @Value("${sql_template_delimiter:$}")
    private String sqlTempDelimiter;

    protected static final String viewDataCacheKey = "view_data_";

    protected static final String viewMetaCacheKey = "view_meta_";

    protected static final String viewTeamVarKey = "team";

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
            updateViewTeamVar(view, viewUpdate.getConfig(), viewWithProjectAndSource.getProject(), user);
            view.setProjectId(project.getId());
            viewMapper.update(view);
            return resultMap.successAndRefreshToken(request);
        } else {
            return resultMap.failAndRefreshToken(request).message("get source connection fail");
        }
    }

    /**
     * 修改用户有权限修改的View TeamVar
     *
     * @param view
     * @param config
     * @param project
     * @param user
     */
    public void updateViewTeamVar(View view, String config, Project project, User user) {
        if (null != view && !StringUtils.isEmpty(view.getConfig()) && !StringUtils.isEmpty(config)) {
            //origin
            JSONObject originJson = JSONObject.parseObject(view.getConfig());

            //update
            JSONObject updateJson = JSONObject.parseObject(config);

            if (null != originJson && originJson.containsKey(viewTeamVarKey)
                    && null != updateJson && updateJson.containsKey(viewTeamVarKey)) {

                String originTeamVarString = originJson.getString(viewTeamVarKey);
                String updateTeamVarString = updateJson.getString(viewTeamVarKey);

                List<TeamVar> filterList = null;

                if (!StringUtils.isEmpty(originTeamVarString)) {
                    List<TeamVar> list = JSONObject.parseArray(originTeamVarString, TeamVar.class);

                    filterList = teamVarFilter(list, user, project.getId());

                    if (null == filterList || filterList.size() == 0) {
                        view.setConfig(config);
                    } else {
                        if (!StringUtils.isEmpty(updateTeamVarString)) {
                            Map<Long, TeamVar> map = new HashMap<>();

                            list.forEach(t -> map.put(t.getId(), t));

                            List<TeamVar> list1 = JSONObject.parseArray(originTeamVarString, TeamVar.class);
                            list1.forEach(t -> {
                                if (map.containsKey(t.getId())) {
                                    map.put(t.getId(), t);
                                }
                            });

                            List<TeamVar> afterUpdate = new ArrayList<>();
                            afterUpdate.addAll(filterList);
                            for (Long id : map.keySet()) {
                                afterUpdate.add(map.get(id));
                            }

                            originJson.put(viewTeamVarKey, JSONObject.toJSONString(afterUpdate));
                            view.setConfig(originJson.toJSONString());
                        }
                    }
                }
            }
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
        ExecuteSqlResult executeSqlResult = null;
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
                        Paginate<Map<String, Object>> paginate = null;
                        for (String sql : querySqlList) {
                            paginate = sqlUtils.query4Paginate(sql, executeSql.getPageNo(), executeSql.getPageSize(), executeSql.getLimit());
                        }

                        if (null != paginate) {
                            executeSqlResult = new ExecuteSqlResult(sqlUtils.getColumns(querySqlList.get(querySqlList.size() - 1)), paginate);
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        return resultMap.successAndRefreshToken(request).payload(executeSqlResult);
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
        Paginate<Map<String, Object>> paginate = null;

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
            paginate = getResultDataList(viewWithProjectAndSource, executeParam, user);
        } catch (ServerException e) {
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        return resultMap.successAndRefreshToken(request).payload(paginate);
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
                st.add("nativeQuery", executeParam.isNativeQuery());
                st.add("groups", executeParam.getGroups());

                if (executeParam.isNativeQuery()) {
                    st.add("aggregators", executeParam.getAggregators());
                    st.add("orders", executeParam.getOrders());
                } else {
                    st.add("aggregators", executeParam.getAggregators(source.getJdbcUrl()));
                    st.add("orders", executeParam.getOrders(source.getJdbcUrl()));
                }

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
    public Paginate<Map<String, Object>> getResultDataList(ViewWithProjectAndSource viewWithProjectAndSource, ViewExecuteParam executeParam, User user) throws ServerException {
        Paginate paginate = null;

        if (null == executeParam || (CollectionUtils.isEmpty(executeParam.getGroups()) && CollectionUtils.isEmpty(executeParam.getAggregators()))) {
            return null;
        }

        String cacheKey = null;
        try {

            if (!StringUtils.isEmpty(viewWithProjectAndSource.getSql())) {
                SqlEntity sqlEntity = SqlParseUtils.parseSql(viewWithProjectAndSource.getSql(), sqlTempDelimiter);

                if (null == viewWithProjectAndSource.getSource()) {
                    throw new ServerException("source not found");
                }

                Source source = viewWithProjectAndSource.getSource();

                if (!StringUtils.isEmpty(sqlEntity.getSql())) {
                    Map<String, List<String>> teamParams = parseTeamParams(sqlEntity.getTeamParams(), viewWithProjectAndSource, user, sqlTempDelimiter);
                    Map<String, String> queryParam = getQueryParam(sqlEntity, executeParam);

                    cacheKey = getCacheKey(viewDataCacheKey, viewWithProjectAndSource, executeParam, teamParams, queryParam);
                    try {
                        Object object = redisUtils.get(cacheKey);
                        if (null != object && executeParam.getCache()) {
                            paginate = (Paginate) object;
                            return paginate;
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
                            paginate = sqlUtils.syncQuery4Paginate(
                                    sql,
                                    executeParam.getPageNo(),
                                    executeParam.getPageSize(),
                                    executeParam.getLimit()
                            );
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
                && null != paginate && paginate.getResultList().size() > 0) {
            redisUtils.set(cacheKey, paginate, executeParam.getExpired(), TimeUnit.SECONDS);
        }

        return paginate;
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
    public List<QueryColumn> getResultMeta(ViewWithProjectAndSource viewWithProjectAndSource,
                                           ViewExecuteParam executeParam,
                                           User user) throws ServerException {
        List<QueryColumn> columns = null;

        String cacheKey = null;
        try {

            if (!StringUtils.isEmpty(viewWithProjectAndSource.getSql())) {

                //TODO parse sql log
                long l = System.currentTimeMillis();

                SqlEntity sqlEntity = SqlParseUtils.parseSql(viewWithProjectAndSource.getSql(), sqlTempDelimiter);

                //TODO parse sql log
                long l1 = System.currentTimeMillis();
                log.info("parse sql for >>> {} ms", l1 - l);

                Source source = viewWithProjectAndSource.getSource();
                if (null == viewWithProjectAndSource) {
                    throw new ServerException("source not found");
                }
                if (!StringUtils.isEmpty(sqlEntity.getSql())) {
                    SqlUtils sqlUtils = this.sqlUtils.init(source);
                    //解析team@var查询参数

                    //TODO parse sql log
                    long l2 = System.currentTimeMillis();

                    Map<String, List<String>> teamParams = parseTeamParams(sqlEntity.getTeamParams(), viewWithProjectAndSource, user, sqlTempDelimiter);

                    //TODO parse sql log
                    long l3 = System.currentTimeMillis();

                    Map<String, String> queryParam = getQueryParam(sqlEntity, executeParam);

                    //TODO parse sql log
                    long l4 = System.currentTimeMillis();
                    log.info("parse team params for >>> {} ms", l3 - l2);
                    log.info("parse query params for >>> {} ms", l4 - l3);
                    log.info("parse params for >>> {} ms", l4 - l2);


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

                    long l5 = System.currentTimeMillis();
                    String srcSql = SqlParseUtils.replaceParams(sqlEntity.getSql(), queryParam, teamParams, sqlTempDelimiter);
                    long l6 = System.currentTimeMillis();
                    log.info("replace param for >>> {} ms", l6 - l5);
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

        List<Map<String, Object>> list = null;

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
            list = getDistinctValueData(viewWithProjectAndSource, param, user);
        } catch (ServerException e) {
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        return resultMap.successAndRefreshToken(request).payloads(list);
    }


    /**
     * 允许获取数据
     *
     * @param project
     * @param user
     * @return
     */
    @Override
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
                if (project.getVisibility()
                        && organization.getMemberPermission() > UserPermissionEnum.HIDDEN.getPermission()) {
                    return true;
                }
            }
        }
        return false;
    }

    @Override
    public List<Map<String, Object>> getDistinctValueData(ViewWithProjectAndSource viewWithProjectAndSource, DistinctParam param, User user) throws ServerException {
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
                            st.add("columns", param.getColumns());
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
                        if (null != list) {
                            return list;
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        }

        return null;
    }


    /**
     * 获取用户所能访问的当前view的team@var
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getViewConfigTeamVar(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        ViewWithProjectAndSource view = viewMapper.getViewWithProjectAndSourceById(id);
        if (null == view) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.NOT_FOUND).message("view is not found");
        }

        List<TeamVar> list = null;
        if (null != view && !StringUtils.isEmpty(view.getConfig())) {
            JSONObject jsonObject = JSONObject.parseObject(view.getConfig());
            if (null != jsonObject && jsonObject.containsKey(viewTeamVarKey)) {
                String teamVarString = jsonObject.getString(viewTeamVarKey);
                if (!StringUtils.isEmpty(teamVarString)) {
                    list = JSONObject.parseArray(teamVarString, TeamVar.class);
                    teamVarFilter(list, user, view.getProject().getId());
                }
            }
        }

        return resultMap.successAndRefreshToken(request).payloads(list);
    }

    private Map<String, List<String>> parseTeamParams(Map<String, List<String>> paramMap,
                                                      ViewWithProjectAndSource view,
                                                      User user,
                                                      String sqlTempDelimiter) {
        if (null != view && !StringUtils.isEmpty(view.getConfig())) {
            JSONObject jsonObject = JSONObject.parseObject(view.getConfig());
            if (null != jsonObject && jsonObject.containsKey(viewTeamVarKey)) {
                String teamVarString = jsonObject.getString(viewTeamVarKey);
                if (!StringUtils.isEmpty(teamVarString)) {
                    //配置的teamVar列表
                    List<TeamVar> teamVarList = JSONObject.parseArray(teamVarString, TeamVar.class);
                    //过滤掉不生效的 teamvar
                    teamVarFilter(teamVarList, user, view.getProject().getId());

                    if (null != teamVarList && teamVarList.size() > 0) {

                        List<TeamVar> additionalList = null;


                        if (null != additionalTeamVarService) {
                            additionalList = additionalTeamVarService.getTeamValList(view.getProject(), user);
                            if (null != additionalList && additionalList.size() > 0) {
                                teamVarList.addAll(additionalList);
                            }
                        }

                        for (String key : paramMap.keySet()) {
                            Set<String> params = new HashSet<>();
                            for (TeamVar teamVar : teamVarList) {
                                for (TeamParam teamParam : teamVar.getParams()) {
                                    String k = key.replace(String.valueOf(SqlParseUtils.getSqlTempDelimiter(sqlTempDelimiter)), "");
                                    if (teamParam.getK().equals(k)) {
                                        params.add(teamParam.getV());
                                    }
                                }
                            }

                            if (params.size() > 0) {
                                paramMap.put(key, params.stream().collect(Collectors.toList()));
                            }
                        }
                    }
                }
            }
        }
        return paramMap;
    }


    /**
     * 过滤TeamVar 列表
     *
     * @param teamVarList
     * @param user
     * @param proejctId
     * @return 返回不在用户与project所在team 及其 子级团队的teamvar列表
     */
    private List<TeamVar> teamVarFilter(List<TeamVar> teamVarList, User user, Long proejctId) {

        List<TeamVar> list = null;
        if (null != teamVarList && teamVarList.size() > 0) {
            Set<Long> teamvarIds = teamVarList.stream().map(t -> t.getId()).collect(Collectors.toSet());

            Set<Long> teamIds = relUserTeamMapper.selectTeamIdByUserAndProject(user.getId(), proejctId);

            if (null == teamIds || teamIds.size() == 0) {
                teamVarList.clear();
                return null;
            }

            Set<Long> filterIds = teamvarIds.stream().filter(id -> !teamIds.contains(id)).collect(Collectors.toSet());

            if (null == filterIds || filterIds.size() == 0) {
                return null;
            }

            Set<TeamFullId> teamFullIds = teamMapper.getTeamsByIds(filterIds);

            Set<Long> rmIds = new HashSet<>();

            List<String> teamIdStrList = new ArrayList<>();
            teamIds.forEach(id -> teamIdStrList.add(String.valueOf(id)));

            teamFullIds.forEach(t -> {
                if (null == t.getFullTeamId() || StringUtils.isEmpty(t.getFullTeamId().trim())) {
                    rmIds.add(t.getId());
                } else {
                    //var 对应team的路径和用户所在路径没有交集则加到将要删除列表中
                    if (Collections.disjoint(teamIdStrList, Arrays.asList(t.getFullTeamId().trim().split(conditionSeparator)))) {
                        rmIds.add(t.getId());
                    }
                }
            });

            if (rmIds.size() > 0) {
                list = new ArrayList<>();
                Iterator<TeamVar> iterator = teamVarList.iterator();
                while (iterator.hasNext()) {
                    TeamVar next = iterator.next();
                    if (rmIds.contains(next.getId())) {
                        list.add(next);
                        iterator.remove();
                    }
                }
            }
        }

        return list;
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

    private String getCacheKey(String prefix,
                               ViewWithProjectAndSource viewWithProjectAndSource,
                               ViewExecuteParam executeParam,
                               Map<String, List<String>> teamParams,
                               Map<String, String> queryParams) {

        StringBuilder sqlKey = new StringBuilder(prefix)
                .append(viewWithProjectAndSource.getSource().getId())
                .append("-")
                .append(viewWithProjectAndSource.getId());

        STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);
        ST st = stg.getInstanceOf("querySql");
        st.add("groups", executeParam.getGroups());
        st.add("aggregators", executeParam.getAggregators(viewWithProjectAndSource.getSource().getJdbcUrl()));
        st.add("orders", executeParam.getOrders());
        st.add("filters", executeParam.getFilters());
        st.add("keywordPrefix", sqlUtils.getKeywordPrefix(viewWithProjectAndSource.getSource().getJdbcUrl()));
        st.add("keywordSuffix", sqlUtils.getKeywordSuffix(viewWithProjectAndSource.getSource().getJdbcUrl()));
        st.add("sql", sqlKey.toString());

        StringBuilder keyBuilder = new StringBuilder(st.render()).append(minus);
        keyBuilder.append(executeParam.getPageNo()).append(executeParam.getPageSize()).append(executeParam.getLimit());

        if (null != queryParams && queryParams.size() > 0) {
            for (String key : teamParams.keySet()) {
                keyBuilder.append(key).append(colon).append(teamParams.get(key)).append(conditionSeparator);
            }
        }
        if (null != teamParams && teamParams.size() > 0) {
            for (String key : teamParams.keySet()) {
                List<String> list = teamParams.get(key);
                if (null != list && list.size() > 0) {
                    keyBuilder.append(key).append(colon).append(squareBracketStart);
                    for (String str : list) {
                        keyBuilder.append(str).append(conditionSeparator);
                    }
                    keyBuilder.append(key).append(colon).append(squareBracketEnd);
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


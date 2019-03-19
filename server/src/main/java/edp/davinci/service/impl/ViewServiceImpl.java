package edp.davinci.service.impl;

import com.alibaba.druid.util.StringUtils;
import com.alibaba.fastjson.JSONObject;
import edp.core.enums.HttpCodeEnum;
import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedExecption;
import edp.core.model.Paginate;
import edp.core.model.PaginateWithQueryColumns;
import edp.core.model.QueryColumn;
import edp.core.utils.*;
import edp.davinci.common.service.CommonService;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.*;
import edp.davinci.core.model.SqlEntity;
import edp.davinci.core.utils.SqlParseUtils;
import edp.davinci.dao.*;
import edp.davinci.dto.projectDto.ProjectDetail;
import edp.davinci.dto.projectDto.ProjectPermission;
import edp.davinci.dto.projectDto.UserMaxProjectPermission;
import edp.davinci.dto.sourceDto.SourceBaseInfo;
import edp.davinci.dto.sourceDto.SourceConfig;
import edp.davinci.dto.teamDto.TeamFullId;
import edp.davinci.dto.viewDto.*;
import edp.davinci.model.*;
import edp.davinci.service.AdditionalTeamVarService;
import edp.davinci.service.ProjectService;
import edp.davinci.service.SourceService;
import edp.davinci.service.ViewService;
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

import javax.servlet.http.HttpServletRequest;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

import static edp.core.consts.Consts.conditionSeparator;

@Slf4j
@Service("viewService")
public class ViewServiceImpl extends CommonService<View> implements ViewService {

    private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

    @Autowired
    private ViewMapper viewMapper;

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
    private RelRoleViewMapper relRoleViewMapper;


    @Autowired
    private SqlUtils sqlUtils;

    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    private RedisUtils redisUtils;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private SourceService sourceService;

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
     * @return
     */
    @Override
    public List<ViewWithSourceBaseInfo> getViews(Long projectId, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        ProjectDetail projectDetail = null;
        try {
            projectDetail = projectService.getProjectDetail(projectId, user, false);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            return null;
        }

        List<ViewWithSourceBaseInfo> views = viewMapper.getByProject(projectId);

        if (null != views) {
            if (!isMaintainer(projectDetail, user)) {
                ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
                if (projectPermission.getViewPermission() == UserPermissionEnum.HIDDEN.getPermission()) {
                    return null;
                }
            }
        }

        return views;
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
    public ViewWithSourceBaseInfo createView(ViewCreate viewCreate, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        ProjectDetail projectDetail = projectService.getProjectDetail(viewCreate.getProjectId(), user, false);
        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);

        if (projectPermission.getViewPermission() < UserPermissionEnum.WRITE.getPermission()) {
            throw new UnAuthorizedExecption("you have not permission to create view");
        }

        if (isExist(viewCreate.getName(), null, viewCreate.getProjectId())) {
            log.info("the view {} name is already taken", viewCreate.getName());
            throw new ServerException("the view name is already taken");
        }

        Source source = sourceMapper.getById(viewCreate.getSourceId());
        if (null == source) {
            log.info("source (:{}) not found", viewCreate.getSourceId());
            throw new NotFoundException("source is not found");
        }

        //测试连接
        boolean testConnection = sourceService.isTestConnection(new SourceConfig(source));

        if (testConnection) {
            View view = new View();
            BeanUtils.copyProperties(viewCreate, view);
            view.createBy(user.getId());

            int insert = viewMapper.insert(view);
            if (insert > 0) {
                optLogger.info("view ({}) is create by user (:{})", view.toString(), user.getId());

                if (null != viewCreate.getRoles() && viewCreate.getRoles().size() > 0) {
                    new Thread(() -> {
                        List<RelRoleView> relRoleViews = new ArrayList<>();
                        viewCreate.getRoles().forEach(r -> {
                            if (r.getRoleId().longValue() > 0L) {
                                RelRoleView relRoleView = new RelRoleView();
                                BeanUtils.copyProperties(r, relRoleView);
                                relRoleView.setViewId(view.getId());
                                relRoleView.createBy(user.getId());
                                relRoleViews.add(relRoleView);
                            }
                        });
                        relRoleViewMapper.insertBatch(relRoleViews);
                    }).start();
                }

                SourceBaseInfo sourceBaseInfo = new SourceBaseInfo();
                BeanUtils.copyProperties(source, sourceBaseInfo);

                ViewWithSourceBaseInfo viewWithSource = new ViewWithSourceBaseInfo();
                BeanUtils.copyProperties(view, viewWithSource);
                viewWithSource.setSource(sourceBaseInfo);
                return viewWithSource;
            } else {
                throw new ServerException("create view fail");
            }
        } else {
            throw new ServerException("get source connection fail");
        }
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
    public boolean updateView(ViewUpdate viewUpdate, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        ViewWithSource viewWithSource = viewMapper.getViewWithSource(viewUpdate.getId());
        if (null == viewWithSource) {
            throw new NotFoundException("view is not found");
        }

        ProjectDetail projectDetail = projectService.getProjectDetail(viewWithSource.getProjectId(), user, false);

        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
        if (projectPermission.getViewPermission() < UserPermissionEnum.WRITE.getPermission()) {
            throw new UnAuthorizedExecption("you have not permission to update this view");
        }

        if (isExist(viewUpdate.getName(), viewUpdate.getId(), viewWithSource.getProjectId())) {
            log.info("the view {} name is already taken", viewUpdate.getName());
            throw new ServerException("the view name is already taken");
        }

        Source source = viewWithSource.getSource();
        if (null == source) {
            log.info("source not found");
            throw new NotFoundException("source is not found");
        }

        //测试连接
        boolean testConnection = sourceService.isTestConnection(new SourceConfig(source));

        if (testConnection) {

            if (null == viewUpdate.getRoles() || viewUpdate.getRoles().size() == 0) {
                relRoleViewMapper.deleteByViewId(viewUpdate.getId());
            } else {
                relRoleViewMapper.deleteByViewId(viewUpdate.getId());
                List<RelRoleView> relRoleViews = new ArrayList<>();
                viewUpdate.getRoles().forEach(r -> {
                    if (r.getViewId().equals(viewUpdate.getId()) && r.getRoleId().longValue() > 0L) {
                        RelRoleView relRoleView = new RelRoleView();
                        BeanUtils.copyProperties(r, relRoleView);
                        relRoleView.setViewId(viewUpdate.getId());
                        relRoleView.createBy(user.getId());
                        relRoleView.updateBy(user.getId());
                        relRoleViews.add(relRoleView);
                    }
                });
                relRoleViewMapper.insertBatch(relRoleViews);
            }

            String originStr = viewWithSource.toString();
            BeanUtils.copyProperties(viewWithSource, viewUpdate);
            viewWithSource.updateBy(user.getId());

            int update = viewMapper.update(viewWithSource);
            if (update > 0) {
                optLogger.info("view ({}) is updated by user(:{}), origin: ({})", viewWithSource.toString(), user.getId(), originStr);
                return true;
            } else {
                throw new ServerException("update view fail");
            }
        } else {
            throw new ServerException("get source connection fail");
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
     * @return
     */
    @Override
    @Transactional
    public boolean deleteView(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        View view = viewMapper.getById(id);

        if (null == view) {
            log.info("view (:{}) not found", id);
            throw new NotFoundException("view is not found");
        }

        ProjectDetail projectDetail = null;
        try {
            projectDetail = projectService.getProjectDetail(view.getProjectId(), user, false);
        } catch (NotFoundException e) {
            throw e;
        } catch (UnAuthorizedExecption e) {
            throw new UnAuthorizedExecption("you have not permission to delete this view");
        }

        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
        if (projectPermission.getViewPermission() < UserPermissionEnum.DELETE.getPermission()) {
            throw new UnAuthorizedExecption("you have not permission to delete this view");
        }

        List<Widget> widgets = widgetMapper.getWidgetsByWiew(id);
        if (null != widgets && widgets.size() > 0) {
            throw new ServerException("The current view has been referenced, please delete the reference and then operate");
        }

        int i = viewMapper.deleteById(id);
        if (i > 0) {
            optLogger.info("view ( {} ) delete by user( :{} )", view.toString(), user.getId());
            relRoleViewMapper.deleteByViewId(id);
        }

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
    public PaginateWithQueryColumns executeSql(ViewExecuteSql executeSql, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

        Source source = sourceMapper.getById(executeSql.getSourceId());
        if (null == source) {
            throw new NotFoundException("source is not found");
        }

        ProjectDetail projectDetail = projectService.getProjectDetail(source.getProjectId(), user, false);

        ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);

        if (!isMaintainer(projectDetail, user)
                && (projectPermission.getSourcePermission() == UserPermissionEnum.HIDDEN.getPermission()
                || projectPermission.getViewPermission() < UserPermissionEnum.WRITE.getPermission())) {
            throw new UnAuthorizedExecption("you have not permission to execute sql");
        }

        //结构化Sql
        PaginateWithQueryColumns paginateWithQueryColumns = null;
        try {
            SqlEntity sqlEntity = SqlParseUtils.parseSql(executeSql.getSql(), executeSql.getVariables(), sqlTempDelimiter);
            if (null != sqlUtils && null != sqlEntity) {
                if (!StringUtils.isEmpty(sqlEntity.getSql())) {
                    String srcSql = SqlParseUtils.replaceParams(sqlEntity.getSql(), sqlEntity.getQuaryParams(), sqlEntity.getAuthParams(), sqlTempDelimiter);

                    SqlUtils sqlUtils = this.sqlUtils.init(source.getJdbcUrl(), source.getUsername(), source.getPassword());

                    List<String> executeSqlList = SqlParseUtils.getSqls(srcSql, false);

                    List<String> querySqlList = SqlParseUtils.getSqls(srcSql, true);

                    if (null != executeSqlList && executeSqlList.size() > 0) {
                        executeSqlList.forEach(sql -> sqlUtils.execute(sql));
                    }
                    if (null != querySqlList && querySqlList.size() > 0) {
                        for (String sql : querySqlList) {
                            paginateWithQueryColumns = sqlUtils.query4PaginateWithQueryColumns(sql, executeSql.getLimit());
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        }
        return paginateWithQueryColumns;
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
    public Paginate<Map<String, Object>> getData(Long id, ViewExecuteParam executeParam, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {
        if (null == executeParam || (CollectionUtils.isEmpty(executeParam.getGroups()) && CollectionUtils.isEmpty(executeParam.getAggregators()))) {
            return null;
        }

        ViewWithSource viewWithSource = viewMapper.getViewWithSource(id);
        if (null == viewWithSource) {
            log.info("view (:{}) not found", id);
            throw new NotFoundException("view is not found");
        }

        ProjectDetail projectDetail = projectService.getProjectDetail(viewWithSource.getProjectId(), user, false);

        boolean allowGetData = projectService.allowGetData(projectDetail, user);

        if (!allowGetData) {
            throw new UnAuthorizedExecption("you have not permission to get data");
        }

        return getResultDataList(projectDetail, viewWithSource, executeParam, user);
    }


    public void buildQuerySql(List<String> querySqlList, Source source, ViewExecuteParam executeParam, Set<String> excludeColumns) {
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
                st.add("aggregators", executeParam.getAggregators(excludeColumns));
            } else {
                st.add("aggregators", executeParam.getAggregators(source.getJdbcUrl(), excludeColumns));
            }

            st.add("orders", executeParam.getOrders(source.getJdbcUrl()));
            st.add("filters", executeParam.getFilters());
            st.add("keywordPrefix", sqlUtils.getKeywordPrefix(source.getJdbcUrl()));
            st.add("keywordSuffix", sqlUtils.getKeywordSuffix(source.getJdbcUrl()));

            for (int i = 0; i < querySqlList.size(); i++) {
                st.add("sql", querySqlList.get(i));
                querySqlList.set(i, st.render());
            }

        }
    }


    /**
     * TODO 获取结果集
     *
     * @param projectDetail
     * @param viewWithSource
     * @param executeParam
     * @param user
     * @return
     * @throws ServerException
     */
    @Override
    public Paginate<Map<String, Object>> getResultDataList(ProjectDetail projectDetail, ViewWithSource viewWithSource, ViewExecuteParam executeParam, User user) throws ServerException {
        Paginate paginate = null;

        if (null == executeParam || (CollectionUtils.isEmpty(executeParam.getGroups()) && CollectionUtils.isEmpty(executeParam.getAggregators()))) {
            return null;
        }

        if (null == viewWithSource.getSource()) {
            throw new ServerException("source is not found");
        }

        String cacheKey = null;
        try {

            if (!StringUtils.isEmpty(viewWithSource.getSql())) {
                //解析变量
                List<SqlVariable> variables = viewWithSource.getVariables();
                //解析sql
                SqlEntity sqlEntity = SqlParseUtils.parseSql(viewWithSource.getSql(), variables, sqlTempDelimiter);

                //获取当前用户对该view的行列权限配置
                List<RelRoleView> roleViewList = relRoleViewMapper.getByUserAndView(user.getId(), viewWithSource.getId());

                //行权限
                List<SqlVariable> rowVariables = getRowVariables(roleViewList);

                //列权限（只记录被限制访问的字段）
                Set<String> excludeColumns = getColumnAuth(roleViewList);

                //解析行权限
                parseParams(projectDetail, sqlEntity, executeParam.getParams(), rowVariables, user);

                //替换参数
                String srcSql = SqlParseUtils.replaceParams(sqlEntity.getSql(), sqlEntity.getQuaryParams(), sqlEntity.getAuthParams(), sqlTempDelimiter);

                Source source = viewWithSource.getSource();

                SqlUtils sqlUtils = this.sqlUtils.init(source);


                List<String> executeSqlList = SqlParseUtils.getSqls(srcSql, false);
                if (null != executeSqlList && executeSqlList.size() > 0) {
                    executeSqlList.forEach(sql -> sqlUtils.execute(sql));
                }

                List<String> querySqlList = SqlParseUtils.getSqls(srcSql, true);
                if (null != querySqlList && querySqlList.size() > 0) {
                    buildQuerySql(querySqlList, source, executeParam, excludeColumns);

                    cacheKey = MD5Util.getMD5(querySqlList.get(querySqlList.size() - 1), true, 32);

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

    private Set<String> getColumnAuth(List<RelRoleView> roleViewList) {
        if (null != roleViewList && roleViewList.size() > 0) {
            Set<String> columns = new HashSet<>();
            roleViewList.forEach(r -> {
                if (!StringUtils.isEmpty(r.getColumnAuth())) {
                    columns.addAll(Arrays.asList(r.getColumnAuth().split(conditionSeparator)));
                }
            });
            return columns;
        }
        return null;
    }

    private List<SqlVariable> getRowVariables(List<RelRoleView> roleViewList) {
        if (null != roleViewList && roleViewList.size() > 0) {
            List<SqlVariable> variables = new ArrayList<>();
            roleViewList.forEach(r -> {
                if (!StringUtils.isEmpty(r.getRowAuth())) {
                    variables.addAll(JSONObject.parseArray(r.getRowAuth(), SqlVariable.class));
                }
            });
            return variables;
        }
        return null;
    }


    private void parseParams(ProjectDetail projectDetail, SqlEntity sqlEntity, List<Param> paramList, List<SqlVariable> variables, User user) {
        //查询参数
        if (null != paramList && paramList.size() > 0) {
            if (null == sqlEntity.getQuaryParams()) {
                sqlEntity.setQuaryParams(new HashMap<>());
            }
            paramList.forEach(p -> sqlEntity.getQuaryParams().put(p.getName().trim(), p.getValue()));
        }

        //如果当前用户是project的维护者，直接不走行权限
        if (isMaintainer(projectDetail, user)) {
            sqlEntity.setAuthParams(null);
            sqlEntity.setQuaryParams(null);
            return;
        }

        //权限参数
        if (null != variables && variables.size() > 0) {
            List<SqlVariable> list = variables.stream().filter(v -> v.getType().equals(SqlVariableTypeEnum.AUTHVARE.getType())).collect(Collectors.toList());
            if (null != list && list.size() > 0) {
                ExecutorService executorService = Executors.newFixedThreadPool(7);
                CountDownLatch countDownLatch = new CountDownLatch(list.size());
                ConcurrentHashMap<String, Set<String>> map = new ConcurrentHashMap<>();
                try {
                    list.forEach(sqlVariable -> executorService.execute(() -> {
                        //TODO 外部获取参数url
                        String url = "";
                        List<String> values = SqlParseUtils.getAuthVarValue(sqlVariable, url);
                        if (map.containsKey(sqlVariable.getName().trim())) {
                            map.get(sqlVariable.getName().trim()).addAll(values);
                        } else {
                            map.put(sqlVariable.getName().trim(), new HashSet<>(values));
                        }
                        countDownLatch.countDown();
                    }));
                    countDownLatch.await();
                } catch (InterruptedException e) {
                    e.printStackTrace();
                } finally {
                    executorService.shutdown();
                }

                if (map.size() > 0) {
                    if (null == sqlEntity.getAuthParams()) {
                        sqlEntity.setAuthParams(new HashMap<>());
                    }
                    map.forEach((k, v) -> sqlEntity.getAuthParams().put(k, new ArrayList<String>(v)));
                }
            } else {
                sqlEntity.setAuthParams(new HashMap<>());
            }
        }
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

                    Map<String, List<String>> teamParams = parseAuthParams(sqlEntity.getAuthParams(), viewWithProjectAndSource, user, sqlTempDelimiter);

                    //TODO parse sql log
                    long l3 = System.currentTimeMillis();

                    Map<String, Object> queryParam = getQueryParam(sqlEntity, executeParam);

                    //TODO parse sql log
                    long l4 = System.currentTimeMillis();
                    log.info("parse team params for >>> {} ms", l3 - l2);
                    log.info("parse query params for >>> {} ms", l4 - l3);
                    log.info("parse params for >>> {} ms", l4 - l2);


                    // TODO cahceKey
//                    cacheKey = getCacheKey(viewMetaCacheKey, new ViewWithSource(), executeParam, teamParams, queryParam);

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
                    List<String> executeSqlList = SqlParseUtils.getSqls(srcSql, false);
                    List<String> querySqlList = SqlParseUtils.getSqls(srcSql, true);
                    if (null != executeSqlList && executeSqlList.size() > 0) {
                        for (String sql : executeSqlList) {
                            sqlUtils.execute(sql);
                        }
                    }
                    if (null != querySqlList && querySqlList.size() > 0) {
                        //TODO 构建查询语句
                        buildQuerySql(querySqlList, source, executeParam, null);
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
                    Map<String, List<String>> teamParams = parseAuthParams(sqlEntity.getAuthParams(), viewWithProjectAndSource, user, sqlTempDelimiter);
                    String srcSql = SqlParseUtils.replaceParams(sqlEntity.getSql(), sqlEntity.getQuaryParams(), teamParams, sqlTempDelimiter);
                    List<String> executeSqlList = SqlParseUtils.getSqls(srcSql, false);
                    List<String> querySqlList = SqlParseUtils.getSqls(srcSql, true);
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
                            log.info(sql);
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


    private Map<String, List<String>> parseAuthParams(Map<String, List<String>> paramMap,
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
                                    String k = key.replace(String.valueOf(Constants.getSqlTempDelimiter(sqlTempDelimiter)), "");
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

    private Map<String, Object> getQueryParam(SqlEntity sqlEntity, ViewExecuteParam viewExecuteParam) {
        Map<String, Object> map = null;
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

}


/*
 * <<
 * Davinci
 * ==
 * Copyright (C) 2016 - 2018 EDP
 * ==
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *       http://www.apache.org/licenses/LICENSE-2.0
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 * >>
 */

package edp.davinci.service.impl;

import com.alibaba.fastjson.JSONObject;
import edp.core.enums.DataTypeEnum;
import edp.core.enums.HttpCodeEnum;
import edp.core.exception.ServerException;
import edp.core.exception.SourceException;
import edp.core.model.QueryColumn;
import edp.core.utils.DateUtils;
import edp.core.utils.FileUtils;
import edp.core.utils.SqlUtils;
import edp.core.utils.TokenUtils;
import edp.davinci.common.service.CommonService;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.*;
import edp.davinci.core.model.DataUploadEntity;
import edp.davinci.core.utils.CsvUtils;
import edp.davinci.core.utils.ExcelUtils;
import edp.davinci.dao.ProjectMapper;
import edp.davinci.dao.SourceMapper;
import edp.davinci.dao.ViewMapper;
import edp.davinci.dto.sourceDto.*;
import edp.davinci.model.*;
import edp.davinci.service.SourceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.stringtemplate.v4.ST;
import org.stringtemplate.v4.STGroup;
import org.stringtemplate.v4.STGroupFile;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;


@Slf4j
@Service("sourceService")
public class SourceServiceImpl extends CommonService<Source> implements SourceService {

    @Autowired
    private TokenUtils tokenUtils;

    @Autowired
    SourceMapper sourceMapper;

    @Autowired
    SqlUtils sqlUtils;

    @Autowired
    ProjectMapper projectMapper;

    @Autowired
    ViewMapper viewMapper;

    @Autowired
    FileUtils fileUtils;

    @Override
    public synchronized boolean isExist(String name, Long id, Long projectId) {
        Long sourceId = sourceMapper.getByNameWithProjectId(name, projectId);
        if (null != id && null != sourceId) {
            return !id.equals(sourceId);
        }
        return null != sourceId && sourceId.longValue() > 0L;
    }

    /**
     * 获取source列表
     *
     * @param projectId
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap getSources(Long projectId, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Project project = projectMapper.getById(projectId);

        if (null == project) {
            log.info("project {} not found", project);
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        if (!allowRead(project, user)) {
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED);
        }

        List<Source> sources = sourceMapper.getByProject(projectId);

        if (null != sources && sources.size() > 0) {

            //获取当前用户在organization的role
            RelUserOrganization orgRel = relUserOrganizationMapper.getRel(user.getId(), project.getOrgId());

            //当前用户是project的创建者和organization的owner，直接返回
            if (!isProjectAdmin(project, user) && (null == orgRel || orgRel.getRole() == UserOrgRoleEnum.MEMBER.getRole())) {
                //查询project所属team中当前用户最高角色
                short maxTeamRole = relUserTeamMapper.getUserMaxRoleWithProjectId(projectId, user.getId());

                //如果当前用户是team的matainer 全部返回，否则验证 当前用户team对project的权限
                if (maxTeamRole == UserTeamRoleEnum.MEMBER.getRole()) {

                    //查询当前用户在的 project所属team对project source的最高权限
                    short maxSourcePermission = relTeamProjectMapper.getMaxSourcePermission(projectId, user.getId());

                    if (maxSourcePermission == UserPermissionEnum.HIDDEN.getPermission()) {
                        //隐藏
                        sources = null;
                    }
                }
            }
        }


        return resultMap.successAndRefreshToken(request).payloads(sources);
    }

    /**
     * 创建source
     *
     * @param sourceCreate
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap createSource(SourceCreate sourceCreate, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Project project = projectMapper.getById(sourceCreate.getProjectId());

        if (isExist(sourceCreate.getName(), null, sourceCreate.getProjectId())) {
            log.info("the source {} name is already taken", sourceCreate.getName());
            return resultMap.failAndRefreshToken(request).message("the source name is already taken");
        }

        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to create source", user.getUsername());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to create source");
        }

        if (null == SourceTypeEnum.typeOf(sourceCreate.getType())) {
            return resultMap.failAndRefreshToken(request).message("Invalid source type");
        }

        //测试连接
        SourceConfig config = sourceCreate.getConfig();
        boolean testConnection = false;
        try {
            testConnection = sqlUtils.init(config.getUrl(), config.getUsername(), config.getPassword()).testConnection();
        } catch (SourceException e) {
            log.error(e.getMessage());
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        if (testConnection) {
            Source source = new Source();
            source.setName(sourceCreate.getName());
            source.setDescription(sourceCreate.getDescription());
            source.setType(sourceCreate.getType());
            source.setProjectId(sourceCreate.getProjectId());
            source.setConfig(JSONObject.toJSONString(sourceCreate.getConfig()));

            int insert = sourceMapper.insert(source);
            if (insert > 0) {
                return resultMap.successAndRefreshToken(request).payload(source);
            } else {
                return resultMap.failAndRefreshToken(request).message("create source fail");
            }
        } else {
            return resultMap.failAndRefreshToken(request).message("get source connection fail");
        }
    }

    /**
     * 修改source
     *
     * @param sourceInfo
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap updateSource(SourceInfo sourceInfo, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        SourceWithProject sourceWithProject = sourceMapper.getSourceWithProjectById(sourceInfo.getId());

        if (null == sourceWithProject) {
            return resultMap.failAndRefreshToken(request).message("source not found");
        }

        Project project = sourceWithProject.getProject();


        if (isExist(sourceInfo.getName(), sourceInfo.getId(), project.getId())) {
            log.info("the source {} name is already taken", sourceInfo.getName());
            return resultMap.failAndRefreshToken(request).message("the source name is already taken");
        }


        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to update the source {}", user.getUsername(), sourceInfo.getId());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to update the source");
        }

        //测试连接
        SourceConfig config = sourceInfo.getConfig();
        boolean testConnection = false;
        try {
            testConnection = sqlUtils.init(config.getUrl(), config.getUsername(), config.getPassword()).testConnection();
        } catch (SourceException e) {
            log.error(e.getMessage());
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        if (testConnection) {
            Source source = new Source();
            source.setId(sourceInfo.getId());
            source.setName(sourceInfo.getName());
            source.setDescription(sourceInfo.getDescription());
            source.setType(sourceInfo.getType());
            source.setProjectId(project.getId());
            source.setConfig(JSONObject.toJSONString(sourceInfo.getConfig()));

            sourceMapper.update(source);
            return resultMap.successAndRefreshToken(request);
        } else {
            return resultMap.failAndRefreshToken(request).message("get source connection fail");
        }
    }

    /**
     * 删除source
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap deleteSrouce(Long id, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        SourceWithProject sourceWithProject = sourceMapper.getSourceWithProjectById(id);

        if (null == sourceWithProject) {
            log.info("source {} not found", id);
            return resultMap.failAndRefreshToken(request).message("source not found");
        }

        if (null == sourceWithProject.getProject()) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("project not found");
        }

        //校验权限
        if (!allowDelete(sourceWithProject.getProject(), user)) {
            log.info("user {} have not permisson to delete the source {}", user.getUsername(), id);
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permission to delete the source");
        }

        List<View> viewList = viewMapper.getBySourceId(id);
        if (null != viewList && viewList.size() > 0) {
            log.info("There is at least one view using the source({}), it is can not be deleted", id);
            return resultMap.failAndRefreshToken(request).message("There is at least one view using the source, it is can not be deleted");
        }

        sourceMapper.deleteById(id);

        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 测试连接
     *
     * @param sourceTest
     * @param user
     * @param request
     * @return
     */
    @Override
    public ResultMap testSource(SourceTest sourceTest, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        boolean testConnection = false;
        try {
            testConnection = sqlUtils.init(sourceTest.getUrl(), sourceTest.getUsername(), sourceTest.getPassword()).testConnection();
        } catch (SourceException e) {
            log.error(e.getMessage());
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }
        if (testConnection) {
            return resultMap.successAndRefreshToken(request);
        } else {
            return resultMap.failAndRefreshToken(request).message("get source connection fail");
        }
    }

    /**
     * 生成csv对应的表结构
     *
     * @param sourceId
     * @param uploadMeta
     * @param user
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap validCsvmeta(Long sourceId, UploadMeta uploadMeta, User user, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);

        Source source = sourceMapper.getById(sourceId);
        if (null == source) {
            log.info("source ({}) not found", sourceId);
            return resultMap.failAndRefreshToken(request).message("source not found");
        }

        Project project = projectMapper.getById(source.getProjectId());

        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("Invalid source");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to upload csv file in this source {}", user.getUsername(), source.getId());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permisson to upload csv file in this source");
        }

        if (uploadMeta.getMode() != UploadModeEnum.REPLACE.getMode()) {
            try {
                boolean tableIsExist = sqlUtils.init(source).tableIsExist(uploadMeta.getTableName());
                if (uploadMeta.getMode() == UploadModeEnum.NEW.getMode()) {
                    if (tableIsExist) {
                        return resultMap.failAndRefreshToken(request).message("table " + uploadMeta.getTableName() + " is already exist");
                    }
                } else {
                    if (!tableIsExist) {
                        return resultMap.failAndRefreshToken(request).message("table " + uploadMeta.getTableName() + " is not exist");
                    }
                }
            } catch (SourceException e) {
                log.error(e.getMessage());
                return resultMap.failAndRefreshToken(request).message(e.getMessage());
            }
        }
        return resultMap.successAndRefreshToken(request);
    }

    /**
     * 上传csv文件
     *
     * @param sourceId
     * @param sourceDataUpload
     * @param file
     * @param user
     * @param type
     * @param request
     * @return
     */
    @Override
    @Transactional
    public ResultMap dataUpload(Long sourceId, SourceDataUpload sourceDataUpload, MultipartFile file, User user, String type, HttpServletRequest request) {
        ResultMap resultMap = new ResultMap(tokenUtils);


        if (!type.equals(FileTypeEnum.CSV.getType()) && !type.equals(FileTypeEnum.XLSX.getType()) && !type.equals(FileTypeEnum.XLS.getType())) {
            return resultMap.failAndRefreshToken(request).message("Unsupported file format");
        }

        //校验文件是否csv文件
        if (type.equals(FileTypeEnum.CSV.getType()) && !fileUtils.isCsv(file)) {
            return resultMap.failAndRefreshToken(request).message("Please upload csv file");
        }

        if (type.equals(FileTypeEnum.XLSX.getType()) && !fileUtils.isExcel(file)) {
            return resultMap.failAndRefreshToken(request).message("Please upload excel file");
        }

        Source source = sourceMapper.getById(sourceId);
        if (null == source) {
            log.info("source ({}) not found", sourceId);
            return resultMap.failAndRefreshToken(request).message("source not found");
        }

        Project project = projectMapper.getById(source.getProjectId());

        if (null == project) {
            log.info("project not found");
            return resultMap.failAndRefreshToken(request).message("Invalid source");
        }

        //校验权限
        if (!allowWrite(project, user)) {
            log.info("user {} have not permisson to upload csv file in this source {}", user.getUsername(), source.getId());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("you have not permisson to upload csv file in this source");
        }

        DataTypeEnum dataTypeEnum = DataTypeEnum.urlOf(source.getJdbcUrl());
        if (dataTypeEnum != DataTypeEnum.MYSQL) {
            log.info("Unsupported data source， {}", source.getJdbcUrl());
            return resultMap.failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message("Unsupported data source: " + source.getJdbcUrl());
        }


        try {
            DataUploadEntity dataUploadEntity = null;
            if (type.equals(FileTypeEnum.CSV.getType())) {
                //解析csv文件
                dataUploadEntity = CsvUtils.parseCsvWithFirstAsHeader(file, "UTF-8");
            } else {
                //解析excel文件
                dataUploadEntity = ExcelUtils.parseExcelWithFirstAsHeader(file);
            }

            if (null != dataUploadEntity && null != dataUploadEntity.getHeaders() && dataUploadEntity.getHeaders().size() > 0) {
                //建表
                createTable(dataUploadEntity.getHeaders(), sourceDataUpload, source);

                //传输数据
                insertData(dataUploadEntity.getHeaders(), dataUploadEntity.getValues(), sourceDataUpload, source);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return resultMap.failAndRefreshToken(request).message(e.getMessage());
        }

        return resultMap.successAndRefreshToken(request);
    }


    /**
     * 建表
     *
     * @param fileds
     * @param sourceDataUpload
     * @param source
     * @throws ServerException
     */
    private void createTable(Set<QueryColumn> fileds, SourceDataUpload sourceDataUpload, Source source) throws ServerException {

        if (null == fileds || fileds.size() <= 0) {
            throw new ServerException("there is have not any fileds");
        }

        SqlUtils sqlUtils = this.sqlUtils.init(source);

        STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);

        String sql = null;

        if (sourceDataUpload.getMode() == UploadModeEnum.REPLACE.getMode()) {
            ST st = stg.getInstanceOf("createTable");
            st.add("tableName", sourceDataUpload.getTableName());
            st.add("fields", fileds);
            st.add("primaryKeys", StringUtils.isEmpty(sourceDataUpload.getPrimaryKeys()) ? null : sourceDataUpload.getPrimaryKeys().split(","));
            st.add("indexKeys", sourceDataUpload.getIndexList());
            sql = st.render();
            String dropSql = "DROP TABLE IF EXISTS `" + sourceDataUpload.getTableName() + "`";
            sqlUtils.jdbcTemplate().execute(dropSql);
            log.info("drop table sql : {}", dropSql);
        } else {
            boolean tableIsExist = sqlUtils.tableIsExist(sourceDataUpload.getTableName());
            if (sourceDataUpload.getMode() == UploadModeEnum.NEW.getMode()) {
                if (!tableIsExist) {
                    ST st = stg.getInstanceOf("createTable");
                    st.add("tableName", sourceDataUpload.getTableName());
                    st.add("fields", fileds);
                    st.add("primaryKeys", sourceDataUpload.getPrimaryKeys());
                    st.add("indexKeys", sourceDataUpload.getIndexList());

                    sql = st.render();
                } else {
                    throw new ServerException("table " + sourceDataUpload.getTableName() + " is already exist");
                }
            } else {
                if (!tableIsExist) {
                    throw new ServerException("table " + sourceDataUpload.getTableName() + " is not exist");
                }
            }
        }

        log.info("create table sql : {}", sql);
        try {
            if (!StringUtils.isEmpty(sql)) {
                sqlUtils.jdbcTemplate().execute(sql);
            }
        } catch (Exception e) {
            throw new ServerException(e.getMessage());
        }
    }


    /**
     * 插入数据
     *
     * @param headers
     * @param values
     * @param sourceDataUpload
     * @param source
     */
    private void insertData(Set<QueryColumn> headers, List<Map<String, Object>> values, SourceDataUpload sourceDataUpload, Source source) throws ServerException {
        if (null == values || values.size() <= 0) {
            return;
        }

        SqlUtils sqlUtils = this.sqlUtils.init(source);

        try {
            if (sourceDataUpload.getMode() == UploadModeEnum.REPLACE.getMode()) {
                //清空表
                sqlUtils.jdbcTemplate().execute("Truncate table `" + sourceDataUpload.getTableName() + "`");
                //插入数据
                executeInsert(sourceDataUpload.getTableName(), headers, values, sqlUtils);
            } else {
                boolean tableIsExist = sqlUtils.tableIsExist(sourceDataUpload.getTableName());
                if (tableIsExist) {
                    executeInsert(sourceDataUpload.getTableName(), headers, values, sqlUtils);
                } else {
                    throw new ServerException("table " + sourceDataUpload.getTableName() + " is not exist");
                }
            }
        } catch (ServerException e) {
            e.printStackTrace();
            throw new ServerException(e.getMessage());
        }

    }


    /**
     * 多线程执行插入数据
     *
     * @param tableName
     * @param headers
     * @param values
     * @param sqlUtils
     * @throws ServerException
     */
    private void executeInsert(String tableName, Set<QueryColumn> headers, List<Map<String, Object>> values, SqlUtils sqlUtils) throws ServerException {
        if (null != values && values.size() > 0) {
            int len = 1000;
            int totalSize = values.size();
            int pageSize = len;
            int totalPage = totalSize / pageSize;
            if (totalSize % pageSize != 0) {
                totalPage += 1;
                if (totalSize < pageSize) {
                    pageSize = values.size();
                }
            }

            ExecutorService executorService = Executors.newCachedThreadPool();

            STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);
            ST st = stg.getInstanceOf("insertData");
            st.add("tableName", tableName);
            st.add("columns", headers);
            String sql = st.render();
            log.info("sql : {}", st.render());
            Future future = null;

            //分页批量插入
            long startTime = System.currentTimeMillis();
            log.info("execute insert start ----  {}", DateUtils.toyyyyMMddHHmmss(startTime));
            for (int pageNum = 1; pageNum < totalPage + 1; pageNum++) {
                int localPageNum = pageNum;
                int localPageSize = pageSize;
                future = executorService.submit(() -> {
                    int starNum = (localPageNum - 1) * localPageSize;
                    int endNum = localPageNum * localPageSize > totalSize ? (totalSize) : localPageNum * localPageSize;
                    log.info("executeInsert thread-{} : start:{}, end: {}", localPageNum, starNum, endNum);
                    sqlUtils.executeBatch(sql, headers, values.subList(starNum, endNum));
                });
            }

            try {
                future.get();

                long endTime = System.currentTimeMillis();
                log.info("execute insert end ----  {}", DateUtils.toyyyyMMddHHmmss(endTime));
                log.info("execution time {} second", (endTime - startTime) / 1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
                throw new ServerException(e.getMessage());
            } catch (ExecutionException e) {
                e.printStackTrace();
                throw new ServerException(e.getMessage());
            } finally {
                executorService.shutdown();
            }
        }
    }
}

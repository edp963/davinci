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

import static edp.core.consts.Consts.JDBC_DATASOURCE_DEFAULT_VERSION;
import static edp.davinci.core.common.Constants.DAVINCI_TOPIC_CHANNEL;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.stringtemplate.v4.ST;
import org.stringtemplate.v4.STGroup;
import org.stringtemplate.v4.STGroupFile;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONObject;

import edp.core.common.jdbc.JdbcDataSource;
import edp.core.enums.DataTypeEnum;
import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.SourceException;
import edp.core.exception.UnAuthorizedExecption;
import edp.core.model.DBTables;
import edp.core.model.JdbcSourceInfo;
import edp.core.model.JdbcSourceInfo.JdbcSourceInfoBuilder;
import edp.core.model.QueryColumn;
import edp.core.model.TableInfo;
import edp.core.utils.BaseLock;
import edp.core.utils.CollectionUtils;
import edp.core.utils.DateUtils;
import edp.core.utils.FileUtils;
import edp.core.utils.RedisUtils;
import edp.core.utils.SourceUtils;
import edp.core.utils.SqlUtils;
import edp.davinci.core.common.Constants;
import edp.davinci.core.enums.CheckEntityEnum;
import edp.davinci.core.enums.FileTypeEnum;
import edp.davinci.core.enums.LogNameEnum;
import edp.davinci.core.enums.SourceTypeEnum;
import edp.davinci.core.enums.UploadModeEnum;
import edp.davinci.core.enums.UserPermissionEnum;
import edp.davinci.core.model.DataUploadEntity;
import edp.davinci.core.model.RedisMessageEntity;
import edp.davinci.core.utils.CsvUtils;
import edp.davinci.core.utils.ExcelUtils;
import edp.davinci.dao.SourceMapper;
import edp.davinci.dao.ViewMapper;
import edp.davinci.dto.projectDto.ProjectDetail;
import edp.davinci.dto.projectDto.ProjectPermission;
import edp.davinci.dto.sourceDto.DatasourceType;
import edp.davinci.dto.sourceDto.DbBaseInfo;
import edp.davinci.dto.sourceDto.SourceConfig;
import edp.davinci.dto.sourceDto.SourceCreate;
import edp.davinci.dto.sourceDto.SourceDataUpload;
import edp.davinci.dto.sourceDto.SourceDetail;
import edp.davinci.dto.sourceDto.SourceInfo;
import edp.davinci.dto.sourceDto.SourceTest;
import edp.davinci.dto.sourceDto.UploadMeta;
import edp.davinci.model.Source;
import edp.davinci.model.User;
import edp.davinci.model.View;
import edp.davinci.runner.LoadSupportDataSourceRunner;
import edp.davinci.service.ProjectService;
import edp.davinci.service.SourceService;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service("sourceService")
public class SourceServiceImpl extends BaseEntityService implements SourceService {

	private static final Logger optLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_OPERATION.getName());

	@Autowired
	private SourceMapper sourceMapper;

	@Autowired
	private SqlUtils sqlUtils;

	@Autowired
	private ViewMapper viewMapper;

	@Autowired
	private ProjectService projectService;

	@Autowired
	private JdbcDataSource jdbcDataSource;

	@Autowired
	private RedisUtils redisUtils;
	
	private static final CheckEntityEnum entity = CheckEntityEnum.SOURCE;

	@Override
	public boolean isExist(String name, Long id, Long projectId) {
		Long sourceId = sourceMapper.getByNameWithProjectId(name, projectId);
		if (null != id && null != sourceId) {
			return !id.equals(sourceId);
		}
		return null != sourceId && sourceId.longValue() > 0L;
	}
	
	private void checkIsExist(String name, Long id, Long projectId) {
		if (isExist(name, id, projectId)) {
			alertNameTaken(entity, name);
		}
	}
	
	/**
	 * 获取source列表
	 *
	 * @param projectId
	 * @param user
	 * @return
	 */
	@Override
	public List<Source> getSources(Long projectId, User user)
			throws NotFoundException, UnAuthorizedExecption, ServerException {

		ProjectDetail projectDetail = null;
		try {
			projectDetail = projectService.getProjectDetail(projectId, user, false);
		} catch (NotFoundException e) {
			throw e;
		} catch (UnAuthorizedExecption e) {
			return null;
		}

		List<Source> sources = sourceMapper.getByProject(projectId);

		if (!CollectionUtils.isEmpty(sources)) {
			ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
			if (projectPermission.getSourcePermission() == UserPermissionEnum.HIDDEN.getPermission()) {
				sources = null;
			}
		}

		return sources;
	}

	@Override
	public SourceDetail getSourceDetail(Long id, User user)
			throws NotFoundException, UnAuthorizedExecption, ServerException {

		Source source = getSource(id);

		ProjectPermission projectPermission = getProjectPermission(source.getProjectId(), user);

		if (projectPermission.getSourcePermission() == UserPermissionEnum.HIDDEN.getPermission()) {
			throw new UnAuthorizedExecption();
		}

		SourceDetail sourceDetail = new SourceDetail();
		BeanUtils.copyProperties(source, sourceDetail);

		if (projectPermission.getSourcePermission() == UserPermissionEnum.READ.getPermission()) {
			sourceDetail.setConfig(null);
		}

		return sourceDetail;
	}

	/**
	 * 创建source
	 *
	 * @param sourceCreate
	 * @param user
	 * @return
	 */
	@Override
	@Transactional
	public Source createSource(SourceCreate sourceCreate, User user)
			throws NotFoundException, UnAuthorizedExecption, ServerException {
		
		Long projectId = sourceCreate.getProjectId();
		checkWritePermission(entity, projectId, user, "create");

		String name = sourceCreate.getName();
		checkIsExist(name, null, projectId);

		if (null == SourceTypeEnum.typeOf(sourceCreate.getType())) {
			throw new ServerException("Invalid source type");
		}

		BaseLock lock = getLock(entity, name, projectId);
		if (lock != null && !lock.getLock()) {
			alertNameTaken(entity, name);
		}
		
		try{

			SourceConfig config = sourceCreate.getConfig();
			
			// 测试连接
			if (!testConnection(config)) {
				throw new ServerException("test source connection fail");
			}
			
			Source source = new Source().createdBy(user.getId());
			BeanUtils.copyProperties(sourceCreate, source);
			source.setConfig(JSONObject.toJSONString(config));

			if (sourceMapper.insert(source) != 1) {
				log.info("create source fail:{}", source.toString());
				throw new ServerException("create source fail");
			}

			optLogger.info("source ({}) create by user (:{})", source.toString(), user.getId());
			return source;

		}finally {
			releaseLock(lock);
		}
	}
	
	private Source getSource(Long id) {

		Source source = sourceMapper.getById(id);

		if (null == source) {
			log.warn("source (:{}) is not found", id);
			throw new NotFoundException("this source is not found");
		}

		return source;
	}

	private boolean testConnection(SourceConfig config) {
		return sqlUtils.init(
                        config.getUrl(),
                        config.getUsername(),
                        config.getPassword(),
                        config.getVersion(),
                        config.getProperties(),
                        config.isExt()
                ).testConnection();
	}

	/**
	 * 修改source
	 *
	 * @param sourceInfo
	 * @param user
	 * @return
	 */
	@Override
	@Transactional
	public Source updateSource(SourceInfo sourceInfo, User user)
			throws NotFoundException, UnAuthorizedExecption, ServerException {
		
		Source source = getSource(sourceInfo.getId());
		checkWritePermission(entity, source.getProjectId(), user, "update");
		
		String name = sourceInfo.getName();
		Long projectId = source.getProjectId();
		checkIsExist(name, source.getId(), projectId);
		
        BaseLock lock = getLock(entity, name, projectId);
        if (!lock.getLock()) {
        	alertNameTaken(entity, name);
        }

		try {
			
			SourceConfig config = sourceInfo.getConfig();

			// 测试连接
			if (!testConnection(config)) {
				throw new ServerException("test source connection fail");
			}

			// 失效的数据源
			Source sourceCopy = new Source();
			BeanUtils.copyProperties(source, sourceCopy);

			BeanUtils.copyProperties(sourceInfo, source);
			source.updatedBy(user.getId());
			source.setConfig(JSONObject.toJSONString(sourceInfo.getConfig()));

			if (sourceMapper.update(source) != 1) {
				log.info("update source fail:{}", source.toString());
				throw new ServerException("update source fail:unspecified error");
			}
			
			// 释放失效数据源
			String copyKey = SourceUtils.getKey(
					sourceCopy.getJdbcUrl(), 
					sourceCopy.getUsername(),
					sourceCopy.getPassword(), 
					sourceCopy.getDbVersion(), 
					sourceCopy.isExt());
			
			String newKey = SourceUtils.getKey(
					config.getUrl(), 
					config.getUsername(), 
					config.getPassword(),
					config.getVersion(), 
					config.isExt());
			
			if (!newKey.equals(copyKey)) {
				releaseSource(sourceCopy);
			}

			optLogger.info("source ({}) update by user (:{})", source.toString(), user.getId());
			return source;
			
		} finally {
			releaseLock(lock);
		}
	}

	/**
	 * 删除source
	 *
	 * @param id
	 * @param user
	 * @return
	 */
	@Override
	@Transactional
	public boolean deleteSrouce(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException {

		Source source = getSource(id);

		checkWritePermission(entity, source.getProjectId(), user, "delete");

		List<View> viewList = viewMapper.getBySourceId(id);
		if (!CollectionUtils.isEmpty(viewList)) {
			log.warn("There is at least one view using the source ({}), it is can not be deleted", id);
			throw new ServerException("There is at least one view using the source, it is can not be deleted");
		}

		if (sourceMapper.deleteById(id) == 1) {
			optLogger.info("source ({}) delete by user (:{})", source.toString(), user.getId());
			releaseSource(source);
			return true;
		}

		return false;
	}

	/**
	 * 测试连接
	 *
	 * @param sourceTest
	 * @return
	 */
	@Override
	public boolean testSource(SourceTest sourceTest) throws ServerException {

		boolean testConnection = false;
		
		try {

			if (!sourceTest.isExt()) {
				sourceTest.setVersion(null);
			}

			if (StringUtils.isEmpty(sourceTest.getVersion())
					|| JDBC_DATASOURCE_DEFAULT_VERSION.equals(sourceTest.getVersion())) {
				sourceTest.setVersion(null);
				sourceTest.setExt(false);
			}

            testConnection = sqlUtils
                    .init(
                            sourceTest.getUrl(),
                            sourceTest.getUsername(),
                            sourceTest.getPassword(),
                            sourceTest.getVersion(),
                            sourceTest.getProperties(),
                            sourceTest.isExt()
                    ).testConnection();

		} catch (SourceException e) {
			log.error(e.getMessage());
			throw new ServerException(e.getMessage());
		}

		if (!testConnection) {
			throw new ServerException("test source connection fail");
		}

		return true;
	}

	/**
	 * 生成csv对应的表结构
	 *
	 * @param sourceId
	 * @param uploadMeta
	 * @param user
	 * @return
	 */
	@Override
	public void validCsvmeta(Long sourceId, UploadMeta uploadMeta, User user)
			throws NotFoundException, UnAuthorizedExecption, ServerException {

		Source source = getSource(sourceId);

		checkWritePermission(entity, source.getProjectId(), user, "upload csv file in");

		if (uploadMeta.getMode() == UploadModeEnum.REPLACE.getMode()) {
			return;
		}

		try {
			boolean tableIsExist = sqlUtils.init(source).tableIsExist(uploadMeta.getTableName());
			if (uploadMeta.getMode() == UploadModeEnum.NEW.getMode()) {
				if (tableIsExist) {
					throw new ServerException("table " + uploadMeta.getTableName() + " is already exist");
				}
			} else {
				if (!tableIsExist) {
					throw new ServerException("table " + uploadMeta.getTableName() + " is not exist");
				}
			}
		} catch (SourceException e) {
			log.error(e.getMessage());
			throw new ServerException(e.getMessage());
		}
	}

	/**
	 * 上传csv文件
	 *
	 * @param sourceId
	 * @param sourceDataUpload
	 * @param file
	 * @param user
	 * @param type
	 * @return
	 */
	@Override
	@Transactional
	public Boolean dataUpload(Long sourceId, SourceDataUpload sourceDataUpload, MultipartFile file, User user,
			String type) throws NotFoundException, UnAuthorizedExecption, ServerException {

		Source source = getSource(sourceId);

		checkWritePermission(entity, source.getProjectId(), user, "upload data in");

		if (!type.equals(FileTypeEnum.CSV.getType()) && !type.equals(FileTypeEnum.XLSX.getType())
				&& !type.equals(FileTypeEnum.XLS.getType())) {
			throw new ServerException("Unsupported file format");
		}

		// 校验文件是否csv文件
		if (type.equals(FileTypeEnum.CSV.getType()) && !FileUtils.isCsv(file)) {
			throw new ServerException("Please upload csv file");
		}

		if (type.equals(FileTypeEnum.XLSX.getType()) && !FileUtils.isExcel(file)) {
			throw new ServerException("Please upload excel file");
		}

		DataTypeEnum dataTypeEnum = DataTypeEnum.urlOf(source.getJdbcUrl());
		if (dataTypeEnum != DataTypeEnum.MYSQL) {
			log.info("Unsupported data source， {}", source.getJdbcUrl());
			throw new ServerException("Unsupported data source: " + source.getJdbcUrl());
		}

		try {
			DataUploadEntity dataUploadEntity = null;
			if (type.equals(FileTypeEnum.CSV.getType())) {
				// 解析csv文件
				dataUploadEntity = CsvUtils.parseCsvWithFirstAsHeader(file, "UTF-8");
			} else {
				// 解析excel文件
				dataUploadEntity = ExcelUtils.parseExcelWithFirstAsHeader(file);
			}

			if (null != dataUploadEntity && !CollectionUtils.isEmpty(dataUploadEntity.getHeaders())) {
				// 建表
				createTable(dataUploadEntity.getHeaders(), sourceDataUpload, source);
				// 传输数据
				insertData(dataUploadEntity.getHeaders(), dataUploadEntity.getValues(), sourceDataUpload, source);
			}
		} catch (Exception e) {
			throw new ServerException(e.getMessage());
		}

		return true;
	}
	
	private <T> T handleHiddenPermission(T obj, ProjectDetail projectDetail, User user, Long sourceId,
			String operation) {
		ProjectPermission projectPermission = projectService.getProjectPermission(projectDetail, user);
		if (projectPermission.getSourcePermission() != UserPermissionEnum.HIDDEN.getPermission()) {
			return obj;
		}
		
		log.info("user (:{}) have not permission to get source (:{}) {}", user.getId(), sourceId, operation);
		return null;
	}
	
	/**
	 * 获取Source 的 db
	 *
	 * @param id
	 * @param user
	 * @return
	 * @throws NotFoundException
	 * @throws ServerException
	 */
	@Override
	public List<String> getSourceDbs(Long id, User user) throws NotFoundException, ServerException {

		Source source = getSource(id);

		ProjectDetail projectDetail = projectService.getProjectDetail(source.getProjectId(), user, false);

		List<String> dbList = null;

		try {
			dbList = sqlUtils.init(source).getDatabases();
		} catch (SourceException e) {
			throw new ServerException(e.getMessage());
		}

		if (null != dbList) {
			dbList = handleHiddenPermission(dbList, projectDetail, user, source.getId(), "databases");
		}

		return dbList;
	}

	/**
	 * 获取Source的data tables
	 *
	 * @param id
	 * @param user
	 * @return
	 */
	@Override
	public DBTables getSourceTables(Long id, String dbName, User user) throws NotFoundException {

		DBTables dbTable = new DBTables(dbName);

		Source source = getSource(id);

		ProjectDetail projectDetail = projectService.getProjectDetail(source.getProjectId(), user, false);

		List<QueryColumn> tableList = null;
		try {
			tableList = sqlUtils.init(source).getTableList(dbName);
		} catch (SourceException e) {
			throw new ServerException(e.getMessage());
		}

		if (null != tableList) {
			handleHiddenPermission(tableList, projectDetail, user, source.getId(), "tables");
		}

		if (null != tableList) {
			dbTable.setTables(tableList);
		}

		return dbTable;
	}

	/**
	 * 获取Source的data tables
	 *
	 * @param id
	 * @param user
	 * @return
	 */
	@Override
	public TableInfo getTableInfo(Long id, String dbName, String tableName, User user) throws NotFoundException {

		Source source = getSource(id);

		ProjectDetail projectDetail = projectService.getProjectDetail(source.getProjectId(), user, false);

		TableInfo tableInfo = null;
		try {
			tableInfo = sqlUtils.init(source).getTableInfo(dbName, tableName);
		} catch (SourceException e) {
			e.printStackTrace();
			throw new ServerException(e.getMessage());
		}

		if (null != tableInfo) {
			handleHiddenPermission(tableInfo, projectDetail, user, source.getId(), "table columns");
		}

		return tableInfo;
	}

	@Override
	public List<DatasourceType> getDatasources() {

		return LoadSupportDataSourceRunner.getSupportDatasourceList();
	}

	@Override
	public boolean reconnect(Long id, DbBaseInfo dbBaseInfo, User user)
			throws NotFoundException, UnAuthorizedExecption, ServerException {

		Source source = getSource(id);

		checkWritePermission(entity, source.getProjectId(), user, "reconnect");

		if (!(dbBaseInfo.getDbUser().equals(source.getUsername())
				&& dbBaseInfo.getDbPassword().equals(source.getPassword()))) {
			log.warn("reconnect source (:{}) error, dbuser and dbpassword is wrong", id);
			throw new ServerException("user or password is wrong");
		}

		releaseSource(source);

		return sqlUtils.init(source).testConnection();
	}

	/**
	 * 释放失效数据源
	 * 
	 * @param source
	 */
	private void releaseSource(Source source) {

		if (redisUtils.isRedisEnable()) {
			Map<String,Object> map = new HashMap<>();
			
			map.put("url", source.getJdbcUrl());
			map.put("username", source.getUsername());
			map.put("password", source.getPassword());
			map.put("version", source.getDbVersion());
			map.put("ext", source.isExt());
			
			publishReconnect(JSON.toJSONString(map));
		} else {
			SourceUtils sourceUtils = new SourceUtils(jdbcDataSource);
			JdbcSourceInfo jdbcSourceInfo = JdbcSourceInfoBuilder
					.aJdbcSourceInfo()
					.withJdbcUrl(source.getJdbcUrl())
					.withUsername(source.getUsername())
					.withPassword(source.getPassword())
					.withDatabase(source.getDatabase())
					.withDbVersion(source.getDbVersion())
					.withProperties(source.getProperties())
					.withExt(source.isExt())
					.build();

			sourceUtils.releaseDataSource(jdbcSourceInfo);
		}
	}

	/**
	 * 向redis发布reconnect消息
	 * 
	 * @param message
	 */
	private void publishReconnect(String message) {

		//	String flag = MD5Util.getMD5(UUID.randomUUID().toString() + id, true, 32);
		// the flag is deprecated
		String flag = "-1";
		redisUtils.convertAndSend(DAVINCI_TOPIC_CHANNEL, new RedisMessageEntity(SourceMessageHandler.class,  message, flag));
	}

	/**
	 * 建表
	 *
	 * @param fileds
	 * @param sourceDataUpload
	 * @param source
	 * @throws ServerException
	 */
	private void createTable(Set<QueryColumn> fileds, SourceDataUpload sourceDataUpload, Source source)
			throws ServerException {

		if (CollectionUtils.isEmpty(fileds)) {
			throw new ServerException("there is have not any fileds");
		}

		SqlUtils sqlUtils = this.sqlUtils.init(source);

		STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);

		String sql = null;

		if (sourceDataUpload.getMode() == UploadModeEnum.REPLACE.getMode()) {
			ST st = stg.getInstanceOf("createTable");
			st.add("tableName", sourceDataUpload.getTableName());
			st.add("fields", fileds);
			st.add("primaryKeys", StringUtils.isEmpty(sourceDataUpload.getPrimaryKeys()) ? null
					: sourceDataUpload.getPrimaryKeys().split(","));
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
	private void insertData(Set<QueryColumn> headers, List<Map<String, Object>> values,
			SourceDataUpload sourceDataUpload, Source source) throws ServerException {

		if (CollectionUtils.isEmpty(values)) {
			return;
		}

		SqlUtils sqlUtils = this.sqlUtils.init(source);

		try {
			if (sourceDataUpload.getMode() == UploadModeEnum.REPLACE.getMode()) {
				// 清空表
				sqlUtils.jdbcTemplate().execute("Truncate table `" + sourceDataUpload.getTableName() + "`");
				// 插入数据
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
	private void executeInsert(String tableName, Set<QueryColumn> headers, List<Map<String, Object>> values,
			SqlUtils sqlUtils) throws ServerException {

		if (!CollectionUtils.isEmpty(values)) {
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

			ExecutorService executorService = Executors.newFixedThreadPool(8);

			STGroup stg = new STGroupFile(Constants.SQL_TEMPLATE);
			ST st = stg.getInstanceOf("insertData");
			st.add("tableName", tableName);
			st.add("columns", headers);
			String sql = st.render();
			log.info("sql : {}", st.render());
			Future future = null;

			// 分页批量插入
			long startTime = System.currentTimeMillis();
			log.info("execute insert start ---- {}", DateUtils.toyyyyMMddHHmmss(startTime));
			for (int pageNum = 1; pageNum < totalPage + 1; pageNum++) {
				int localPageNum = pageNum;
				int localPageSize = pageSize;
				future = executorService.submit(() -> {
					int starNum = (localPageNum - 1) * localPageSize;
					int endNum = localPageNum * localPageSize > totalSize ? (totalSize) : localPageNum * localPageSize;
					log.info("executeInsert thread-{} : start:{}, end:{}", localPageNum, starNum, endNum);
					sqlUtils.executeBatch(sql, headers, values.subList(starNum, endNum));
				});
			}

			try {
				future.get();
				long endTime = System.currentTimeMillis();
				log.info("execute insert end ---- {}", DateUtils.toyyyyMMddHHmmss(endTime));
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

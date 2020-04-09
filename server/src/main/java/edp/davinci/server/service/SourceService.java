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

package edp.davinci.server.service;

import edp.davinci.core.dao.entity.Source;
import edp.davinci.server.dto.source.*;
import edp.davinci.server.exception.NotFoundException;
import edp.davinci.server.exception.ServerException;
import edp.davinci.server.exception.UnAuthorizedExecption;
import edp.davinci.server.model.DBTables;
import edp.davinci.server.model.TableInfo;
import edp.davinci.server.model.User;

import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SourceService extends CheckEntityService {

    List<Source> getSources(Long projectId, User user) throws NotFoundException, UnAuthorizedExecption, ServerException;

    Source createSource(SourceCreate sourceCreate, User user) throws NotFoundException, UnAuthorizedExecption, ServerException;

    Source updateSource(SourceInfo sourceInfo, User user) throws NotFoundException, UnAuthorizedExecption, ServerException;

    boolean deleteSrouce(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException;

    boolean testSource(SourceConfig sourceConfig) throws ServerException;

    void validCsvmeta(Long sourceId, UploadMeta uploadMeta, User user) throws NotFoundException, UnAuthorizedExecption, ServerException;

    Boolean dataUpload(Long sourceId, SourceDataUpload sourceDataUpload, MultipartFile file, User user, String type) throws NotFoundException, UnAuthorizedExecption, ServerException;

    List<String> getSourceDatabases(Long id, User user) throws NotFoundException, ServerException;

    DBTables getSourceTables(Long id, String dbName, User user) throws NotFoundException;

    TableInfo getTableInfo(Long id, String dbName, String tableName, User user) throws NotFoundException;

    Source getSourceDetail(Long id, User user) throws NotFoundException, UnAuthorizedExecption, ServerException;

    List<DatasourceType> getSupportDatasources();

    boolean reconnect(Long id, DbBaseInfo dbBaseInfo, User user) throws NotFoundException, UnAuthorizedExecption, ServerException;
}

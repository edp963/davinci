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

package edp.davinci.server.controller;

import edp.davinci.commons.util.StringUtils;
import edp.davinci.core.dao.entity.DownloadRecord;
import edp.davinci.core.dao.entity.ShareDownloadRecord;
import edp.davinci.server.annotation.AuthIgnore;
import edp.davinci.server.annotation.AuthShare;
import edp.davinci.server.annotation.CurrentUser;
import edp.davinci.server.commons.Constants;
import edp.davinci.server.dto.view.DownloadViewExecuteParam;
import edp.davinci.server.enums.DownloadType;
import edp.davinci.server.enums.FileTypeEnum;
import edp.davinci.core.dao.entity.User;
import edp.davinci.server.enums.ShareOperation;
import edp.davinci.server.enums.ShareType;
import edp.davinci.server.service.DownloadService;
import edp.davinci.server.service.ShareDownloadService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.util.http.fileupload.util.Streams;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;
import java.io.File;
import java.io.FileInputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.List;

/**
 * Created by IntelliJ IDEA.
 *
 * @Author daemon
 * @Date 19/5/27 20:30
 * To change this template use File | Settings | File Templates.
 */
@Api(value = "/download", tags = "download", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
@ApiResponses(@ApiResponse(code = 404, message = "download not found"))
@Slf4j
@RestController
@RequestMapping(value = Constants.BASE_API_PATH + "/download")
public class DownloadController extends BaseController {

    @Autowired
    private DownloadService downloadService;

    @Autowired
    private ShareDownloadService shareDownloadService;

    @ApiOperation(value = "get download record page")
    @GetMapping(value = "/page", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntity getDownloadRecordPage(@ApiIgnore @CurrentUser User user,
                                                HttpServletRequest request) {
        List<DownloadRecord> records = downloadService.queryDownloadRecordPage(user.getId());
        return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payload(records));
    }


    @ApiOperation(value = "get download record file")
    @GetMapping(value = "/record/file/{id}/{token:.*}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    @AuthIgnore
    public ResponseEntity getDownloadRecordFile(@PathVariable Long id,
                                                @PathVariable String token,
                                                HttpServletRequest request,
                                                HttpServletResponse response) {
		DownloadRecord record = downloadService.downloadById(id, token);
		try (FileInputStream is = new FileInputStream(new File(record.getPath()));) {
			encodeFileName(request, response, record.getName() + FileTypeEnum.XLSX.getFormat());
			Streams.copy(is, response.getOutputStream(), true);
		} catch (Exception e) {
			log.error("Get downloadRecordFile error, id:" + id + ", e:", e.getMessage());
		}
		return null;
    }


    @ApiOperation(value = "get download record file")
    @PostMapping(value = "/submit/{type}/{id}", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    public ResponseEntity submitDownloadTask(@PathVariable String type,
                                             @PathVariable Long id,
                                             @ApiIgnore @CurrentUser User user,
                                             @Valid @RequestBody(required = false) DownloadViewExecuteParam[] params,
                                             HttpServletRequest request) {
        List<DownloadViewExecuteParam> downloadViewExecuteParams = Arrays.asList(params);
        boolean rst = downloadService.submit(DownloadType.getDownloadType(type), id, user, downloadViewExecuteParams);
        return ResponseEntity.ok(rst ? new ResultMap(tokenUtils).successAndRefreshToken(request).payload(null) :
                new ResultMap(tokenUtils).failAndRefreshToken(request).payload(null));
    }


    @ApiOperation(value = "submit share download")
    @PostMapping(value = "/share/submit/{type}/{uuid}/{token:.*}", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    @AuthShare(type = ShareType.DATA, operation = ShareOperation.DOWNLOAD)
    public ResponseEntity submitShareDownloadTask(@PathVariable(name = "token") String token,
                                                  @RequestParam(required = false) String password,
                                                  @PathVariable(name = "uuid") String uuid,
                                                  @PathVariable(name = "type") String type,
                                                  @Valid @RequestBody(required = false) DownloadViewExecuteParam[] params) {

        List<DownloadViewExecuteParam> downloadViewExecuteParams = Arrays.asList(params);
        boolean rst = shareDownloadService.submit(DownloadType.getDownloadType(type), uuid, downloadViewExecuteParams);

        return ResponseEntity.ok(rst ? new ResultMap().success() : new ResultMap().fail());
    }

    @ApiOperation(value = "get download record file")
    @GetMapping(value = "/share/record/file/{id}/{uuid}/{token:.*}", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
    @AuthShare(type = ShareType.FILE, operation = ShareOperation.DOWNLOAD)
    public ResponseEntity getShareDownloadRecordFile(@PathVariable(name = "token") String token,
                                                     @RequestParam(required = false) String password,
                                                     @PathVariable(name = "uuid") String uuid,
                                                     @PathVariable(name = "id") String id,
                                                     HttpServletRequest request,
                                                     HttpServletResponse response) {
        ShareDownloadRecord record = shareDownloadService.downloadById(id, uuid);
        try (FileInputStream is = new FileInputStream(new File(record.getPath()));) {
            encodeFileName(request, response, record.getName() + FileTypeEnum.XLSX.getFormat());
            Streams.copy(is, response.getOutputStream(), true);
        } catch (Exception e) {
            log.error("Get downloadRecordFile error, id:" + id + ", e:", e.getMessage());
        }
        return null;
    }

    @ApiOperation(value = "get share download record page")
    @GetMapping(value = "/share/page/{uuid}/{token:.*}", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
    @AuthShare(type = ShareType.RECORD, operation = ShareOperation.DOWNLOAD)
    public ResponseEntity getShareDownloadRecordPage(@PathVariable(name = "token") String token,
                                                     @RequestParam(required = false) String password,
                                                     @PathVariable(name = "uuid") String uuid,
                                                     @ApiIgnore @CurrentUser User user,
                                                     HttpServletRequest request) {
        List<ShareDownloadRecord> records = shareDownloadService.queryDownloadRecordPage(uuid);

        if (null == user || user.getId() == null) {
            return ResponseEntity.ok(new ResultMap(tokenUtils).payloads(records));
        } else {
            return ResponseEntity.ok(new ResultMap(tokenUtils).successAndRefreshToken(request).payloads(records));
        }
    }


    private void encodeFileName(HttpServletRequest request, HttpServletResponse response, String filename) throws UnsupportedEncodingException {
        response.setHeader("Content-Type", "application/force-download");
        if (request.getHeader("User-Agent").toLowerCase().indexOf("firefox") > 0) {
            // firefox浏览器
            filename = new String(filename.getBytes(StandardCharsets.UTF_8), "ISO8859-1");
        } else if (isIE(request)) {
            //IE
            filename = URLEncoder.encode(filename, "UTF-8");
        } else {
            filename = new String(filename.getBytes(StandardCharsets.UTF_8), "ISO8859-1");
        }
        response.setHeader("Content-Disposition", "attachment; filename=\"" + filename + "\"");
    }

    private static boolean isIE(HttpServletRequest request) {
        String ua = request.getHeader("User-Agent").toLowerCase();
        return ((ua.indexOf("rv") > 0 && ua.contains("like gecko")) || ua.indexOf("msie") > 0);
    }
}

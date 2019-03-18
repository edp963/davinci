/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2018 EDP
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

package edp.davinci.core.config;

import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedExecption;
import edp.core.utils.TokenUtils;
import edp.davinci.core.common.ResultMap;
import edp.davinci.core.enums.LogNameEnum;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.sql.SQLException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@ControllerAdvice(annotations = RestController.class)
@Slf4j
public class RestExceptionHandler {

    private static final Logger sqlLogger = LoggerFactory.getLogger(LogNameEnum.BUSINESS_SQL.getName());

    @Autowired
    private TokenUtils tokenUtils;

    private static final String REG_GETDATA = "(views|share)/((\\d+/(getdata|getdistinctvalue))|executesql|data/.+)";


    @ExceptionHandler
    @ResponseBody
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    private ResultMap commonExceptionHandler(HttpServletRequest request, Exception e) {
        e.printStackTrace();
        log.error(e.getMessage());
        return new ResultMap(tokenUtils).failAndRefreshToken(request).message(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase());
    }

    @ExceptionHandler(value = ServerException.class)
    @ResponseBody
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    private ResultMap serverExceptionHandler(HttpServletRequest request, Exception e) {
        e.printStackTrace();
        log.error(e.getMessage());
        return new ResultMap(tokenUtils).failAndRefreshToken(request).message(e.getMessage());
    }

    @ExceptionHandler(value = UnAuthorizedExecption.class)
    @ResponseBody
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    private ResultMap unAuthorizedExceptionHandler(HttpServletRequest request, Exception e) {
        log.error(e.getMessage());
        return new ResultMap(tokenUtils).failAndRefreshToken(request).message(e.getMessage());
    }

    @ExceptionHandler(value = SQLException.class)
    @ResponseBody
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    //TODO share 与 登录请求分开处理
    private ResultMap sqlExceptionHandler(HttpServletRequest request, Exception e) {
        e.printStackTrace();

        String message = HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase();

        String servletPath = request.getServletPath();
        Pattern pattern = Pattern.compile(REG_GETDATA);
        Matcher matcher = pattern.matcher(servletPath);
        if (matcher.find()) {
            sqlLogger.info(e.getMessage());
            message = e.getMessage();
        } else {
            log.error(e.getMessage());
        }

        return new ResultMap(tokenUtils).failAndRefreshToken(request).message(message);
    }

    @ExceptionHandler(value = NotFoundException.class)
    @ResponseBody
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    private ResultMap notFoundExceptionHandler(HttpServletRequest request, Exception e) {
        log.error(e.getMessage());
        return new ResultMap(tokenUtils).failAndRefreshToken(request).message(e.getMessage());
    }

}

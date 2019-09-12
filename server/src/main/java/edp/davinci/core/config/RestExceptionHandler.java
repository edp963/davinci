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

package edp.davinci.core.config;

import edp.core.enums.HttpCodeEnum;
import edp.core.exception.ForbiddenExecption;
import edp.core.exception.NotFoundException;
import edp.core.exception.ServerException;
import edp.core.exception.UnAuthorizedExecption;
import edp.core.utils.TokenUtils;
import edp.davinci.core.common.ResultMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;

@ControllerAdvice(annotations = RestController.class)
@Slf4j
public class RestExceptionHandler {

    @Autowired
    private TokenUtils tokenUtils;

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

    @ExceptionHandler(value = ForbiddenExecption.class)
    @ResponseBody
    @ResponseStatus(HttpStatus.FORBIDDEN)
    private ResultMap forbiddenExceptionHandler(HttpServletRequest request, Exception e) {
        log.error(e.getMessage());
        return new ResultMap(tokenUtils).failAndRefreshToken(request, HttpCodeEnum.FORBIDDEN).message(e.getMessage());
    }

    @ExceptionHandler(value = UnAuthorizedExecption.class)
    @ResponseBody
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    private ResultMap unAuthorizedExceptionHandler(HttpServletRequest request, Exception e) {
        log.error(e.getMessage());
        return new ResultMap(tokenUtils).failAndRefreshToken(request, HttpCodeEnum.UNAUTHORIZED).message(e.getMessage());
    }

    @ExceptionHandler(value = NotFoundException.class)
    @ResponseBody
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    private ResultMap notFoundExceptionHandler(HttpServletRequest request, Exception e) {
        log.error(e.getMessage());
        return new ResultMap(tokenUtils).failAndRefreshToken(request, HttpCodeEnum.NOT_FOUND).message(e.getMessage());
    }

    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    @ResponseBody
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    private ResultMap methodArgumentNotValidExceptionHandler(HttpServletRequest request, Exception e) {
        log.error(e.getMessage());
        return new ResultMap(tokenUtils).failAndRefreshToken(request, HttpCodeEnum.FAIL).message(e.getMessage());
    }

}

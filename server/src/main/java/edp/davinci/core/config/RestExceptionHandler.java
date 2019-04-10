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

import edp.core.exception.ServerException;
import edp.core.utils.TokenUtils;
import edp.davinci.core.common.ResultMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.sql.SQLException;

@ControllerAdvice(annotations = RestController.class)
public class RestExceptionHandler {


    @Autowired
    private TokenUtils tokenUtils;

    @ExceptionHandler
    @ResponseBody
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    private ResultMap runtimeExceptionHandler(HttpServletRequest request, Exception e) {

        e.printStackTrace();

        String message = HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase();
        if (e instanceof ServerException || e instanceof SQLException) {
            message = e.getMessage();
        }

        return new ResultMap(tokenUtils).failAndRefreshToken(request).message(message);
    }
}

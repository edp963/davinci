package edp.davinci.controller;

import edp.core.annotation.CurrentUser;
import edp.core.enums.HttpCodeEnum;
import edp.davinci.common.controller.BaseController;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.model.User;
import edp.davinci.service.StarService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import javax.servlet.http.HttpServletRequest;

@Api(value = "/star", tags = "star", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
@ApiResponses(@ApiResponse(code = 404, message = "star not found"))
@Slf4j
@RestController
@RequestMapping(value = Constants.BASE_API_PATH + "/star", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public class StarController extends BaseController {

    @Autowired
    private StarService starService;

    @ApiOperation(value = "star or unstar project")
    @PostMapping("/project/{id}")
    public ResponseEntity starProject(@PathVariable Long id,
                                      @ApiIgnore @CurrentUser User user,
                                      @ApiIgnore HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid project id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = starService.starAndUnstar(Constants.STAR_TARGET_PROJECT, id, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    @ApiOperation(value = "get project star user list")
    @GetMapping("/project/{id}")
    public ResponseEntity getStarUsers(@PathVariable Long id,
                                       @ApiIgnore HttpServletRequest request) {
        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid project id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = starService.getStarUserListByTarget(Constants.STAR_TARGET_PROJECT, id, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    @ApiOperation(value = "get my star project list")
    @GetMapping("/mystar/project")
    public ResponseEntity getMyStarProjects(@ApiIgnore @CurrentUser User user,
                                            @ApiIgnore HttpServletRequest request) {
        try {
            ResultMap resultMap = starService.getStarListByUser(Constants.STAR_TARGET_PROJECT, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            log.error(e.getMessage());
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

}

package edp.davinci.controller;


import edp.core.annotation.CurrentUser;
import edp.core.enums.HttpCodeEnum;
import edp.davinci.common.controller.BaseController;
import edp.davinci.core.common.Constants;
import edp.davinci.core.common.ResultMap;
import edp.davinci.dto.cronJobDto.CronJobBaseInfo;
import edp.davinci.dto.cronJobDto.CronJobUpdate;
import edp.davinci.model.User;
import edp.davinci.service.CronJobService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import springfox.documentation.annotations.ApiIgnore;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

//@ApiIgnore
@Api(value = "/cronjobs", tags = "cronjobs", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
@ApiResponses(@ApiResponse(code = 404, message = "cronjob not found"))
@Slf4j
@RestController
@RequestMapping(value = Constants.BASE_API_PATH + "/cronjobs", produces = MediaType.APPLICATION_JSON_UTF8_VALUE)
public class CronJobController extends BaseController {

    @Autowired
    private CronJobService cronJobService;

    /**
     * 获取cronjob列表
     *
     * @param projectId
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "get jobs")
    @GetMapping
    public ResponseEntity getCronJobs(@RequestParam Long projectId,
                                      @ApiIgnore @CurrentUser User user,
                                      HttpServletRequest request) {
        if (invalidId(projectId)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid project id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }
        try {
            ResultMap resultMap = cronJobService.getCronJobs(projectId, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 创建 cronjob
     *
     * @param cronJob
     * @param bindingResult
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "create job")
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity createCronJob(@Valid @RequestBody CronJobBaseInfo cronJob,
                                                @ApiIgnore BindingResult bindingResult,
                                                @ApiIgnore @CurrentUser User user,
                                                HttpServletRequest request) {

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = cronJobService.createCronJob(cronJob, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * 更新 cron job
     * @param id
     * @param cronJob
     * @param bindingResult
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "update job")
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity updateCronJob(@PathVariable Long id,
                                                @Valid @RequestBody CronJobUpdate cronJob,
                                                @ApiIgnore BindingResult bindingResult,
                                                @ApiIgnore @CurrentUser User user,
                                                HttpServletRequest request) {

        if (bindingResult.hasErrors()) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message(bindingResult.getFieldErrors().get(0).getDefaultMessage());
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        if (invalidId(id) || !cronJob.getId().equals(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = cronJobService.updateCronJob(cronJob, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }

    /**
     * 删除 cron job
     *
     * @param id
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "delete job")
    @DeleteMapping("/{id}")
    public ResponseEntity deleteCronJob(@PathVariable Long id,
                                                @ApiIgnore @CurrentUser User user,
                                                HttpServletRequest request) {

        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = cronJobService.deleteCronJob(id, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    /**
     * start job
     * @param id
     * @param user
     * @param request
     * @return
     */
    @ApiOperation(value = "start job")
    @PostMapping("/start/{id}")
    public ResponseEntity startCronJob(@PathVariable Long id,
                                                @ApiIgnore @CurrentUser User user,
                                                HttpServletRequest request) {

        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = cronJobService.startCronJob(id, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }


    @ApiOperation(value = "stop job")
    @PostMapping("/stop/{id}")
    public ResponseEntity stopCronJob(@PathVariable Long id,
                                       @ApiIgnore @CurrentUser User user,
                                       HttpServletRequest request) {

        if (invalidId(id)) {
            ResultMap resultMap = new ResultMap(tokenUtils).failAndRefreshToken(request).message("Invalid id");
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        }

        try {
            ResultMap resultMap = cronJobService.stopCronJob(id, user, request);
            return ResponseEntity.status(resultMap.getCode()).body(resultMap);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpCodeEnum.SERVER_ERROR.getCode()).body(HttpCodeEnum.SERVER_ERROR.getMessage());
        }
    }
}

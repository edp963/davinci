package edp.davinci.service;

import edp.davinci.core.common.ResultMap;
import edp.davinci.core.service.CheckEntityService;
import edp.davinci.dto.sourceDto.*;
import edp.davinci.model.User;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;

public interface SourceService extends CheckEntityService {


    ResultMap getSources(Long projectId, User user, HttpServletRequest request);

    ResultMap createSource(SourceCreate sourceCreate, User user, HttpServletRequest request);

    ResultMap updateSource(SourceInfo sourceInfo, User user, HttpServletRequest request);

    ResultMap deleteSrouce(Long id, User user, HttpServletRequest request);

    ResultMap testSource(SourceTest sourceTest, User user, HttpServletRequest request);

    ResultMap validCsvmeta(Long sourceId, Csvmeta csvmeta, User user, HttpServletRequest request);

    ResultMap uploadCsv(Long sourceId, CsvUpload csvUpload, MultipartFile file, User user, HttpServletRequest request);
}

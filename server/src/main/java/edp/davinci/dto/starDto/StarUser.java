package edp.davinci.dto.starDto;

import edp.davinci.dto.userDto.UserBaseInfo;
import lombok.Data;

import java.util.Date;

@Data
public class StarUser extends UserBaseInfo {

    private Date starTime;
}

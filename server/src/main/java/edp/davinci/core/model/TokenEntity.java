package edp.davinci.core.model;

import edp.core.model.TokenDetail;
import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;

@Data
public class TokenEntity extends TokenDetail {

    @Autowired
    private String username;

    @Autowired
    private String password;
}

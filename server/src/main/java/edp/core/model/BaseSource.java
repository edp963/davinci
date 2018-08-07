package edp.core.model;

import lombok.extern.slf4j.Slf4j;


@Slf4j
public abstract class BaseSource {


    public abstract String getJdbcUrl();


    public abstract String getUsername();


    public abstract String getPassword();
}

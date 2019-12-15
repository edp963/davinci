
package edp.core.common.jdbc;

import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertNotNull;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.test.context.junit4.SpringRunner;

import edp.core.model.JdbcSourceInfo;
import edp.core.model.JdbcSourceInfo.JdbcSourceInfoBuilder;
import edp.davinci.BaseTest;

/**
 * JdbcDataSourceTest description: ???
 *
 */
@RunWith(SpringRunner.class)
public class JdbcDataSourceTest extends BaseTest {

    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.username}")
    private String username;

    @Value("${spring.datasource.password}")
    private String password;

    @Autowired
    JdbcDataSource dataSource;

    JdbcSourceInfo jdbcSourceInfo;

    @Before
    public void setUp() throws Exception {

        jdbcSourceInfo = JdbcSourceInfoBuilder.aJdbcSourceInfo().withJdbcUrl(url).withUsername(username)
                .withPassword(password).withExt(false).build();
    }

    @Test
    public void getDataSource() {

        assertNotNull(dataSource.getDataSource(jdbcSourceInfo));
    }

    @Test
    public void removeDatasource() {

        dataSource.removeDatasource(jdbcSourceInfo);
        assertFalse(dataSource.isDataSourceExist(jdbcSourceInfo));
    }
}

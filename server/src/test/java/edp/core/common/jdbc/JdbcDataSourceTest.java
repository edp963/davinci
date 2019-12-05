
package edp.core.common.jdbc;

import static org.junit.Assert.*;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.context.junit4.SpringRunner;

import edp.core.model.JdbcSourceInfo;
import edp.core.model.JdbcSourceInfo.JdbcSourceInfoBuilder;

/**
 * JdbcDataSourceTest description: ???
 *
 */
@SpringBootTest(webEnvironment = WebEnvironment.MOCK)
@RunWith(SpringRunner.class)
public class JdbcDataSourceTest {

    @Autowired
    JdbcDataSource dataSource;

    @Test
    public void getDataSource() {

        JdbcSourceInfo jdbcSourceInfo = JdbcSourceInfoBuilder.aJdbcSourceInfo().withJdbcUrl(
                "jdbc:mysql://10.143.252.121:3306/app?allowMultiQueries=true&amp;useUnicode=true&amp;characterEncoding=UTF-8")
                .withUsername("test121").withPassword("dds@test121").withExt(false).build();
        assertNotNull(dataSource.getDataSource(jdbcSourceInfo));
    }
    
    @Test
    public void removeDatasource() {

        JdbcSourceInfo jdbcSourceInfo = JdbcSourceInfoBuilder.aJdbcSourceInfo().withJdbcUrl(
                "jdbc:mysql://10.143.252.121:3306/app?allowMultiQueries=true&amp;useUnicode=true&amp;characterEncoding=UTF-8")
                .withUsername("test121").withPassword("dds@test121").withExt(false).build();
        dataSource.removeDatasource(jdbcSourceInfo);
        assertFalse(dataSource.isDataSourceExist(jdbcSourceInfo));
    }
}

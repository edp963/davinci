
package edp.davinci;

import java.util.List;

import org.junit.Before;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;

import edp.DavinciServerApplication;
import edp.davinci.dao.OrganizationMapper;
import edp.davinci.dao.ProjectMapper;
import edp.davinci.dao.RelUserOrganizationMapper;
import edp.davinci.dao.UserMapper;
import edp.davinci.model.Organization;
import edp.davinci.model.Project;
import edp.davinci.model.RelUserOrganization;
import edp.davinci.model.User;

/**
 * BaseTest description: ???
 *
 */
@SpringBootTest(classes = {DavinciServerApplication.class}, webEnvironment = WebEnvironment.MOCK)
public class BaseTest {

    @Autowired
    UserMapper userMapper;

    @Autowired
    OrganizationMapper orgMapper;

    @Autowired
    ProjectMapper projectMapper;

    @Autowired
    RelUserOrganizationMapper userOrganizationMapper;

    protected User user;

    protected Organization org;

    protected Project project;

    @Before
    public void setUp() throws Exception {
        initTestUser();
        initTestOrg();
        initTestRelUserOrg();
        initTestProject();
    }

    private void initTestUser() {

        user = userMapper.selectByUsername("junit@creditease.cn");

        if (user == null) {
            user = new User();

            user.setEmail("junit@creditease.cn");
            user.setUsername("junit@creditease.cn");
            user.setPassword(BCrypt.hashpw("junittest", BCrypt.gensalt()));
            user.setActive(true);

            userMapper.insert(user);
            user = userMapper.selectByUsername("junit@creditease.cn");
        }
    }
    
    private void initTestOrg() {

        Long orgId = orgMapper.getIdByName("junit@creditease.cn's Organization");

        if (orgId == null) {

            org = new Organization();

            org.setName("junit@creditease.cn's Organization");
            org.setUserId(user.getId());
            org.setProjectNum(1);
            org.setCreateBy(user.getId());

            orgMapper.insert(org);
            orgId = orgMapper.getIdByName("junit@creditease.cn's Organization");
        }

        org = orgMapper.getById(orgId);
    }

    private void initTestRelUserOrg() {

        RelUserOrganization relUserOrganization = userOrganizationMapper.getRel(user.getId(), org.getId());
        if (relUserOrganization == null) {
            relUserOrganization = new RelUserOrganization(org.getId(), user.getId(), (short) 0);
            userOrganizationMapper.insert(relUserOrganization);
        }
    }

    private void initTestProject() {
        
        Long orgId = org.getId();
        Long userId = user.getId();

        List<Project> projects = projectMapper.getByOrgId(orgId);

        if (projects.size() <= 0) {

            project = new Project();

            project.setName("junit project");
            project.setPic("12");
            project.setOrgId(orgId);
            project.setUserId(userId);
            project.setInitialOrgId(orgId);
            project.setCreateUserId(userId);

            projectMapper.insert(project);
            project = projectMapper.getById(projectMapper.getByNameWithOrgId("junit project", orgId));

        }
        else {
            project = projects.get(0);
        }
    }

}

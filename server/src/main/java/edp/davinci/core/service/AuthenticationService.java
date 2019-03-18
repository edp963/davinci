package edp.davinci.core.service;

import edp.davinci.model.Platform;
import edp.davinci.model.User;

import java.util.Map;

public interface AuthenticationService {

    User checkUser(Platform platform, Map<String, String[]> parameter) throws RuntimeException;
}

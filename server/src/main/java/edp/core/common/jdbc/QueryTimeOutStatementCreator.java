/*
 * <<
 *  Davinci
 *  ==
 *  Copyright (C) 2016 - 2019 EDP
 *  ==
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *        http://www.apache.org/licenses/LICENSE-2.0
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *  >>
 *
 */

package edp.core.common.jdbc;

import org.springframework.jdbc.core.PreparedStatementCreator;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

public class QueryTimeOutStatementCreator implements PreparedStatementCreator {
    private final String sql;
    private final int queryTimeOut;

    public QueryTimeOutStatementCreator(String sql, int queryTimeOut) {
        this.sql = sql;
        this.queryTimeOut = queryTimeOut;
    }

    @Override
    public PreparedStatement createPreparedStatement(Connection connection) throws SQLException {
        final PreparedStatement statement = connection.prepareStatement(sql);

        if (queryTimeOut > 0) {
            try {
                statement.setQueryTimeout(queryTimeOut / 1000);
            } catch (Exception e) {
            }
        }
        return statement;
    }
}
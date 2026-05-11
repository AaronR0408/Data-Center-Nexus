package com.dcim.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    @Bean
    @Primary
    public DataSource dataSource() {
        String pgHost = System.getenv("PGHOST");
        String pgPort = System.getenv("PGPORT");
        String pgUser = System.getenv("PGUSER");
        String pgPassword = System.getenv("PGPASSWORD");
        String pgDatabase = System.getenv("PGDATABASE");

        String jdbcUrl;

        if (pgHost != null && pgDatabase != null) {
            // Build JDBC URL from individual PG* vars (most reliable)
            String port = (pgPort != null && !pgPort.isBlank()) ? pgPort : "5432";
            jdbcUrl = String.format("jdbc:postgresql://%s:%s/%s", pgHost, port, pgDatabase);
        } else {
            // Fall back to DATABASE_URL and convert format
            String rawUrl = System.getenv("DATABASE_URL");
            if (rawUrl == null || rawUrl.isBlank()) {
                throw new IllegalStateException("Neither PG* vars nor DATABASE_URL are set");
            }
            // postgresql://user:pass@host:port/db  →  jdbc:postgresql://host:port/db
            jdbcUrl = rawUrl.replaceFirst("^postgres(ql)?://([^@]+@)?", "jdbc:postgresql://");
            jdbcUrl = jdbcUrl.replaceAll("[?&]sslmode=disable", "");
        }

        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(jdbcUrl);
        config.setDriverClassName("org.postgresql.Driver");
        if (pgUser != null) config.setUsername(pgUser);
        if (pgPassword != null) config.setPassword(pgPassword);
        config.setMaximumPoolSize(5);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);

        return new HikariDataSource(config);
    }
}

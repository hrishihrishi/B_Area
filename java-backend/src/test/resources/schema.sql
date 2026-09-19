CREATE TABLE IF NOT EXISTS company_info (
    company_id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    company_name VARCHAR(255) NOT NULL,
    founder VARCHAR(255),
    located VARCHAR(255),
    website VARCHAR(255),
    about TEXT,
    industry VARCHAR(255),
    logo VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);

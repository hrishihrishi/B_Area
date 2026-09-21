-- Test schema for H2 in-memory database (used by @ActiveProfiles("test")).
-- NOTE: H2 does not support pg_trgm or TSVECTOR, so those are excluded.
-- The generated search_vector column is also excluded from H2.

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

CREATE TABLE IF NOT EXISTS products (
    product_id UUID PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES company_info(company_id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    availability VARCHAR(50) DEFAULT 'AVAILABLE',
    pricing VARCHAR(100),
    product_description TEXT,
    logo TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);


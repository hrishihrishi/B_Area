-- Enable trigram extension for fuzzy typo-tolerant search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Company Info Table
CREATE TABLE company_info (
    company_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company_name VARCHAR(255) NOT NULL,
    founder VARCHAR(255),
    located VARCHAR(255),
    website VARCHAR(255),
    about TEXT,
    industry VARCHAR(100),
    clients TEXT[],
    logo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Products & Services Table
CREATE TABLE products (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES company_info(company_id) ON DELETE CASCADE,
    product_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    product_type VARCHAR(50) NOT NULL,
    category VARCHAR(100) NOT NULL,
    availability VARCHAR(50) DEFAULT 'AVAILABLE',
    pricing VARCHAR(100),
    product_description TEXT,
    logo TEXT,
    
    -- Auto-generated Full-Text Search vector for fast keyword search
    search_vector TSVECTOR GENERATED ALWAYS AS (
        setweight(to_tsvector('english', COALESCE(product_name, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(company_name, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(category, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(product_description, '')), 'D')
    ) STORED,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning-fast search and performance
CREATE INDEX idx_products_search_vector ON products USING GIN (search_vector);
CREATE INDEX idx_products_name_trgm ON products USING GIN (product_name gin_trgm_ops);
CREATE INDEX idx_company_name_trgm ON company_info USING GIN (company_name gin_trgm_ops);
CREATE INDEX idx_products_pricing ON products (pricing);





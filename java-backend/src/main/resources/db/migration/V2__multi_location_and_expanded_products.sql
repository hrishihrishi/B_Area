-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 1. Rename company_info to companies if company_info exists and companies does NOT exist yet
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'company_info')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'companies') THEN
        ALTER TABLE company_info RENAME TO companies;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS companies (
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
    verification_status VARCHAR(50) DEFAULT 'UNVERIFIED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE companies ADD COLUMN IF NOT EXISTS verification_status VARCHAR(50) DEFAULT 'UNVERIFIED';

-- 2. Stores (Physical Branches) with PostGIS Spatial Point
CREATE TABLE IF NOT EXISTS stores (
    store_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(company_id) ON DELETE CASCADE,
    store_name VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    location_geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stores_location_geom ON stores USING GIST (location_geom);
CREATE INDEX IF NOT EXISTS idx_stores_company_id ON stores (company_id);

-- Trigger function to auto-populate location_geom from (longitude, latitude)
CREATE OR REPLACE FUNCTION update_store_location_geom()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
        NEW.location_geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_store_location_geom ON stores;
CREATE TRIGGER trg_update_store_location_geom
BEFORE INSERT OR UPDATE ON stores
FOR EACH ROW
EXECUTE FUNCTION update_store_location_geom();

-- 3. Products (Expanded Catalog)
ALTER TABLE products ADD COLUMN IF NOT EXISTS type VARCHAR(50);
ALTER TABLE products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS specifications JSONB DEFAULT '{}'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS pricing_tiers JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 0.0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS review_count INT DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS total_sales INT DEFAULT 0;

-- Sync type column with product_type if present
UPDATE products SET type = product_type WHERE type IS NULL AND product_type IS NOT NULL;

-- Re-create search_vector column with full-text search capability
ALTER TABLE products DROP COLUMN IF EXISTS search_vector;
ALTER TABLE products ADD COLUMN search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('english', COALESCE(product_name, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(company_name, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(category, '')), 'C') ||
    setweight(to_tsvector('english', COALESCE(product_description, '')), 'D')
) STORED;

CREATE INDEX IF NOT EXISTS idx_products_search_vector ON products USING GIN (search_vector);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING GIN (product_name gin_trgm_ops);

-- 4. Store Inventory (Multi-location inventory mapping)
CREATE TABLE IF NOT EXISTS store_inventory (
    inventory_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(store_id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    local_price NUMERIC(12, 2),
    stock_quantity INT DEFAULT 0,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_store_product UNIQUE (store_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_store_inventory_store_product ON store_inventory (store_id, product_id);

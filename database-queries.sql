-- Useful queries for exploring the real estate database

-- 1. Database Overview
-- Show all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- 2. Property Statistics
-- Count total properties
SELECT COUNT(*) as total_properties FROM properties;

-- Properties by source
SELECT source, COUNT(*) as count 
FROM properties 
GROUP BY source 
ORDER BY count DESC;

-- Properties by city
SELECT city, COUNT(*) as count 
FROM properties 
GROUP BY city 
ORDER BY count DESC;

-- Average price by city
SELECT 
    city, 
    COUNT(*) as property_count,
    ROUND(AVG(price)) as avg_price,
    MIN(price) as min_price,
    MAX(price) as max_price
FROM properties 
WHERE price > 0
GROUP BY city 
ORDER BY property_count DESC;

-- 3. Recent Properties
-- View 10 most recent properties
SELECT 
    id, 
    external_id, 
    title, 
    price, 
    currency, 
    city, 
    bedrooms, 
    bathrooms,
    created_at 
FROM properties 
ORDER BY created_at DESC 
LIMIT 10;

-- 4. Search Patterns
-- Most common search queries
SELECT 
    search_params, 
    result_count, 
    created_at 
FROM search_history 
ORDER BY created_at DESC 
LIMIT 20;

-- Search frequency by day
SELECT 
    DATE(created_at) as search_date, 
    COUNT(*) as search_count 
FROM search_history 
GROUP BY DATE(created_at) 
ORDER BY search_date DESC;

-- 5. Property Details
-- View specific property with all details
SELECT p.*, 
    array_agg(DISTINCT pi.image_url) as images,
    array_agg(DISTINCT pf.feature) as features
FROM properties p
LEFT JOIN property_images pi ON p.id = pi.property_id
LEFT JOIN property_features pf ON p.id = pf.property_id
WHERE p.city = 'Mexico City'
GROUP BY p.id
LIMIT 5;

-- 6. Data Health
-- Properties not updated recently (stale data)
SELECT COUNT(*) as stale_properties 
FROM properties 
WHERE last_seen_at < NOW() - INTERVAL '7 days';

-- Properties with missing data
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN bedrooms IS NULL THEN 1 END) as missing_bedrooms,
    COUNT(CASE WHEN bathrooms IS NULL THEN 1 END) as missing_bathrooms,
    COUNT(CASE WHEN size IS NULL THEN 1 END) as missing_size
FROM properties;

-- 7. Price Analysis
-- Price distribution
SELECT 
    CASE 
        WHEN price < 1000000 THEN 'Under 1M'
        WHEN price < 2000000 THEN '1M-2M'
        WHEN price < 5000000 THEN '2M-5M'
        WHEN price < 10000000 THEN '5M-10M'
        ELSE 'Over 10M'
    END as price_range,
    COUNT(*) as count
FROM properties
WHERE price > 0
GROUP BY price_range
ORDER BY 
    CASE price_range
        WHEN 'Under 1M' THEN 1
        WHEN '1M-2M' THEN 2
        WHEN '2M-5M' THEN 3
        WHEN '5M-10M' THEN 4
        ELSE 5
    END;
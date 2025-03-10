-- ROLES
CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NOT NULL
);

-- INSERT ROLES (en español)
INSERT INTO roles (id, name, description) VALUES
(1, 'Admin', 'Acceso total a todas las funcionalidades del sistema.'),
(2, 'Manager', 'Puede gestionar pedidos, revisar estadísticas y supervisar operaciones.'),
(3, 'Staff', 'Se encarga del procesamiento y envío de pedidos.'),
(4, 'Customer', 'Puede ver productos, añadirlos al carrito y realizar pedidos.');

-- USERS
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX users_deleted_at_idx ON users(deleted_at);

-- USER HISTORY
CREATE TABLE user_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    field_name VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ DEFAULT now()
);

-- CATEGORIES
CREATE TABLE categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- PRODUCTS
CREATE TABLE products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    wholesale_price NUMERIC(10,2) NOT NULL CHECK (wholesale_price >= 0),
    retail_price NUMERIC(10,2) NOT NULL CHECK (retail_price >= 0),
    tax_percentage NUMERIC(5,2) NOT NULL CHECK (tax_percentage >= 0 AND tax_percentage <= 100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE INDEX products_sku_idx ON products(sku);

-- PRODUCT HISTORY
CREATE TABLE product_history (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    field_name VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ DEFAULT now()
);

-- PRODUCT CATEGORY RELATIONSHIP
CREATE TABLE product_categories (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE (product_id, category_id)
);

-- PRODUCT DISCOUNTS
CREATE TABLE product_discounts (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    discount_percentage NUMERIC(5,2) CHECK (discount_percentage BETWEEN 0 AND 100),
    discount_price NUMERIC(10,2) CHECK (discount_price >= 0),
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- SHIPPING ADDRESSES
CREATE TABLE shipping_addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Spain',
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX unique_default_shipping ON shipping_addresses(user_id) WHERE is_default = TRUE;

-- ORDER STATUSES
CREATE TABLE order_statuses (
    id BIGSERIAL PRIMARY KEY,
    status VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO order_statuses (id, status) VALUES
(1, 'Pendiente'),
(2, 'Procesando'),
(3, 'Enviado'),
(4, 'Entregado'),
(5, 'Cancelado'),
(6, 'Reembolsado');

-- ORDERS
CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status_id BIGINT NOT NULL REFERENCES order_statuses(id),
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL DEFAULT 'Spain',
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0), 
    tax_total NUMERIC(10,2) NOT NULL CHECK (tax_total >= 0), 
    grand_total NUMERIC(10,2) NOT NULL CHECK (grand_total >= 0),
    shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (shipping_cost >= 0),
    created_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX orders_deleted_at_idx ON orders(deleted_at);

-- ORDER HISTORY
CREATE TABLE order_history (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    field_name VARCHAR(50) NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by BIGINT NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    changed_at TIMESTAMPTZ DEFAULT now()
);

-- ORDER ITEMS
CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
    tax_percentage NUMERIC(5,2) NOT NULL CHECK (tax_percentage >= 0 AND tax_percentage <= 100),
    tax_amount NUMERIC(10,2) NOT NULL CHECK (tax_amount >= 0),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0)
);

-- PAYMENT STATUSES
CREATE TABLE payment_statuses (
    id BIGSERIAL PRIMARY KEY,
    status VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO payment_statuses (id, status) VALUES
(1, 'Pendiente'),
(2, 'Pagado'),
(3, 'Fallido'),
(4, 'Reembolsado');

-- PAYMENTS
CREATE TABLE payments (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    stripe_payment_id VARCHAR(255) NOT NULL UNIQUE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
    status_id BIGINT NOT NULL REFERENCES payment_statuses(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    metadata JSONB
);

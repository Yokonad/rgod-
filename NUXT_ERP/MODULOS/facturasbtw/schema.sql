-- Tabla de Facturas
CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL,
    type ENUM('emitida', 'recibida') NOT NULL DEFAULT 'emitida',
    client_name VARCHAR(200) NOT NULL,
    client_rfc VARCHAR(20),
    description TEXT,
    subtotal DECIMAL(12,2) DEFAULT 0,
    tax DECIMAL(12,2) DEFAULT 0,
    total DECIMAL(12,2) NOT NULL,
    status ENUM('pendiente', 'pagada', 'cancelada', 'vencida') DEFAULT 'pendiente',
    issue_date DATE NOT NULL,
    due_date DATE,
    payment_date DATE,
    notes TEXT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_invoice_number (invoice_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

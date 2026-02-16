#!/bin/bash

# Script para configurar la base de datos ByteWave
# Uso: ./setup-database.sh

echo "🚀 Configuración de Base de Datos ByteWave"
echo "=========================================="
echo ""

# Colores para la salida
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar si MariaDB/MySQL está instalado
if ! command -v mysql &> /dev/null; then
    echo -e "${RED}❌ MySQL/MariaDB no está instalado${NC}"
    echo "Por favor, instala MariaDB primero:"
    echo "  sudo apt update"
    echo "  sudo apt install mariadb-server"
    exit 1
fi

echo -e "${GREEN}✅ MySQL/MariaDB está instalado${NC}"

# Verificar si el servicio está corriendo
if ! systemctl is-active --quiet mariadb && ! systemctl is-active --quiet mysql; then
    echo -e "${YELLOW}⚠️  El servicio de base de datos no está corriendo${NC}"
    echo "Intentando iniciar el servicio..."
    sudo systemctl start mariadb 2>/dev/null || sudo systemctl start mysql 2>/dev/null
    
    if ! systemctl is-active --quiet mariadb && ! systemctl is-active --quiet mysql; then
        echo -e "${RED}❌ No se pudo iniciar el servicio${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Servicio de base de datos corriendo${NC}"

# Solicitar credenciales
echo ""
echo "Ingresa las credenciales de MySQL/MariaDB:"
read -p "Usuario (por defecto: root): " DB_USER
DB_USER=${DB_USER:-root}

read -sp "Contraseña: " DB_PASSWORD
echo ""

DB_NAME="bytewave"

# Verificar conexión
echo ""
echo "Verificando conexión a la base de datos..."

if mysql -u"$DB_USER" -p"$DB_PASSWORD" -e "SELECT 1" &> /dev/null; then
    echo -e "${GREEN}✅ Conexión exitosa${NC}"
else
    echo -e "${RED}❌ No se pudo conectar con las credenciales proporcionadas${NC}"
    exit 1
fi

# Crear base de datos
echo ""
echo "Creando base de datos '$DB_NAME'..."

mysql -u"$DB_USER" -p"$DB_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE $DB_NAME;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (name, email) VALUES 
  ('Usuario Demo', 'demo@bytewave.com'),
  ('Admin', 'admin@bytewave.com')
ON DUPLICATE KEY UPDATE name=name;
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Base de datos creada exitosamente${NC}"
else
    echo -e "${RED}❌ Error al crear la base de datos${NC}"
    exit 1
fi

# Actualizar archivo .env
echo ""
echo "Actualizando archivo .env..."

cat > .env <<EOF
# Configuración de MariaDB
DB_HOST=localhost
DB_PORT=3306
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
EOF

echo -e "${GREEN}✅ Archivo .env actualizado${NC}"

# Verificar tablas creadas
echo ""
echo "Verificando tablas creadas:"
mysql -u"$DB_USER" -p"$DB_PASSWORD" -D"$DB_NAME" -e "SHOW TABLES;"

echo ""
echo -e "${GREEN}🎉 ¡Configuración completada!${NC}"
echo ""
echo "Próximos pasos:"
echo "  1. Ejecuta: npm install (si no lo has hecho)"
echo "  2. Ejecuta: npm run dev"
echo "  3. Abre tu navegador en: http://localhost:3000"
echo ""
echo "El indicador de conexión aparecerá en la esquina superior derecha."

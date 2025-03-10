# 🛒 Grocery Store Backend

## 🚀 Tecnologías Utilizadas

### 📦 Base de Datos y Almacenamiento

- **PostgreSQL**: Base de datos relacional escalable y rápida.
- **Redis**: Caché en memoria para consultas ultrarrápidas.

- **_Diseño de base de datos_**: [Enlace a DB design](https://dbdiagram.io/d/Terencio-Shipping-67c6bedc263d6cf9a0253317)

### 🔌 Backend y APIs

- **Node.js (Express.js)**: Framework para construir API REST eficientes.
- **Socket.io**: Comunicación en tiempo real para pedidos y notificaciones.
- **BullMQ**: Manejo de colas de trabajos en Redis para tareas asíncronas.

### 🛠 ORM y Abstracción de Base de Datos

- **Prisma**: ORM moderno, tipado y fácil de usar, ideal para PostgreSQL.

### 🔄 Arquitectura y Otros

- **Cacheo en Redis**:
  - Caché diario a las 2 AM para cargar todos los productos.
  - Invalidación automática cuando un producto es actualizado.
  - Uso de listas y conjuntos en Redis para optimizar la paginación y filtrado.
- **Cron Jobs**: Para actualizar caché en Redis diariamente a las 2 AM.
- **Mensajería en Tiempo Real**: WebSockets con Socket.io para órdenes en vivo.
- **Monitoreo y Logs**: Implementación con Winston o Pino.
- **Gestión de Errores**: Middleware centralizado para manejo de errores.
- **Autenticación JWT**: Protección de endpoints mediante tokens seguros.

---

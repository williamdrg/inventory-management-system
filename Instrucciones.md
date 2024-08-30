<!-- ![Inventario API Logo](/static/logo1.png) -->

# Sistema de Gestión de Inventario

## Descripción
El sistema de gestión de inventario de materias primas y productos elaborados está diseñado para administrar de manera eficiente las operaciones de proveedores, productos, producción, inventarios, ventas y devoluciones. A continuación, se detallan los módulos clave del sistema y su funcionalidad.

## Características Principales

- **Gestión de Proveedores**: Creación y administración de proveedores que suministran las materias primas.
- **Gestión de Materias Primas**: Creación de registros de materias primas y almacenamiento de las compras realizadas.
- **Gestión de Productos y Recetas**: Creación de productos y sus recetas asociadas, donde se definen las materias primas necesarias para su producción.
- **Producción de Productos**: Registro de la producción de productos basados en las recetas definidas.
- **Inventario de Productos**: Gestión del inventario de productos elaborados a partir de las materias primas.
- **Ventas y Devoluciones**: Registro de ventas, actualización de inventarios y manejo de devoluciones de productos por parte de los clientes.
- **Cálculo de Costos y Precios**: Cálculo del costo total de producción basado en las materias primas utilizadas y establecimiento del precio de venta como un porcentaje sobre el costo.

## Estructura del Proyecto

Este proyecto sigue una arquitectura MVC (Modelo-Vista-Controlador) y utiliza las siguientes tecnologías:

- **Backend**: Node.js, Express.js
- **Base de Datos**: PostgreSQL, Sequelize ORM
- **Frontend**: React.js

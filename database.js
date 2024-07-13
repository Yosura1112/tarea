const { Pool } = require('pg');

const pool = new Pool({
  host: 'ep-cold-flower-a4eftje5-pooler.us-east-1.aws.neon.tech',
  port: 5432,
  database: 'verceldb',
  user: 'default',
  password: 'y3ksvxjZDBn6',
  ssl: {
    rejectUnauthorized: false // Aceptar certificados autofirmados (opcional)
  }
});

/*pool.query(`CREATE TABLE IF NOT EXISTS pruebas (
    id SERIAL PRIMARY KEY,
    usaqi REAL,
    co2 REAL,
    co REAL,
    humidity REAL,
    pm25 REAL,
    pm10 REAL,
    pm100 REAL,
    temperature REAL
)`, (err, res) => {
    if (err) {
        console.error("Error al crear la tabla:", err);
    } else {
        console.log("Tabla 'pruebas' creada o ya existe.");
    }
});

*/

/*pool.query(`ALTER TABLE pruebas 
    ADD COLUMN IF NOT EXISTS fecha DATE,
    ADD COLUMN IF NOT EXISTS hora TIME`, (err, res) => {
if (err) {
console.error("Error al agregar columnas:", err);
} else {
console.log("Columnas de fecha y hora agregadas (o ya existían).");
}
});

*/

module.exports = pool;

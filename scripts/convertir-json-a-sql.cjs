/**
 * Script para convertir data.txt (JSON) a SQL para Supabase
 * Uso: node scripts/convertir-json-a-sql.js
 */

const fs = require('fs');
const path = require('path');

// Mapeo de códigos de país a nombres completos
const PAISES = {
  'PE': 'Perú',
  'AR': 'Argentina',
  'CL': 'Chile',
  'CO': 'Colombia',
  'MX': 'México',
  'EC': 'Ecuador',
  'BO': 'Bolivia',
  'VE': 'Venezuela',
  'UY': 'Uruguay',
  'PY': 'Paraguay',
  'BR': 'Brasil',
  'ES': 'España',
  'US': 'Estados Unidos'
};

// Función para decodificar HTML entities
function decodeHtmlEntities(text) {
  if (!text) return '';
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#x2F;/g, '/')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

// Función para escapar comillas simples para SQL
function escapeSql(text) {
  if (!text) return '';
  return decodeHtmlEntities(text).replace(/'/g, "''");
}

// Función para truncar texto largo
function truncate(text, maxLength = 5000) {
  if (!text) return '';
  const decoded = decodeHtmlEntities(text);
  return decoded.length > maxLength ? decoded.substring(0, maxLength) + '...' : decoded;
}

// Leer archivo
const dataPath = path.join(__dirname, '..', 'data.txt');
const outputPath = path.join(__dirname, '..', 'sql', 'insert_anecdotas_completo.sql');

console.log('Leyendo archivo:', dataPath);

try {
  const rawData = fs.readFileSync(dataPath, 'utf8');
  const data = JSON.parse(rawData);
  
  if (!data.records || !Array.isArray(data.records)) {
    throw new Error('Formato inválido: se esperaba { records: [...] }');
  }

  const records = data.records.filter(r => !r.hidden); // Solo registros no ocultos
  
  console.log(`Total de registros: ${data.records.length}`);
  console.log(`Registros visibles: ${records.length}`);

  // Generar SQL
  let sql = `-- =====================================================
-- INSERCIÓN MASIVA DE ANÉCDOTAS - Registro Nacional de Infieles
-- Generado: ${new Date().toISOString()}
-- Total de registros: ${records.length}
-- =====================================================

-- Ejecutar en Supabase SQL Editor
-- ADVERTENCIA: Esto insertará ${records.length} registros

INSERT INTO anecdotas (titulo, subtitulo, departamento, distrito, edad, datos_adicionales, pais, created_at)
VALUES
`;

  const values = records.map((record, index) => {
    const titulo = escapeSql(record.nombres || 'Sin nombre');
    const subtitulo = escapeSql(truncate(record.descripcion || record.datosAdicionales || '', 5000));
    const departamento = escapeSql(record.departamento || '');
    const distrito = escapeSql(record.distrito || 'Lima');
    const edad = record.edad ? String(record.edad) : '';
    const datosAdicionales = escapeSql(truncate(record.datosAdicionales || '', 2000));
    const pais = PAISES[record.country] || 'Perú';
    
    // Convertir timestamp a fecha
    const createdAt = record.createdAt 
      ? new Date(record.createdAt).toISOString()
      : new Date().toISOString();

    return `('${titulo}', '${subtitulo}', '${departamento}', '${distrito}', '${edad}', '${datosAdicionales}', '${pais}', '${createdAt}')`;
  });

  sql += values.join(',\n') + ';\n';

  // Crear directorio si no existe
  const sqlDir = path.dirname(outputPath);
  if (!fs.existsSync(sqlDir)) {
    fs.mkdirSync(sqlDir, { recursive: true });
  }

  // Guardar archivo
  fs.writeFileSync(outputPath, sql, 'utf8');
  
  console.log(`\n✅ SQL generado exitosamente!`);
  console.log(`📁 Archivo: ${outputPath}`);
  console.log(`📊 Registros: ${records.length}`);
  
  // Estadísticas por país
  const porPais = {};
  records.forEach(r => {
    const pais = PAISES[r.country] || 'Desconocido';
    porPais[pais] = (porPais[pais] || 0) + 1;
  });
  
  console.log('\n📍 Distribución por país:');
  Object.entries(porPais).forEach(([pais, count]) => {
    console.log(`   ${pais}: ${count} registros`);
  });

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

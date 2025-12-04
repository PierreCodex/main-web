/**
 * Script para convertir data2.txt (JSON) a SQL para Supabase
 * Estructura diferente a data.txt
 * Uso: node scripts/convertir-data2-a-sql.cjs
 */

const fs = require('fs');
const path = require('path');

// Función para escapar comillas simples para SQL
function escapeSql(text) {
  if (!text) return '';
  return text
    .replace(/'/g, "''")
    .replace(/\r\n/g, ' ')
    .replace(/\n/g, ' ')
    .replace(/\r/g, ' ')
    .trim();
}

// Función para truncar texto largo
function truncate(text, maxLength = 5000) {
  if (!text) return '';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Leer archivo con encoding UTF-8
const dataPath = path.join(__dirname, '..', 'data2.txt');
const outputDir = path.join(__dirname, '..', 'sql', 'data2');

console.log('📂 Leyendo archivo:', dataPath);

try {
  let rawData = fs.readFileSync(dataPath, 'utf8');
  
  // El archivo puede tener múltiples arrays JSON concatenados
  // Reemplazar ][ por , para unirlos
  rawData = rawData.replace(/\]\s*\[/g, ',');
  
  const data = JSON.parse(rawData);
  
  if (!Array.isArray(data)) {
    throw new Error('Formato inválido: se esperaba un array []');
  }

  console.log(`📊 Total de registros: ${data.length}`);

  // Crear directorio si no existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Dividir en partes de 100 registros
  const BATCH_SIZE = 100;
  const totalParts = Math.ceil(data.length / BATCH_SIZE);
  
  let totalProcessed = 0;
  
  for (let part = 0; part < totalParts; part++) {
    const start = part * BATCH_SIZE;
    const end = Math.min(start + BATCH_SIZE, data.length);
    const batch = data.slice(start, end);
    
    let sql = `-- =====================================================
-- INSERCIÓN DE ANÉCDOTAS (data2) - Parte ${part + 1} de ${totalParts}
-- Registros: ${start + 1} al ${end} (${batch.length} registros)
-- Generado: ${new Date().toISOString()}
-- =====================================================

INSERT INTO anecdotas (titulo, subtitulo, departamento, distrito, edad, datos_adicionales, pais, created_at)
VALUES
`;

    const values = batch.map(record => {
      const titulo = escapeSql(record.nombre || 'Sin nombre');
      const subtitulo = escapeSql(record.apellido || '');
      const departamento = escapeSql((record.departamento || '').toUpperCase());
      const distrito = escapeSql((record.distrito || '').toUpperCase());
      const edad = record.edad ? String(record.edad) : '';
      const datos_adicionales = escapeSql(truncate(record.testimonio || '', 5000));
      const pais = 'PERÚ';
      const created_at = record.created_at || new Date().toISOString();
      
      return `('${titulo}', '${subtitulo}', '${departamento}', '${distrito}', '${edad}', '${datos_adicionales}', '${pais}', '${created_at}')`;
    });

    sql += values.join(',\n') + ';\n';
    
    const filePath = path.join(outputDir, `insert_parte_${part + 1}.sql`);
    fs.writeFileSync(filePath, sql, 'utf8');
    totalProcessed += batch.length;
    console.log(`📄 Parte ${part + 1}/${totalParts}: ${batch.length} registros → ${filePath}`);
  }
  
  console.log(`\n✅ SQL generado exitosamente!`);
  console.log(`📊 Total: ${totalProcessed} registros en ${totalParts} archivos`);
  console.log(`📁 Ubicación: sql/data2/insert_parte_X.sql`);
  
  // Estadísticas por departamento (top 10)
  const porDepto = {};
  data.forEach(r => {
    const depto = r.departamento || 'Sin departamento';
    porDepto[depto] = (porDepto[depto] || 0) + 1;
  });
  
  const topDeptos = Object.entries(porDepto)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  console.log('\n📍 Top 10 departamentos:');
  topDeptos.forEach(([depto, count]) => {
    console.log(`   ${depto}: ${count} registros`);
  });

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

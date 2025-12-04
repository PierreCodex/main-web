-- =====================================================
-- INSERCIÓN MASIVA DE ANÉCDOTAS - Registro Nacional de Infieles
-- Generado automáticamente desde data.txt
-- =====================================================

-- Mapeo de códigos de país
-- PE = Perú
-- Si en el futuro hay más países, agregar aquí:
-- AR = Argentina, CL = Chile, CO = Colombia, MX = México, etc.

-- Función para decodificar HTML entities (ejecutar primero)
-- Nota: Supabase usa PostgreSQL

-- Insertar registros
INSERT INTO anecdotas (titulo, subtitulo, departamento, distrito, edad, datos_adicionales, pais, created_at)
VALUES
-- Los datos se insertarán aquí
-- Formato: (nombres, descripcion, departamento, distrito, edad, datosAdicionales, pais_completo, timestamp)

('G. A.', 'P. H.', 'zan migue', 'Lima', '23', 'agresor', 'Perú', NOW()),
('A.', 'C. P.', 'CHORRILLOS', 'Lima', '20', 'ME FUI INFIEL CON UN MONTON DE CHICAS. ME DIJO QUE ERA LA UNICA Y A SU VEZ ESTABA CON UNA LOCA MAYOR QUE EL Y UNA FLACA DE SU TRABAJO. NUNCA PONIA PARA LA COMIDA Y LE DABA DE COMER Y ASI ME PAGA EL PERRO DESGRACIADO. FLACA QUE VEIA SE LEVANTABA. UNA VEZ ENBORRACHO A UNA FLACA Y SE LA TIRO EN BAÑO AJENO Y PARA COLMO TIENE UN NOMBRE DE MIERDA. NENIS TENGAN CUIDADO CON EL SI NO QUIEREN CAGARSE LA VIDA', 'Perú', NOW()),
('G.', 'V.', 'La Victoria', 'Lima', '27', 'Tiene una relacion ya de casi 3 años y siempre la ha negado, diciendo que tienen una relacion abierta, etc. Se crea cuentas falsas para poder hablar con sus victimas.', 'Perú', NOW()),
('P. L.', 'A. B.', 'VILLA EL SALVADOR', 'Lima', '23', 'Le gusta jugar con las chicas, engaña diciendo que esta "soltero" pero realmente no lo esta/ba, trata de loca a sus exs cuando todo el daño que los causa es lo que NOS pone mal!!!!', 'Perú', NOW()),
('R. J.', 'A. G.', 'Chorrillos', 'Lima', '29', 'le encontre mensajes con otras chicas en whatsapp y en messenger y facebook parejas', 'Perú', NOW()),
('S. R.', 'U. S.', 'Rímac/SJL', 'Lima', '27', 'Tiene 4 denuncias de sus ex parejas por violencia física y psicológica (en 2019, 2021, 2022 y 2023), que obviamente oculta antes de conocer a alguien.La primera denuncia fue de la madre de su hijo. Es manipulador, abusivo y muy agresivo. Insulta a las chicas con las que está y les saca dinero. Ha golpeado a sus ex parejas con puñetes, patadas, etc. Sus padres y hermanos le apañan todo.', 'Perú', NOW()),
('F. A.', 'D. L. C. P.', 'San Juan de lurigancho', 'Lima', '25', 'A los 3 días de novios se fue a tener sexo con un su ex y bueno ella era mi amiga y me conto todo y también mientras estaba conmigo se háblala con otras y borraba los chats para que no me diera cuenta y antes de terminar se puso a hablar mierda de mi', 'Perú', NOW()),
('S. A.', 'C. J.', 'Santiago de Surco', 'Lima', '23', 'Estuve con el por 8 meses, me engaño desde que empezamos a salir como con 4 chicas y un dia antes de mi cumpleaños con su compañera de la U.', 'Perú', NOW()),
('L.', 'G.', 'Los Olivos', 'Lima', '28', 'Engañó a su enamorada, adicto a la pornografia, narcisista, sigue qlos 3000, le encontraron conversaciones preguntando por los servicios de una prostituta', 'Perú', NOW()),
('J. M.', 'Y. C.', 'SAN JUAN DE MIRAFLORES', 'Lima', '31', 'Mitómano e infiel desde su primera relación. Me pidió para formalizar cuando aún le pedía para regresar a su ex, me mintió durante todo el tiempo de relación, sabe manipular.', 'Perú', NOW()),
('A.', 'C. J.', 'san juan de lurigancho', 'Lima', '22', 'me fue infiel con otras chicas de la upc', 'Perú', NOW()),
('S.', 'L.', 'Alonso de Molina - Surco', 'Lima', '30', 'Tiene flaca hace años y le es súper infiel desde siempre. Envía videos a otras chicas y cuenta experiencias como que le hicieron masajes tántricos teniendo flaca', 'Perú', NOW()),
('S.', 'O. N.', 'LINCE', 'Lima', '22', 'Le gusta tratar a su ex novia de "loca" cuando es ÉL el que la engaña con cualquier mujer que le de un 1% de atención.', 'Perú', NOW()),
('M. A. M.', 'V. Z.', 'SJL', 'Lima', '28', 'Te termina 1 semana para tirarse a otra y luego te dice para regresar. Se quiere comer a tus amigas y siempre lleva a todas al mall de SJL solo a pasear. Es codo y tiene más labia que pelo en la cabeza. Tremendo llorón.', 'Perú', NOW());

-- NOTA: Este es solo un ejemplo con los primeros registros
-- El archivo completo tiene ~7000 líneas (cientos de registros)
-- Para generar el SQL completo, usar el script de Node.js adjunto

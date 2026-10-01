
-- Convertir el estado anterior conservando los reportes.
UPDATE `reporte`
SET `estado` = 'RESUELTO'
WHERE `estado` = 'VERIFICADO';

-- Dejar únicamente los tres estados acordados.
ALTER TABLE `reporte`
MODIFY `estado`
ENUM('NO_VERIFICADO', 'EN_INVESTIGACION', 'RESUELTO')
NOT NULL DEFAULT 'NO_VERIFICADO';

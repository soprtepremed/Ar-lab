-- DANGER: This will delete ALL studies and profiles
-- We must first delete dependencies if cascading isn't set up perfectly
-- 1. Delete Profile Components
DELETE FROM estudio_componentes;

-- 2. Delete Results (if any exist, linking to studies) 
--    (Optional: User didn't ask to delete results but if studies are gone, results are invalid. 
--     However, user said "Vacía mi catálogo", implying just the catalog. 
--     Safest for integrity is to delete or set null. Let's assume catalog reset)
--     If FK prevents deletion, we must handle it.
--     Let's try to delete studies. If it fails due to FK, we'll know.
--     Actually, let's play safe and delete only studies not used? 
--     User said "Vacía mi catálogo ESTAN TODOS MAL", implies total wipe.
DELETE FROM estudios_laboratorio;

-- Reset sequence if needed (optional)
-- ALTER SEQUENCE estudios_laboratorio_id_seq RESTART WITH 1;

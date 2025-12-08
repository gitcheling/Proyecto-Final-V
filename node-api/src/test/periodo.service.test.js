// src/test/periodo.service.test.js

const PeriodoService = require('../Services/periodoService');
const { Op } = require('sequelize');

// --- 1. MOCKING DEL MODELO (SIMULACIÓN DE LA BASE DE DATOS) ---
const Periodo_Model = require('../Models/periodo');
jest.mock('../Models/periodo', () => ({
    findByPk: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
}));

// --- 2. CONFIGURACIÓN INICIAL Y TIEMPO ---
const HOY_MOCK_DATE = '2025-10-15T08:00:00.000Z'; // HOY = 15 de Octubre de 2025

describe('PeriodoService - Pruebas de Lógica Temporal y Reglas de Negocio', () => {

    let periodoServiceInstance;
    const FECHA_FIN_ULTIMO = '2026-01-31'; // Fecha en que termina el último periodo existente
    const FECHA_INICIO_CURSO = '2025-07-01'; // Fecha de inicio del periodo en curso mockeado
    const FECHA_FIN_CURSO = '2025-12-31'; // Fecha de fin del periodo en curso mockeado

    // Datos base para un periodo en curso (inició antes de 2025-10-15)
    // Usamos Date en los valores mockeados porque Sequelize devuelve objetos Date
    const PERIODO_EN_CURSO = {
        id_periodo: 10,
        nombre: 'Periodo Q3-Q4',
        fecha_inicio: new Date(FECHA_INICIO_CURSO), 
        fecha_fin: new Date(FECHA_FIN_CURSO), // ¡Correcto!
    };
    
    // ... (beforeAll, afterAll, beforeEach - Se mantienen igual)
    beforeAll(() => {
        // Inicializa la instancia del servicio
        periodoServiceInstance = new PeriodoService(); 
        
        // Fija la hora actual en 2025-10-15
        jest.useFakeTimers();
        jest.setSystemTime(new Date(HOY_MOCK_DATE)); 

        // Mock para la función estática obtenerUltimoPeriodo()
        PeriodoService.obtenerUltimoPeriodo = jest.fn().mockResolvedValue({
            id_periodo: 99,
            nombre: 'Periodo Anterior',
            fecha_fin: FECHA_FIN_ULTIMO,
        });
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    beforeEach(() => {
        // Limpia los mocks de BD antes de cada prueba para que no se interfieran
        jest.clearAllMocks();
        
        // 1. Restablece el mock de count a 0 por defecto (el caso más común)
        Periodo_Model.count.mockResolvedValue(0); 
        
        // 2. Restablece el mock de findOne a null (no hay solapamiento por defecto)
        Periodo_Model.findOne.mockResolvedValue(null); 

        // 3. Restablece el mock de update a un array [0] para evitar error de desestructuración
        Periodo_Model.update.mockResolvedValue([0]);
    });

    // ----------------------------------------------------------------------
    // --- ESCENARIOS DE CREACIÓN (crearPeriodo) ---
    // ... (Pruebas 1, 2, 3, 4 se mantienen iguales)
    // ----------------------------------------------------------------------

    // Prueba 1: Ya existe una versión anterior (ya implementada, pero la incluimos para completar)
    test('Debería fallar al crear un periodo futuro si ya existe otro futuro', async () => {
        Periodo_Model.count.mockResolvedValue(1); 
        
        const datos = { nombre: 'Q4 2026', inicio: '2026-10-01', fin: '2026-12-31' };

        await expect(periodoServiceInstance.crearPeriodo(datos)).rejects.toThrow(
            "No se puede crear un nuevo periodo cuando ya existe uno futuro."
        );
        expect(Periodo_Model.count).toHaveBeenCalledTimes(1);
    });

    // Prueba 2: Falla por Solapamiento
    test('Debería fallar si las fechas se solapan con un periodo existente', async () => {
        // Mock: Simula que la consulta de solapamiento encuentra un periodo
        Periodo_Model.findOne.mockResolvedValue({
            nombre: 'Periodo Solapado', 
            fecha_inicio: '2026-03-15', // Datos necesarios para simular el solapamiento
            fecha_fin: '2026-05-15',
        }); 
        
        const datos = {
            nombre: 'Periodo Conflictivo', 
            inicio: '2026-03-01', 
            fin: '2026-08-01'
        };

        await expect(periodoServiceInstance.crearPeriodo(datos)).rejects.toThrow(
            /Las fechas se solapan con el periodo existente/
        );
        // El findOne debe haber sido llamado para buscar solapamiento
        expect(Periodo_Model.findOne).toHaveBeenCalledTimes(1); 
    });

    // Prueba 3: Falla porque la fecha de inicio no es posterior al último periodo
    test('Debería fallar si el inicio no es POSTERIOR al fin del último periodo', async () => {
        // El último periodo termina en '2026-01-31'. Intentamos iniciar en el mismo día.
        const datos = { 
            nombre: 'Inicio Ilegal', 
            inicio: FECHA_FIN_ULTIMO, // 2026-01-31 <= 2026-01-31 (ERROR)
            fin: '2026-08-01' 
        };

        // Mock temporal para evitar el error de "propiedad indefinida" si la validación falla internamente
        Periodo_Model.create.mockRejectedValue(new Error('Simulación de fallo de creación'));

        await expect(periodoServiceInstance.crearPeriodo(datos)).rejects.toThrow(
            `La fecha de inicio debe ser posterior a la fecha de fin del último periodo registrado (${FECHA_FIN_ULTIMO}).`
        );
        // Verificamos que obtenerUltimoPeriodo fue llamado para hacer esta validación
        expect(PeriodoService.obtenerUltimoPeriodo).toHaveBeenCalledTimes(1); 
        // Verificamos que create NO fue llamado
        expect(Periodo_Model.create).not.toHaveBeenCalled();
    });

    // Prueba 4: Creación Exitosa (Happy Path)
    test('Debería crear un periodo exitosamente si cumple todas las reglas', async () => {
        // Mock: La creación es exitosa y devuelve el objeto creado con los IDs de DB
        Periodo_Model.create.mockResolvedValue({ 
            id_periodo: 100, 
            nombre: 'Periodo Nuevo',
            fecha_inicio: '2026-02-01',
            fecha_fin: '2026-12-31',
            createdAt: new Date(),
            updatedAt: new Date(),
        }); 
        
        const datos = { 
            nombre: 'Periodo Nuevo', 
            inicio: '2026-02-01', // 2026-02-01 > 2026-01-31 (OK)
            fin: '2026-12-31' 
        };

        // Aseguramos que se resuelva (PASA)
        await expect(periodoServiceInstance.crearPeriodo(datos)).resolves.toBeDefined();
        
        // Verificamos que el proceso de guardado se ejecutó
        expect(Periodo_Model.create).toHaveBeenCalledTimes(1); 
    });
    
    // ----------------------------------------------------------------------
    // --- ESCENARIOS DE MODIFICACIÓN (actualizarPeriodo) ---
    // ----------------------------------------------------------------------

    // Prueba 5: Falla por Periodo Finalizado
    test('Debería fallar si el periodo ya ha finalizado', async () => {
        // Mock: Simula un periodo que terminó el 2025-09-30 (antes de HOY: 2025-10-15)
        Periodo_Model.findByPk.mockResolvedValue({
            id_periodo: 10,
            nombre: 'Periodo Terminado',
            fecha_inicio: new Date('2025-07-01'), 
            fecha_fin: new Date('2025-09-30'),
        });

        // Los datos de actualización no importan mucho aquí, solo el chequeo de la fecha de fin.
        await expect(periodoServiceInstance.actualizarPeriodo(
            10, 'Nuevo Nombre', '2025-07-01', '2025-09-30'
        )).rejects.toThrow("No se puede editar un periodo que ya ha finalizado.");
    });
    
    // Prueba 6: Falla al intentar acortar la fecha de fin (si está en curso)
    test('Debería fallar si se intenta ACORTAR la fecha de fin de un periodo en curso', async () => {
        Periodo_Model.findByPk.mockResolvedValue(PERIODO_EN_CURSO);
        
        await expect(periodoServiceInstance.actualizarPeriodo(
            PERIODO_EN_CURSO.id_periodo, 
            PERIODO_EN_CURSO.nombre, 
            FECHA_INICIO_CURSO, // ⬅️ String YYYY-MM-DD
            '2025-11-30' // ⬅️ String YYYY-MM-DD (Menor que 2025-12-31)
        )).rejects.toThrow(
            "La fecha de fin solo puede ser aumentada si el periodo ya ha comenzado."
        );
    });

    // Prueba 7: Pasa al alargar la fecha de fin (si está en curso)
    test('Debería pasar si se ALARGA la fecha de fin de un periodo en curso', async () => {
        Periodo_Model.findByPk.mockResolvedValue(PERIODO_EN_CURSO);
        Periodo_Model.update.mockResolvedValue([1]); // Simula que 1 fila fue actualizada
        
        const NUEVA_FECHA_FIN = '2026-03-31'; // Mayor que 2025-12-31
        
        await expect(periodoServiceInstance.actualizarPeriodo(
            PERIODO_EN_CURSO.id_periodo, 
            PERIODO_EN_CURSO.nombre, 
            FECHA_INICIO_CURSO, 
            NUEVA_FECHA_FIN // ⬅️ String YYYY-MM-DD
        )).resolves.toBeTruthy();

        // Verificamos que se llamó a la actualización con la nueva fecha de fin
        expect(Periodo_Model.update).toHaveBeenCalledWith(
            expect.objectContaining({
                // Debe ser un objeto Date con la fecha correcta (lo que el servicio genera)
                fecha_fin: new Date(NUEVA_FECHA_FIN + 'T00:00:00.000Z') 
            }), 
            expect.anything()
        );
    });

    // Prueba 8: Falla al cambiar la fecha de inicio de periodo en curso
    test('Debería fallar al modificar la fecha de inicio si el periodo está en curso', async () => {
        // Usa el mock global corregido
        Periodo_Model.findByPk.mockResolvedValue(PERIODO_EN_CURSO);
        
        await expect(periodoServiceInstance.actualizarPeriodo(
            PERIODO_EN_CURSO.id_periodo, 
            PERIODO_EN_CURSO.nombre, 
            '2025-08-01', // ⬅️ String YYYY-MM-DD (Intento cambiar inicio de 07-01 a 08-01)
            FECHA_FIN_CURSO // ⬅️ String YYYY-MM-DD (Usamos la constante String para que pase la validación de formato)
        )).rejects.toThrow(
            "La fecha de inicio no se puede modificar ya que el periodo ya ha comenzado."
        );
    });
});
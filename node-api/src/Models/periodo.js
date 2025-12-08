const { DataTypes } = require('sequelize');
const  sequelize  = require('../Config/database');


const Periodo = sequelize.define('Periodo', {
    id_periodo  : {
        type: DataTypes.INTEGER,
        primaryKey: true, 
        autoIncrement: true 
    },
    nombre: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },

    fecha_inicio: {
        type: DataTypes.DATEONLY, 
        allowNull: false,
        get() {
            // El getter asegura que SIEMPRE devuelve la cadena pura de la DB (evitando problemas de desfases)
            return this.getDataValue('fecha_inicio'); 
        }
    },

    fecha_fin: {
        type: DataTypes.DATEONLY, 
        allowNull: false,
        get() {
            // El getter asegura que SIEMPRE devuelve la cadena pura de la DB 
            return this.getDataValue('fecha_fin');
        }
    },


    createdAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    },
    updatedAt: {
        type: 'TIMESTAMP WITHOUT TIME ZONE'
    }
}, {
    // Configuraciones de Sequelize:
    tableName: 'periodo', // Nombre de la tabla exacto
    timestamps: true, // La tabla usa createdAt/updatedAt
    freezeTableName: true, // Evita que Sequelize pluralice el nombre de la tabla

    // ------------------------------------------------------------------
    // VALIDACIONES CRÍTICAS A NIVEL DE MODELO
    // ------------------------------------------------------------------
    validate: {
        // VALIDACIÓN 1: Asegura que el fin siempre sea posterior al inicio
        fechaFinPosterior() {

            const inicio = new Date(this.fecha_inicio);
            const fin = new Date(this.fecha_fin);

            if (fin <= inicio) {
                throw new Error('La fecha de finalización debe ser estrictamente posterior a la fecha de inicio.');
            }
        },
        
        // VALIDACIÓN 2: Restricción de duración (3 a 8 meses)
        validarDuracionMinMax() {
            
            const fechaInicio = new Date(this.fecha_inicio);
            const fechaFin = new Date(this.fecha_fin);

            // LÍMITES CONFIGURABLES
            const MESES_MINIMO = 3;

            /* MÁXIMO RECOMENDADO
            Esto permite cubrir un semestre largo (6 meses) más una posible extensión de dos meses (Ej., receso administrativo o 
            un curso de recuperación/proyecto extendido). */
            const MESES_MAXIMO = 8; 
            
            // --- 1. Definir los límites temporales ---
            
            // Calculamos la fecha que está EXACTAMENTE el mínimo de meses después
            const limiteMinimo = new Date(fechaInicio);
            limiteMinimo.setMonth(fechaInicio.getMonth() + MESES_MINIMO);

            // Calculamos la fecha que está EXACTAMENTE el máximo de meses después
            const limiteMaximo = new Date(fechaInicio);
            limiteMaximo.setMonth(fechaInicio.getMonth() + MESES_MAXIMO);
            
            // --- 2. Verificar la duración mínima ---
            if (fechaFin < limiteMinimo) {
                throw new Error(`El periodo debe durar un mínimo de ${MESES_MINIMO} meses.`);
            }

            // --- 3. Verificar la duración máxima ---
            if (fechaFin >= limiteMaximo) {
                throw new Error(`El periodo no puede durar más de ${MESES_MAXIMO} meses.`);
            }
        }
    }
});

Periodo.associate = (models) => {

    // Un periodo puede aparecer muchas veces en "grupo"
    Periodo.hasMany(models.Grupo, {
        foreignKey: 'id_periodo', // La FK que está en la tabla 'grupo'
        as: 'grupos' // Usamos éste prefijo para obtener los datos del otro modelo (todos los grupos de un periodo)
    });



};

module.exports = Periodo;
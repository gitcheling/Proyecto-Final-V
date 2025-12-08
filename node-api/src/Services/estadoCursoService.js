const Estado_Curso_Model = require('../Models/estado_curso'); 

class EstadoCursoService {

    // Se obtienen los estados curso
    async obtenerEstadosCurso() {

        const resultado = await Estado_Curso_Model.findAll();

        // Verificar si el tipo de identificación fue encontrado
        if (!resultado) { 
            return [];
        }

        return resultado.map(instancia => ({
            id: instancia.id_estado_curso, 
            nombre: instancia.nombre.toString(),
            descripcion: instancia.descripcion.toString(),   
            permite_grupos: instancia.permite_nuevos_grupos == true ? "Si" : "No"      
        }));
        
    }
    
}

module.exports = EstadoCursoService;
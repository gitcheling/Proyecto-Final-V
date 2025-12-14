const Estado_Grupo_Model = require('../Models/estado_grupo'); 

class EstadoGrupoService {

    // Se obtienen los estados grupo
    async obtenerEstadosGrupo() {

        const resultado = await Estado_Grupo_Model.findAll();

        // Verificar si el tipo de identificación fue encontrado
        if (!resultado) { 
            return [];
        }

        return resultado.map(instancia => ({
            id: instancia.id_estado_grupo, 
            nombre: instancia.nombre.toString(),
            descripcion: instancia.descripcion.toString(),   
            permite_inscripcion: instancia.permite_inscripcion == true ? "Si" : "No"      
        }));
        
    }
    
}

module.exports = EstadoGrupoService;
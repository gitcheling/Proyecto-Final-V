import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'

import EntidadesView from '../views/entidades/EntidadesView.vue'
import DetallesEntidadView from '../views/entidades/DetallesEntidadView.vue'

import EstudiantesView from '../views/estudiantes/EstudiantesView.vue'
import DetallesEstudianteView from '../views/estudiantes/DetallesEstudianteView.vue'

import DocentesView from '../views/docentes/DocentesView.vue'
import DetallesDocenteView from '../views/docentes/DetallesDocenteView.vue'

import ProveedoresView from '../views/proveedores/ProveedoresView.vue'
import DetallesProveedorView from '../views/proveedores/DetallesProveedorView.vue'

import PlanCuentasView from '../views/contabilidad/PlanCuentasView.vue'
import CuentaBancariaAprobadaView from '../views/cuentasBancarias/aprobadas/CuentasBancariasView.vue'
import CuentaBancariaPorAprobarView from '../views/cuentasBancarias/porAprobar/CuentasBancariasView.vue'


import PeriodosView from '../views/periodos/PeriodosView.vue';


import CursosView from '../views/cursos/CursosView.vue'
import DetallesCursoView from '../views/cursos/DetallesCursoView.vue'


import GruposView from '../views/grupos/GruposView.vue'
import DetallesGrupoView from '../views/grupos/DetallesGrupoView.vue'

import InscripcionesView from '../views/inscripciones/InscripcionesView.vue'


import ReportesEntidadesView from '../views/reportes/entidades/ReportesEntidadesView.vue'
import ReportesEstudiantesView from '../views/reportes/estudiantes/ReportesEstudiantesView.vue'
import ReportesDocentesView from '../views/reportes/docentes/ReportesDocentesView.vue'
import ReportesProveedoresView from '../views/reportes/proveedores/ReportesProveedoresView.vue'
import ReportesGruposView from '../views/reportes/grupos/ReportesGruposView.vue'
import ReportesInscripcionesView from '../views/reportes/inscripciones/ReportesInscripcionesView.vue'
import ReportesCuentasBancariasView from '../views/reportes/cuentasBancarias/ReportesCuentasBancariasView.vue'


const routes = [
    { path: '/', component: HomeView },

    // Entidades
    { path: '/Entidades', component: EntidadesView },

    // Entidades
    { path: '/Entidades', name: 'GestionEntidades', component: EntidadesView },
    {
      path: '/Entidades/:id', // La parte dinámica de la URL es :id
      name: 'EntidadDetails', // El nombre usado en el <router-link>
      component: DetallesEntidadView, // El componente a cargar
      props: true // Permite que el 'id' del parámetro de ruta sea pasado como prop al componente
    },

    // Estudiantes
    { path: '/Estudiantes', name: 'GestionEstudiantes', component: EstudiantesView },
    {
      path: '/Estudiantes/:id',
      name: 'StudentDetails', 
      component: DetallesEstudianteView, 
      props: true 
    },

    // Docentes
    { path: '/Docentes', name: 'GestionDocentes', component: DocentesView },
    {
      path: '/Docentes/:id', 
      name: 'DocenteDetails', 
      component: DetallesDocenteView, 
      props: true 
    },

    // Proveedores
    { path: '/Proveedores', name: 'GestionProveedores', component: ProveedoresView },
    {
      path: '/Proveedores/:id',
      name: 'SupplierDetails', 
      component: DetallesProveedorView, 
      props: true 
    },
    
    // Contabilidad
    { path: '/PlanCuentas', component: PlanCuentasView },

    // Cuentas Bancarias
    { path: '/CuentasBancariasAprobadas', component: CuentaBancariaAprobadaView },
    { path: '/CuentasBancariasPorAprobar', component: CuentaBancariaPorAprobarView },


     // Periodos
    { path: '/Periodos', component: PeriodosView },


    // Cursos
    { path: '/Cursos', name: 'GestionCursos', component: CursosView },
    {
      path: '/Cursos/:id',
      name: 'CourseDetails', 
      component: DetallesCursoView, 
      props: true 
    },


    // Grupos
    { path: '/Grupos', name: 'GestionGrupos', component: GruposView },
    {
      path: '/Grupos/:id',
      name: 'GroupDetails', 
      component: DetallesGrupoView, 
      props: true 
    },


    // Inscripciones
    { path: '/Inscripciones', name: 'GestionInscripciones', component: InscripcionesView },

    
    // Reportes
    { path: '/ReportesEntidades', name: 'ReportesEntidades', component: ReportesEntidadesView },
    { path: '/ReportesEstudiantes', name: 'ReportesEstudiantes', component: ReportesEstudiantesView },
    { path: '/ReportesDocentes', name: 'ReportesDocentes', component: ReportesDocentesView },
    { path: '/ReportesProveedores', name: 'ReportesProveedores', component: ReportesProveedoresView },
    { path: '/ReportesGrupos', name: 'ReportesGrupos', component: ReportesGruposView },
    { path: '/ReportesInscripciones', name: 'ReportesInscripciones', component: ReportesInscripcionesView },
    { path: '/ReportesCuentasBancarias', name: 'ReportesCuentasBancarias', component: ReportesCuentasBancariasView },

]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
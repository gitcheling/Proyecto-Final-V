import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'

import EntidadesView from '../views/entidades/EntidadesView.vue'
import DetallesEntidadView from '../views/entidades/DetallesEntidadView.vue'

import EstudiantesView from '../views/estudiantes/EstudiantesView.vue'
import DetallesEstudianteView from '../views/estudiantes/DetallesEstudianteView.vue'

import DocentesView from '../views/docentes/DocentesView.vue'

import PlanCuentasView from '../views/contabilidad/PlanCuentasView.vue'
import CuentaBancariaAprobadaView from '../views/cuentasBancarias/aprobadas/CuentasBancariasView.vue'
import CuentaBancariaPorAprobarView from '../views/cuentasBancarias/porAprobar/CuentasBancariasView.vue'



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
      path: '/Estudiantes/:id', // La parte dinámica de la URL es :id
      name: 'StudentDetails', // El nombre usado en el <router-link>
      component: DetallesEstudianteView, // El componente a cargar
      props: true // Permite que el 'id' del parámetro de ruta sea pasado como prop al componente
    },

    // Docentes
    { path: '/Docentes', component: DocentesView },
    
    // Contabilidad
    { path: '/PlanCuentas', component: PlanCuentasView },

    // Cuentas Bancarias
    { path: '/CuentasBancariasAprobadas', component: CuentaBancariaAprobadaView },

    // Cuentas Bancarias
    { path: '/CuentasBancariasPorAprobar', component: CuentaBancariaPorAprobarView }

]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
<template>
  <main>
    <h1 class="morado-oscuro mb-4">Bienvenido al Sistema Universitario</h1>
    <p class="lead text-secondary mb-4">Resumen de la actividad y estadísticas principales del sistema.</p>
    
    <div class="row g-4 mb-4">
      <div class="col-md-6 col-lg-3">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <i class="bi bi-people display-6 morado-oscuro me-3"></i>
              <div>
                <h5 class="card-title mb-0 morado-oscuro">Usuarios Totales</h5>
                <p class="card-text fs-4 fw-bold">1,250</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-lg-3">
        <div class="card shadow-sm border-0 h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <i class="bi bi-box-seam display-6 morado-oscuro me-3"></i>
              <div>
                <h5 class="card-title mb-0 morado-oscuro">Ítems en Inventario</h5>
                <p class="card-text fs-4 fw-bold">789</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

    <div class="card shadow-sm border-0 p-4">
      <h3 class="morado-oscuro mb-3">Actividad Reciente</h3>
      <div class="alert alert-light border text-center py-4">
        <i class="bi bi-info-circle display-4 text-secondary mb-3"></i>
        <p class="mb-0 lead text-secondary">No hay registros de actividad recientes.</p>
      </div>
    </div>
  </main>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.morado-oscuro { color: #4B0082 !important; }
</style>
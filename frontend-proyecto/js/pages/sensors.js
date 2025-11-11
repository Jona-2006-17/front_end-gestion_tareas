import { sensorService } from '../api/sensor.service.js';

let currentPage = 1;
let pageSize = 10;
let totalPages = 1;
let allSensors = [];
let filteredSensors = [];
let currentFilter = 'all';

let createModalInstance = null;
let editModalInstance = null;

function createSensorRow(sensor) {
    const statusBadge = sensor.estado 
        ? `<span class="badge bg-success">Activo</span>`
        : `<span class="badge bg-danger">Inactivo</span>`;

    return `
        <tr>
            <td class="cell">${sensor.nombre}</td>
            <td class="cell">${sensor.nombre_tipo} - ${sensor.modelo_tipo}</td>
            <td class="cell">${sensor.nombre_galpon}</td>
            <td class="cell">${sensor.descripcion}</td>
            <td class="cell">
                <div class="form-check form-switch d-inline-block">
                    <input class="form-check-input sensor-status-switch" type="checkbox" role="switch" 
                           id="switch-${sensor.id_sensor}" data-sensor-id="${sensor.id_sensor}" 
                           ${sensor.estado ? 'checked' : ''}>
                </div>
            </td>
            <td class="cell">
                <button class="btn btn-sm btn-info btn-edit-sensor me-1" data-sensor-id="${sensor.id_sensor}">
                    <i class="fa-regular fa-pen-to-square"></i>
                </button>
            </td>
        </tr>
    `;
}

function createPagination(currentPage, totalPages) {
    const paginationList = document.getElementById('pagination-list');
    if (!paginationList) return;

    let paginationHTML = '';

    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}" tabindex="-1">Anterior</a>
        </li>
    `;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" data-page="${i}">${i}</a>
            </li>
        `;
    }

    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">Siguiente</a>
        </li>
    `;

    paginationList.innerHTML = paginationHTML;
}

async function loadSensors(page = 1) {
    const tableBody = document.getElementById('sensors-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Cargando sensors...</td></tr>';

    try {
        const response = await sensorService.getSensorsPag(page, pageSize);
        
        allSensors = response.sensors;
        currentPage = response.page;
        totalPages = response.total_pages;

        applyFilters();
        
    } catch (error) {
        console.error('Error al obtener los sensors:', error);
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error al cargar los datos.</td></tr>`;
    }
}

function applyFilters() {
    const tableBody = document.getElementById('sensors-table-body');
    
    filteredSensors = allSensors.filter(sensor => {
        if (currentFilter === 'active') return sensor.estado === true;
        if (currentFilter === 'inactive') return sensor.estado === false;
        return true;
    });

    if (filteredSensors.length > 0) {
        tableBody.innerHTML = filteredSensors.map(createSensorRow).join('');
    } else {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No se encontraron sensors.</td></tr>';
    }

    createPagination(currentPage, totalPages);
}

async function handlePaginationClick(event) {
    event.preventDefault();
    const target = event.target.closest('a[data-page]');
    if (!target) return;

    const page = parseInt(target.dataset.page);
    if (page >= 1 && page <= totalPages && page !== currentPage) {
        await loadSensors(page);
    }
}

async function handleStatusSwitch(event) {
    const switchElement = event.target;
    if (!switchElement.classList.contains('sensor-status-switch')) return;

    const sensorId = parseInt(switchElement.dataset.sensorId);
    const newStatus = switchElement.checked;
    const actionText = newStatus ? 'activar' : 'desactivar';

    if (confirm(`¿Estás seguro de que deseas ${actionText} este sensor?`)) {
        try {
            await sensorService.changeSensorStatus(sensorId, newStatus);
            alert(`El sensor ha sido ${newStatus ? 'activado' : 'desactivado'} exitosamente.`);
            await loadSensors(currentPage);
        } catch (error) {
            console.error(`Error al ${actionText} el sensor ${sensorId}:`, error);
            alert(`No se pudo ${actionText} el sensor. ${error.message}`);
            switchElement.checked = !newStatus;
        }
    } else {
        switchElement.checked = !newStatus;
    }
}

async function handleEditClick(event) {
    const editButton = event.target.closest('.btn-edit-sensor');
    if (!editButton) return;

    const sensorId = parseInt(editButton.dataset.sensorId);
    await openEditModal(sensorId);
}

async function openEditModal(sensorId) {
    const modalElement = document.getElementById('edit-sensor-modal');
    if (!editModalInstance) {
        editModalInstance = new bootstrap.Modal(modalElement);
    }

    try {
        const sensor = await sensorService.getSensorById(sensorId);
        
        document.getElementById('edit-sensor-id').value = sensor.id_sensor;
        document.getElementById('edit-nombre').value = sensor.nombre;
        document.getElementById('edit-id_tipo_sensor').value = sensor.id_tipo_sensor;
        document.getElementById('edit-id_galpon').value = sensor.id_galpon;
        document.getElementById('edit-descripcion').value = sensor.descripcion;

        editModalInstance.show();
    } catch (error) {
        console.error(`Error al obtener datos del sensor ${sensorId}:`, error);
        alert('No se pudieron cargar los datos del sensor.');
    }
}

function handleFilterChange(event) {
    currentFilter = event.target.value;
    applyFilters();
}

async function init() {
    const createModalElement = document.getElementById('create-sensor-modal');
    if (createModalElement) {
        createModalInstance = new bootstrap.Modal(createModalElement);
    }

    await loadSensors(1);

    const tableBody = document.getElementById('sensors-table-body');
    const paginationList = document.getElementById('pagination-list');
    const filterEstado = document.getElementById('filter-estado');
    const createForm = document.getElementById('create-sensor-form');
    const editForm = document.getElementById('edit-sensor-form');

    if (tableBody) {
        tableBody.addEventListener('change', handleStatusSwitch);
        tableBody.addEventListener('click', handleEditClick);
    }

    if (paginationList) {
        paginationList.addEventListener('click', handlePaginationClick);
    }

    if (filterEstado) {
        filterEstado.addEventListener('change', handleFilterChange);
    }

    if (createForm) {
        createForm.addEventListener('submit', handleCreateSubmit);
    }

    if (editForm) {
        editForm.addEventListener('submit', handleUpdateSubmit);
    }
}

export { init };

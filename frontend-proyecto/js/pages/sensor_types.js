import { tipo_sensorService } from '../api/sensorType.service.js';

let currentPage = 1;
let pageSize = 10;
let totalPages = 1;
let allSensor_types = [];
let filteredSensor_types = [];
let currentFilter = 'all';

let createModalInstance = null;
let editModalInstance = null;

function createSensorTypesRow(tipo_sensor) {
    const statusBadge = tipo_sensor.estado 
        ? `<span class="badge bg-success">Activo</span>`
        : `<span class="badge bg-danger">Inactivo</span>`;

    return `
        <tr>
            <td class="cell">${tipo_sensor.nombre}</td>
            <td class="cell">${tipo_sensor.descripcion}</td>
            <td class="cell">${tipo_sensor.modelo}</td>
            <td class="cell">
                <div class="form-check form-switch d-inline-block">
                    <input class="form-check-input sensortype-status-switch" type="checkbox" role="switch" 
                           id="switch-${tipo_sensor.id_tipo}" data-sensortype-id="${tipo_sensor.id_tipo}" 
                           ${tipo_sensor.estado ? 'checked' : ''}>
                </div>
            </td>
            <td class="cell">
                <button class="btn btn-sm btn-info btn-edit-sensortype me-1" data-sensortype-id="${tipo_sensor.id_sensor}">
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

async function loadSensorTypes(page = 1) {
    const tableBody = document.getElementById('sensortypes-table-body');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Cargando los tipos de sensor...</td></tr>';

    try {
        const response = await tipo_sensorService.getSensorTypesPag(page, pageSize);
        
        allSensor_types = response.sensor_types;
        currentPage = response.page;
        totalPages = response.total_pages;

        applyFilters();
        
    } catch (error) {
        console.error('Error al obtener los tipos de sensor:', error);
        tableBody.innerHTML = `<tr><td colspan="7" class="text-center text-danger">Error al cargar los datos.</td></tr>`;
    }
}

function applyFilters() {
    const tableBody = document.getElementById('sensortypes-table-body');
    
    filteredSensor_types = allSensor_types.filter(tipo_sensor => {
        if (currentFilter === 'active') return tipo_sensor.estado === true;
        if (currentFilter === 'inactive') return tipo_sensor.estado === false;
        return true;
    });

    if (filteredSensor_types.length > 0) {
        tableBody.innerHTML = filteredSensor_types.map(createSensorTypesRow).join('');
    } else {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">No se encontraron tipos de sensor.</td></tr>';
    }

    createPagination(currentPage, totalPages);
}

async function handlePaginationClick(event) {
    event.preventDefault();
    const target = event.target.closest('a[data-page]');
    if (!target) return;

    const page = parseInt(target.dataset.page);
    if (page >= 1 && page <= totalPages && page !== currentPage) {
        await loadSensorTypes(page);
    }
}

async function handleStatusSwitch(event) {
    const switchElement = event.target;
    if (!switchElement.classList.contains('sensortype-status-switch')) return;

    const tipo_sensorId = parseInt(switchElement.dataset.tipo_sensorId);
    const newStatus = switchElement.checked;
    const actionText = newStatus ? 'activar' : 'desactivar';

    if (confirm(`¿Estás seguro de que deseas ${actionText} este sensor?`)) {
        try {
            await tipo_sensorService.changeSensorTypesStatus(tipo_sensorId, newStatus);
            alert(`El sensor ha sido ${newStatus ? 'activado' : 'desactivado'} exitosamente.`);
            await loadSensorTypes(currentPage);
        } catch (error) {
            console.error(`Error al ${actionText} el sensor ${tipo_sensorId}:`, error);
            alert(`No se pudo ${actionText} el tipo_sensor. ${error.message}`);
            switchElement.checked = !newStatus;
        }
    } else {
        switchElement.checked = !newStatus;
    }
}

async function handleEditClick(event) {
    const editButton = event.target.closest('.btn-edit-sensortype');
    if (!editButton) return;

    const tipo_sensorId = parseInt(editButton.dataset.tipo_sensorId);
    await openEditModal(tipo_sensorId);
}

async function openEditModal(tipo_sensorId) {
    const modalElement = document.getElementById('edit-sensortype-modal');
    if (!editModalInstance) {
        editModalInstance = new bootstrap.Modal(modalElement);
    }

    try {
        const sensortype = await tipo_sensorService.getSensorById(tipo_sensorId);
        
        document.getElementById('edit-sensortype-id').value = tipo_sensor.id_sensor;
        document.getElementById('edit-nombre').value = tipo_sensor.nombre;
        document.getElementById('edit-id_tipo_sensor').value = tipo_sensor.id_tipo_sensor;
        document.getElementById('edit-id_galpon').value = tipo_sensor.id_galpon;
        document.getElementById('edit-descripcion').value = tipo_sensor.descripcion;

        editModalInstance.show();
    } catch (error) {
        console.error(`Error al obtener datos del sensor ${tipo_sensorId}:`, error);
        alert('No se pudieron cargar los datos del tipo_sensor.');
    }
}

function handleFilterChange(event) {
    currentFilter = event.target.value;
    applyFilters();
}

async function init() {
    const createModalElement = document.getElementById('create-sensortype-modal');
    if (createModalElement) {
        createModalInstance = new bootstrap.Modal(createModalElement);
    }

    await loadSensorTypes(1);

    const tableBody = document.getElementById('sensortypes-table-body');
    const paginationList = document.getElementById('pagination-list');
    const filterEstado = document.getElementById('filter-estadotipos');
    const createForm = document.getElementById('create-sensortype-form');
    const editForm = document.getElementById('edit-sensortype-form');

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

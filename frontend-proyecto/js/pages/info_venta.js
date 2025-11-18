import { ventaService } from "../api/venta.service.js";
import {loadContent} from "../main.js";

let modalInstance = null; // Guardará la instancia del modal de Bootstrap
let createModalInstance = null; // Guardará la instancia del modal de Bootstrap
let originalMail = null;

function createVentaRow(venta) {
    const statusBadge = venta.estado
        ? `<span class="badge bg-success">Activo</span>`
        : `<span class="badge bg-danger">Inactivo</span>`;

    return `
        <tr>
            <td class="cell">${venta.id_venta}</td>
            <td class="cell">${venta.fecha_hora}</td>
            <td class="cell">${venta.nombre_usuario}</td>
            <td class="cell">${venta.metodo_pago}</td>
            <td class="cell">${venta.total}</td>
            <td class="cell">
                <div class="form-check form-switch d-inline-block">
                    <input class="form-check-input venta-status-switch" type="checkbox" role="switch" 
                            id="switch-${venta.id_venta}" data-venta-id="${
                                venta.id_venta
                            }" 
                            ${venta.estado ? "checked" : ""}>
                    </div>
            </td>
            <td class="cell">
                <button class="btn btn-sm btn-info btn-edit-venta me-1" data-venta-id="${
                    venta.id_venta
                }">
                    <i class="fa-regular fa-pen-to-square"></i>
                </button>
                <button class="btn btn-sm btn-info btn-detalles-venta me-1" data-venta-id="${
                    venta.id_venta}" data-page="info_venta">
                    <i class="fas fa-search"></i>
                </button>
            </td>
        </tr>
    `;
}

// --- FUNCIÓN PRINCIPAL DE INICIALIZACIÓN ---
async function init() {
    const tableBody = document.getElementById("detalle-venta-table-body");
    if (!tableBody) return;

    tableBody.innerHTML =
        '<tr><td colspan="6" class="text-center">Cargando detalles ... </td></tr>';

    try {
        const ventas = await ventaService.getVentas();
        if (ventas && ventas.length > 0) {
        tableBody.innerHTML = ventas.map(createVentaRow).join("");
        } else {
        tableBody.innerHTML =
            '<tr><td colspan="6" class="text-center">No se encontraron ventas.</td></tr>';
        }
    } catch (error) {
        console.error("Error al obtener las ventas:", error);
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error al cargar los datos.</td></tr>`;
    }

    // Aplicamos el patrón remove/add para evitar listeners duplicados

    // Boton para crear venta
    const btnAtras = document.getElementById("btnAtras");

    document.removeEventListener("click", handleBtnAtras);
    document.addEventListener("click", handleBtnAtras);
}

export { init };


async function handleBtnAtras(event) {
  // Manejador para el botón de editar
    const pageToLoad = event.target.dataset.page;
    loadContent(pageToLoad);
}
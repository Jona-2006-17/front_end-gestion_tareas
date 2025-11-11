import { request } from './apiClient.js';

export const tipo_sensorService = {
    /**
     * @param {number} page 
     * @param {number} pageSize 
     * @returns {Promise<object>}
     */
    getSensorsPag: (page = 1, pageSize = 10) => {
        const endpoint = `/sensors/sensor/all-pag?page=${page}&page_size=${pageSize}`;
        return request(endpoint);
    },

    /**
     * @param {number} sensorId
     * @returns {Promise<object>}
     */
    getSensorById: (sensorId) => {
        const endpoint = `/sensors/sensor/by-id/${sensorId}`;
        return request(endpoint);
    },

    /**
     * @param {object} sensorData 
     * @returns {Promise<object>}
     */
    createSensor: (sensorData) => {
        return request(`/sensors/sensor/crear`, {
            method: 'POST',
            body: JSON.stringify(sensorData),
        });
    },

    /**
     * @param {number} sensorId
     * @param {object} sensorData 
     * @returns {Promise<object>}
     */
    updateSensor: (sensorId, sensorData) => {
        return request(`/sensors/sensor/by-id/${sensorId}`, {
            method: 'PUT',
            body: JSON.stringify(sensorData),
        });
    },

    /**
     * @param {number} sensorId 
     * @param {boolean} newStatus
     * @returns {Promise<object>}
     */
    changeSensorStatus: (sensorId, newStatus) => {
        return request(`/sensors/sensor/cambiar-estado/${sensorId}?nuevo_estado=${newStatus}`, {
            method: 'PUT',
        });
    },

    /**
     * @param {number} galponId 
     * @returns {Promise<object>}
     */
    getSensorsByGalpon: (galponId) => {
        const endpoint = `/sensors/sensor/by-galpon/${galponId}`;
        return request(endpoint);
    },
};
'use server'
import { Buffer } from 'buffer';
import cleanDataServices from '../../services/cleanDataServices';

export async function cleanData(url: string) {
  const response = await cleanDataServices.getDataToClean(url);

  if (!Array.isArray(response)) {
    throw new Error('La respuesta del servicio no es un arreglo de objetos');
  }

  if (response.length === 0) {
    throw new Error('La respuesta está vacía, no hay datos para convertir');
  }

  // Lista de campos que deseas excluir siempre
  const camposExcluidos = ['metadata', 'debug'];

  // Contador de valores "0" por clave
  const contadorCeros: Record<string, number> = {};
  const totalItems = response.length;

  // Primer pase: contar ocurrencias de "0" como string o número
  for (const item of response) {
    Object.entries(item).forEach(([key, value]) => {
      if (value === '0' || value === 0) {
        contadorCeros[key] = (contadorCeros[key] || 0) + 1;
      }
    });
  }

  // Determinar claves a eliminar por ser mayoritariamente "0"
  const clavesEliminarPorCero = Object.entries(contadorCeros)
    .filter(([, count]) => count >= Math.floor(totalItems * 0.8)) // eliminar si el 80% o más son ceros
    .map(([key]) => key);

  // Función para limpiar un objeto
  const limpiarObjeto = (obj: Record<string, any>) => {
    const limpio: Record<string, any> = {};

    Object.entries(obj).forEach(([key, value]) => {
      if (camposExcluidos.includes(key)) return;
      if (clavesEliminarPorCero.includes(key)) return;

      if (typeof value === 'string') {
        // Normalizar: quitar espacios y colapsar duplicados
        limpio[key] = value.trim().replace(/\s+/g, ' ');
      } else {
        limpio[key] = value;
      }
    });

    return limpio;
  };

  const dataLimpia = response.map(limpiarObjeto);
  const jsonString = JSON.stringify(dataLimpia, null, 2);
  const jsonBuffer = Buffer.from(jsonString, 'utf-8');

  const presignedUrlResponse = await cleanDataServices.getUrlPresigned({ file_name: 'fileData.json' });
  if (!presignedUrlResponse?.upload_url) {
    throw new Error('No se obtuvo la URL prefirmada');
  }

  await cleanDataServices.saveFileS3(presignedUrlResponse.upload_url, {
    buffer: jsonBuffer,
    mimeType: 'application/json'
  });

  return {
    fileName: 'fileData.json',
    mimeType: 'application/json',
    data: dataLimpia
  };
}

export async function urlPresigned(body: any) {
  const response = await cleanDataServices.getUrlPresigned(body);
  return response;
}

'use client';

import { useState } from 'react';
import styles from './enpointTeaster.module.scss';
import { cleanData } from '../../../home/actions/cleanData';

export default function EndpointTester() {
  const [url, setUrl] = useState('');
  const [data, setData] = useState<unknown[]>([]);


const handleSubmit = async () => {
  if (!url) return alert('Por favor ingresa una URL.');

  try {
    const { data } = await cleanData(url);
    setData(data);
    alert('Archivo JSON subido correctamente a S3');
  } catch (error) {
    console.error('Error al procesar la petición:', error);
    alert('Hubo un error en la carga del archivo');
  }
};

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'datos.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.wrapper}>
      <input
        type="text"
        placeholder="Ingresa URL del endpoint"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className={styles.input}
      />
      <button onClick={handleSubmit} className={styles.button}>Enviar</button>
      {data.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <button onClick={downloadJson}>Descargar JSON</button>
        </div>
      )}
    </div>
  );
}

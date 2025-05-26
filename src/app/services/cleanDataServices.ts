const cleanDataServices = {
  getDataToClean: async (url: string) => {
    
    try {
      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error en la petición:', error);
      return { error: String(error) };
    }
  },
  getUrlPresigned: async (body: unknown) => {
    const url = 'https://m3pfepldya.execute-api.us-east-1.amazonaws.com/getPresignedUrl'
    console.log('body :>> ', body);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      console.log('object :>> ', res);
      const data = await res.json();
      return data;
    } catch (error) {
      console.error('Error en la petición:', error);
      return { error: String(error) };
    }
  },

  saveFileS3: async (presignedUrl: string, file: { buffer: Buffer, mimeType: string }) => {
    try {
      const res = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.mimeType
        },
        body: file.buffer
      });
      console.log('res :>> ', res);
      if (!res.ok) throw new Error('Error al subir archivo a S3');
      return res;
    } catch (err) {
      console.error('Fallo en upload a S3:', err);
    }
  }
}

export default cleanDataServices;
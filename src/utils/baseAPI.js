import axios from 'axios';

export const API_URL = import.meta.env.VITE_APP_API_URL;
export const GATEWAY_URL = import.meta.env.VITE_APP_GATEWAY_URL;
export const GATEWAY_TOKEN = import.meta.env.VITE_APP_GATEWAY_TOKEN;

export const HOST_API = `${API_URL}/api/v1/`;
export const FILE_URL = `${import.meta.env.VITE_APP_FILE_URL}/`;
export const FILE_URL_OLD = `${import.meta.env.VITE_APP_FILE_URL}/api/v1/attachments/minio/`;

export const requestGET = async URL => {
  try {
    const res = await axios({
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      url: `${API_URL}/${URL}`,
    });
    return res.data;
  } catch (error) {
    return null;
  }
};
export const requestGET_CD = async URL => {
  try {
    const res = await axios({
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        tenant: 'root',
      },
      url: `${API_URL}/${URL}`,
    });
    return res.data;
  } catch (error) {
    return null;
  }
};

export const requestGETAttachment = async URL => {
  try {
    const res = await axios({
      method: 'GET',
      headers: {
        tenant: 'root',
      },
      url: `${API_URL}/${URL}`,
      responseType: 'blob',
    });
    return res;
  } catch (error) {
    return null;
  }
};

export const requestPOST = async (URL, data) => {
  try {
    const res = await axios({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      url: `${API_URL}/${URL}`,
      data,
    });

    return res.data;
  } catch (error) {
    return null;
  }
};

export const requestPOST_CD = async (URL, data) => {
  try {
    const res = await axios({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        tenant: 'root',
      },
      url: `${API_URL}/${URL}`,
      data,
    });

    return res.data;
  } catch (error) {
    return null;
  }
};
export const requestPOST_NEW = async (URL, data) => {
  try {
    const res = await axios({
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      url: `${API_URL}/${URL}`,
      data,
    });

    return res;
  } catch (error) {
    return error?.response ?? null;
  }
};

export const requestPUT_NEW = async (URL, data) => {
  try {
    const res = await axios({
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      url: `${API_URL}/${URL}`,
      data,
    });

    return res;
  } catch (error) {
    return error?.response ?? null;
  }
};

export const requestDOWNLOADFILE = async (URL, data) => {
  try {
    const res = await axios({
      method: 'POST',
      responseType: 'blob',
      headers: {
        'Content-Type': 'application/json',
      },
      url: `${API_URL}/${URL}`,
      data,
    });

    return res;
  } catch (error) {
    return null;
  }
};

export const requestUploadFile = async (URL, data) => {
  try {
    const res = await axios({
      method: 'POST',
      headers: {
        'content-type': 'multipart/form-data',
      },
      url: `${API_URL}/${URL}`,
      data,
    });

    return res;
  } catch (error) {
    return error?.response ?? null;
  }
};

export const requestPUT = async (URL, data) => {
  try {
    const res = await axios({
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      url: `${API_URL}/${URL}`,
      data,
    });

    return res.data;
  } catch (error) {
    return null;
  }
};

export const requestDELETE = async URL => {
  try {
    const res = await axios({
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      url: `${API_URL}/${URL}`,
    });

    return res.data;
  } catch (error) {
    return null;
  }
};

export const requestDELETE_NEW = async URL => {
  try {
    const res = await axios({
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      url: `${API_URL}/${URL}`,
    });

    return res;
  } catch (error) {
    return error?.response ?? null;
  }
};

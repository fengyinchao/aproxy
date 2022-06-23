export function parseFormData(str) {
  const arr = str
    .replace(/\r/g, '')
    .split(/-{10,}\w+/)
    .map((item: any) =>
      item
        .split('; ')
        .filter((item: string) => !!item.replace(/\n+/g, ''))
        .map((item: string) => item.split(/\n+/).filter(item => item.length)),
    )
    .filter((item: any) => item.length);

  const formItems: any[] = [];
  arr.forEach((item: any[]) => {
    if (item.length === 2) {
      const [key, value] = item[1];
      const label = key.replace(/name="([^"]+)"/, '$1');
      formItems.push([label, value]);
    } else if (item.length >= 3) {
      const [key] = item[1];
      const label = key.replace(/name="([^"]+)"/, '$1');
      formItems.push([label, '二进制文件']);
    }
  });

  return formItems;
}

export function parseJsonData(str: string) {
  const data: any[] = [];
  str.split('&').forEach(item => {
    const arr = item.split('=');
    if (arr.length === 2) {
      data.push(arr);
    }
  });

  return data;
}

export interface InvokeRequestParams {
  matched?: boolean;
  url?: string;
  method?: string;
  requestHeaders?: Record<string, any>;
  requestId: string;
  requestBody?: string;
  responseHeaders?: Record<string, any>;
  responseBody?: Buffer | Int8Array | Uint8Array | string;
  statusCode?: number;
  ip?: string;
}

export const isInspectContentType = (headers): boolean => {
  if (!headers || (!headers['content-type'] && !headers.accept)) {
    return false;
  }
  const contentType = headers['content-type'] || '';
  const { accept = '' } = headers;

  return (
    contentType.includes('json') ||
    contentType.includes('x-www-form-urlencoded') ||
    contentType.includes('javascript') ||
    contentType.includes('text/') ||
    contentType.includes('xml') ||
    accept.includes('text/')
  );
};

export const isImageContentType = (headers): boolean => {
  if (!headers || !headers['content-type']) {
    return false;
  }
  const contentType = headers['content-type'] || '';

  return contentType.includes('image');
};

export const isDetailViewAble = (headers): boolean => {
  return isImageContentType(headers) || isInspectContentType(headers);
};

export const formatSeconds = (sec: number): string => {
  if (sec > 1000) {
    return (sec / 1000).toFixed(1) + 's';
  }

  return `${sec}ms`;
};

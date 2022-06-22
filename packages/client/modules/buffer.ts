import { BrotliDecode } from '../modules/brDecode';

export function isBuffer<T>(v: T): boolean {
  return (
    Object.prototype.toString.call(v) === '[object Uint8Array]' ||
    Object.prototype.toString.call(v) === '[object ArrayBuffer]'
  );
}

export function bytesToString(bytes: any): string {
  return String.fromCharCode.apply(null, new Int32Array(bytes) as any);
}

export function textDecode(buf: Int8Array | Buffer): string {
  const decode = new TextDecoder('utf-8');

  return decode.decode(buf);
}

export function buffer2string(buffer: Buffer, encoding: string, isUtf8: boolean): string {
  if (!isBuffer(buffer)) {
    return '';
  }
  let data = '';
  try {
    if (encoding === 'br') {
      const u8 = BrotliDecode(new Int8Array(buffer));
      data = textDecode(u8);
    } else {
      if (isUtf8) {
        data = textDecode(buffer);
      } else {
        data = String.fromCharCode.apply(null, new Uint8Array(buffer) as any);
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[error]buffer2string:', err);
  }

  return data;
}

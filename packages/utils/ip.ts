import os from 'os';

export const getIpAddress = () => {
  const ifaces = os.networkInterfaces();
  const Ips: string[] = [];
  for (const dev in ifaces) {
    if (['以太网', 'en0'].includes(dev)) {
      (ifaces[dev] || []).forEach(details => {
        if (details.family === 'IPv4') {
          Ips.push(details.address);
        }
      });
    }
  }
  return Ips;
};

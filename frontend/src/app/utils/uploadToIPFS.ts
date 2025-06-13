export const UploadToIPFS = async (file: File): Promise<string> => {

    const formData = new FormData();
    formData.append('file', file);

    const pinataMetadata = JSON.stringify({
      name: `Certificate-${Date.now()}`,
      keyvalues: {
        groupId : "b6cb1b3f-91b9-4346-b047-9380ff10b489",
        type: 'certificate',
        uploadedAt: new Date().toISOString()
      }
    });
    formData.append('pinataMetadata', pinataMetadata);

    const pinataOptions = JSON.stringify({
      cidVersion: 0,
    });
    formData.append('pinataOptions', pinataOptions);

  const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      pinata_api_key: 'fc89d72c130bf8be1d2a',
      pinata_secret_api_key: 'bcefd45783d33eddc4f9c4ac8cdeccbf0aa80b0f5b2faf0a2616e11b095c3195',
    },
    body: formData,
  });

  const result = await res.json();

  if (!res.ok) {
    console.error('Pinata upload error:', result);
    throw new Error(result.error || 'Failed to upload to IPFS');
  }

  return `ipfs://${result.IpfsHash}`;
};

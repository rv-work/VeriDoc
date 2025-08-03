export const UploadToIPFS = async (file: File): Promise<string> => {
  if (!file) {
    throw new Error('No file provided for upload');
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File size too large (max 10MB)');
  }

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only PNG, JPG, and PDF files are allowed');
  }

  const formData = new FormData();
  formData.append('file', file);

  const pinataMetadata = JSON.stringify({
    name: `Certificate-${Date.now()}-${file.name}`,
    keyvalues: {
      groupId: "b6cb1b3f-91b9-4346-b047-9380ff10b489",
      type: 'certificate',
      uploadedAt: new Date().toISOString(),
      originalName: file.name
    }
  });
  formData.append('pinataMetadata', pinataMetadata);

  const pinataOptions = JSON.stringify({
    cidVersion: 0,
  });
  formData.append('pinataOptions', pinataOptions);

  try {
    const res = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': "fc89d72c130bf8be1d2a",
        'pinata_secret_api_key': "bcefd45783d33eddc4f9c4ac8cdeccbf0aa80b0f5b2faf0a2616e11b095c3195",
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Pinata API error:', res.status, errorText);
      throw new Error(`Pinata API error: ${res.status} - ${errorText}`);
    }

    const result = await res.json();

    if (!result.IpfsHash) {
      console.error('Pinata upload result:', result);
      throw new Error('No IPFS hash returned from Pinata');
    }

    return `ipfs://${result.IpfsHash}`;
  } catch (error) {
    console.error('IPFS upload failed:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload to IPFS: Unknown error');
  }
};
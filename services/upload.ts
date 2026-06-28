import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { uploadAsync, FileSystemUploadType, getInfoAsync } from 'expo-file-system/legacy';
import { PROD_API_URL, LOCAL_API_URL } from './api';

const USE_LOCAL = false;
const API_BASE = USE_LOCAL ? LOCAL_API_URL : PROD_API_URL;

export async function pickImage(): Promise<ImagePicker.ImagePickerResult> {
  await ImagePicker.requestMediaLibraryPermissionsAsync();
  return ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });
}

export async function pickCameraImage(): Promise<ImagePicker.ImagePickerResult> {
  await ImagePicker.requestCameraPermissionsAsync();
  return ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.8,
  });
}

export async function uploadImage(uri: string, mimeType?: string): Promise<string> {
  return uploadToCloudinary(uri, 'upload/product', mimeType);
}

export async function uploadFarmImage(uri: string, type: 'logo' | 'hero' = 'logo', mimeType?: string): Promise<string> {
  return uploadToCloudinary(uri, `upload/farm?type=${type}`, mimeType);
}

async function uploadToCloudinary(uri: string, endpoint: string, mimeType?: string): Promise<string> {
  const token = await SecureStore.getItemAsync('token');
  const mime = mimeType || 'image/jpeg';

  const res = await uploadAsync(`${API_BASE}/${endpoint}`, uri, {
    httpMethod: 'POST',
    uploadType: FileSystemUploadType.MULTIPART,
    fieldName: 'image',
    mimeType: mime,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status !== 200) {
    let msg = 'Upload failed';
    try {
      const body = JSON.parse(res.body);
      msg = body.error || msg;
    } catch {}
    throw new Error(msg);
  }

  const data = JSON.parse(res.body);
  return data.url;
}

export async function getMimeType(uri: string): Promise<string> {
  try {
    const info = await getInfoAsync(uri);
    if (info.exists) {
      const ext = uri.split('.').pop()?.toLowerCase() || '';
      const map: Record<string, string> = {
        jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
        gif: 'image/gif', webp: 'image/webp', heic: 'image/heic',
        heif: 'image/heif', avif: 'image/avif',
      };
      return map[ext] || 'image/jpeg';
    }
  } catch {}
  return 'image/jpeg';
}

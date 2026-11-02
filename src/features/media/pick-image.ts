import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

type PickImageOptions = {
  aspect?: [number, number];
  prefix?: string;
};

function getExtension(fileName: string | null | undefined, mimeType: string | null | undefined, uri: string) {
  const fromName = fileName?.split('.').pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  const fromMime = mimeType?.split('/').pop()?.toLowerCase().replace('jpeg', 'jpg');
  if (fromMime && /^[a-z0-9]+$/.test(fromMime)) return fromMime;
  const fromUri = uri.split('?')[0].split('.').pop()?.toLowerCase();
  if (fromUri && /^[a-z0-9]+$/.test(fromUri)) return fromUri;
  return 'jpg';
}

async function compressWebImage(uri: string, fallbackBase64?: string | null, mimeType?: string | null) {
  if (typeof document === 'undefined') return fallbackBase64 ? `data:${mimeType ?? 'image/jpeg'};base64,${fallbackBase64}` : uri;
  try {
    const image = document.createElement('img');
    image.src = uri;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Image could not be loaded'));
    });
    const scale = Math.min(1, 1000 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.68);
  } catch {
    return fallbackBase64 ? `data:${mimeType ?? 'image/jpeg'};base64,${fallbackBase64}` : uri;
  }
}

export async function pickImageFromLibrary({ aspect = [4, 5], prefix = 'product' }: PickImageOptions = {}) {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect,
    quality: 0.8,
    base64: Platform.OS === 'web',
  });

  if (result.canceled) return null;
  const asset = result.assets[0];

  if (Platform.OS === 'web') {
    return compressWebImage(asset.uri, asset.base64, asset.mimeType);
  }

  const directory = new Directory(Paths.document, 'oweji-images');
  if (!directory.exists) directory.create({ intermediates: true, idempotent: true });
  const extension = getExtension(asset.fileName, asset.mimeType, asset.uri);
  const destination = new File(directory, `${prefix}-${Date.now()}.${extension}`);
  await new File(asset.uri).copy(destination);
  return destination.uri;
}

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
    return asset.base64 ? `data:${asset.mimeType ?? 'image/jpeg'};base64,${asset.base64}` : asset.uri;
  }

  const directory = new Directory(Paths.document, 'oweji-images');
  if (!directory.exists) directory.create({ intermediates: true, idempotent: true });
  const extension = getExtension(asset.fileName, asset.mimeType, asset.uri);
  const destination = new File(directory, `${prefix}-${Date.now()}.${extension}`);
  await new File(asset.uri).copy(destination);
  return destination.uri;
}

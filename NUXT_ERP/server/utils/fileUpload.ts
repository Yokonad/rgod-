import { H3Event } from 'h3';
import { readMultipartFormData } from 'h3';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { randomUUID } from 'crypto';

export interface UploadedFile {
  filename: string;
  originalName: string;
  path: string;
  size: number;
  mimetype: string;
}

/**
 * Procesa archivos multipart/form-data
 */
export async function handleFileUploads(event: H3Event, options: {
  uploadDir: string;
  allowedTypes?: string[];
  maxFileSize?: number; // en bytes
} = { uploadDir: '/uploads' }): Promise<{
  files: Record<string, UploadedFile[]>;
  fields: Record<string, string>;
}> {
  const formData = await readMultipartFormData(event);
  
  if (!formData) {
    throw new Error('No se encontraron datos multipart');
  }

  const files: Record<string, UploadedFile[]> = {};
  const fields: Record<string, string> = {};

  // Crear directorio si no existe
  const uploadPath = join(process.cwd(), 'public', options.uploadDir);
  if (!existsSync(uploadPath)) {
    await mkdir(uploadPath, { recursive: true });
  }

  for (const part of formData) {
    const name = part.name || 'unknown';
    
    // Si es un archivo
    if (part.filename) {
      const originalName = part.filename;
      const mimetype = part.type || 'application/octet-stream';
      const data = part.data;

      // Validar tamaño
      if (options.maxFileSize && data.length > options.maxFileSize) {
        throw new Error(`El archivo ${originalName} excede el tamaño máximo permitido`);
      }

      // Validar tipo de archivo
      if (options.allowedTypes && options.allowedTypes.length > 0) {
        const isAllowed = options.allowedTypes.some(type => mimetype.includes(type));
        if (!isAllowed) {
          throw new Error(`Tipo de archivo no permitido: ${mimetype}`);
        }
      }

      // Generar nombre único
      const ext = originalName.split('.').pop();
      const uniqueName = `${randomUUID()}.${ext}`;
      const filePath = join(uploadPath, uniqueName);

      // Guardar archivo
      await writeFile(filePath, data);

      const uploadedFile: UploadedFile = {
        filename: uniqueName,
        originalName,
        path: join(options.uploadDir, uniqueName),
        size: data.length,
        mimetype
      };

      // Agrupar por nombre de campo
      if (!files[name]) {
        files[name] = [];
      }
      files[name].push(uploadedFile);
    } else {
      // Es un campo de texto
      fields[name] = part.data.toString('utf-8');
    }
  }

  return { files, fields };
}

/**
 * Convierte objeto con archivos Base64 a archivos reales
 */
export async function saveBase64Files(
  filesData: Record<string, Array<{ name: string; data: string; type: string }>>,
  uploadDir: string
): Promise<Record<string, UploadedFile[]>> {
  const uploadPath = join(process.cwd(), 'public', uploadDir);
  
  if (!existsSync(uploadPath)) {
    await mkdir(uploadPath, { recursive: true });
  }

  const savedFiles: Record<string, UploadedFile[]> = {};

  for (const [fieldName, files] of Object.entries(filesData)) {
    savedFiles[fieldName] = [];

    for (const file of files) {
      // Decodificar Base64
      const base64Data = file.data.replace(/^data:([^;]+);base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Generar nombre único
      const ext = file.name.split('.').pop();
      const uniqueName = `${randomUUID()}.${ext}`;
      const filePath = join(uploadPath, uniqueName);

      // Guardar archivo
      await writeFile(filePath, buffer);

      savedFiles[fieldName].push({
        filename: uniqueName,
        originalName: file.name,
        path: join(uploadDir, uniqueName),
        size: buffer.length,
        mimetype: file.type
      });
    }
  }

  return savedFiles;
}

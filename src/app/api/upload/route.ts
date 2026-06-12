import { NextResponse } from 'next/server';
import { uploadToSupabase } from '@/lib/supabaseStorage';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file uploaded' },
                { status: 400 }
            );
        }

        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.' },
                { status: 400 }
            );
        }

        // Validar tamaño (1MB)
        if (file.size > 1048576) {
            return NextResponse.json(
                { error: 'File size must be less than 1MB' },
                { status: 400 }
            );
        }

        const { url, path } = await uploadToSupabase(file);

        return NextResponse.json({
            url,
            path,
            message: 'File uploaded successfully'
        });

    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to upload file' },
            { status: 500 }
        );
    }
}
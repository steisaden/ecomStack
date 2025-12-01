import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { createContentType, ContentTypeDefinition } from '@/lib/contentful/model-creation';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyAuth(request as unknown as Request);
    if (!auth.success) {
      return NextResponse.json({ success: false, error: auth.error || 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Basic payload validation
    const errors: string[] = [];
    if (!body?.sys?.id || typeof body.sys.id !== 'string') errors.push('sys.id (string) is required');
    if (!body?.name || typeof body.name !== 'string') errors.push('name (string) is required');
    if (!Array.isArray(body?.fields)) errors.push('fields (array) is required');

    if (errors.length > 0) {
      return NextResponse.json({ success: false, error: 'Invalid payload', details: errors }, { status: 400 });
    }

    // Enforce simple naming convention for IDs
    const id = String(body.sys.id).trim();
    if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(id)) {
      return NextResponse.json({ success: false, error: 'Invalid content type ID. Use letters, numbers, dashes, underscores, starting with a letter.' }, { status: 400 });
    }

    const def: ContentTypeDefinition = {
      sys: { id },
      name: body.name,
      description: body.description || '',
      displayField: body.displayField || (body.fields[0]?.id ?? undefined),
      fields: body.fields.map((f: any) => ({
        id: f.id,
        name: f.name,
        type: f.type,
        required: Boolean(f.required),
        localized: Boolean(f.localized),
        validations: Array.isArray(f.validations) ? f.validations : [],
        disabled: Boolean(f.disabled),
        omitted: Boolean(f.omitted)
      }))
    };

    const created = await createContentType(def);

    return NextResponse.json({
      success: true,
      contentTypeId: created.sys.id,
      message: `Content type '${created.sys.id}' created and published`,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Create content type API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create content type',
      details: error?.message || 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
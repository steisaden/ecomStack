// app/api/admin/ai-rules/text-generator/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

const RULES_FILE = path.join(process.cwd(), '.kiro', 'ai-rules', 'text-generator.json');

// Ensure directory exists
function ensureDirectoryExists() {
  const dir = path.dirname(RULES_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Apply authentication middleware
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      );
    }

    ensureDirectoryExists();

    // Read rules file if it exists
    if (fs.existsSync(RULES_FILE)) {
      const data = fs.readFileSync(RULES_FILE, 'utf-8');
      const rules = JSON.parse(data);
      return NextResponse.json({ success: true, rules });
    }

    // Return default rules if file doesn't exist
    return NextResponse.json({
      success: true,
      rules: {
        tone: 'warm, inviting, empowering',
        brandVoice: 'authentic, knowledgeable, supportive',
        titleStyle: 'clear, benefit-focused, natural',
        descriptionStyle: 'informative, engaging, honest',
        tagGuidelines: 'relevant, specific, searchable',
        avoidWords: 'cheap, fake, miracle, instant',
        maxTitleLength: '60',
        maxDescriptionLength: '160'
      }
    });

  } catch (error: any) {
    console.error('Error loading text generator rules:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to load rules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Apply authentication middleware
    const auth = await verifyAuth(request);
    if (!auth.success) {
      return NextResponse.json(
        { error: auth.error || 'Unauthorized' },
        { status: auth.error === 'Insufficient permissions' ? 403 : 401 }
      );
    }

    const body = await request.json();
    const { rules } = body;

    if (!rules) {
      return NextResponse.json(
        { error: 'Rules are required' },
        { status: 400 }
      );
    }

    ensureDirectoryExists();

    // Save rules to file
    fs.writeFileSync(RULES_FILE, JSON.stringify(rules, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'Text generator rules saved successfully'
    });

  } catch (error: any) {
    console.error('Error saving text generator rules:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save rules' },
      { status: 500 }
    );
  }
}

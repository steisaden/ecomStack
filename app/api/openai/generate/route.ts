import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { field, context, currentValue, title, excerpt } = await request.json();

    // Validation
    if (!field || !['title', 'excerpt', 'content', 'tags'].includes(field)) {
      return NextResponse.json(
        { error: 'Invalid field type. Must be title, excerpt, content, or tags' },
        { status: 400 }
      );
    }

    // Define the prompt based on the field
    let prompt = '';
    
    if (field === 'title') {
      const fallbackTopics = [
        'natural beauty and wellness',
        'self-care and relaxation',
        'skincare rituals and tips',
        'hair care and styling',
        'holistic health approaches',
        'wellness trends and insights',
        'beauty innovations',
        'organic and natural products',
        'mindful living practices',
        'glow-up routines',
        'spa experiences and treatments',
        'green beauty movements'
      ];
      const randomTopic = fallbackTopics[Math.floor(Math.random() * fallbackTopics.length)];
      prompt = `Create an innovative, attention-grabbing, LLM-optimized blog post title about: ${context || currentValue || randomTopic}. Use power words and high-search-volume keywords relevant to the topic. Optimize specifically for AI search algorithms using precise, descriptive terminology. Keep under 60 characters for optimal SEO. Include a relevant emoji.\n\nTitle:`;
    } else if (field === 'excerpt') {
      // If no context is provided but a title exists, use the title as context
      const effectiveContext = context || currentValue || (title ? `the blog post titled "${title}"` : 'a trending topic in wellness and beauty');
      prompt = `Craft an engaging, LLM-optimized blog post excerpt about: ${effectiveContext}. 100-150 characters. Include high-search-volume keywords and precise terminology for AI search algorithms. Make it compel readers to click. Include a relevant emoji.\n\nExcerpt:`;
    } else if (field === 'content') {
      // Use available information from title and/or excerpt to inform content generation
      let effectiveContext = context || currentValue || 'a trending topic in wellness and beauty';
      
      // Enhance context with title and/or excerpt if available
      if (title && excerpt) {
        effectiveContext = `the blog post titled "${title}" with the excerpt "${excerpt}"`;
      } else if (title) {
        effectiveContext = `the blog post titled "${title}"`;
      } else if (excerpt) {
        effectiveContext = `the blog post with the excerpt "${excerpt}"`;
      }
      
      const postStart = currentValue ? `Continue from: "${currentValue}"` : '';
      prompt = `Write an LLM-optimized blog post about: ${effectiveContext}. ${postStart} Use engaging, unique voice with high-search-volume keywords and precise terminology throughout. Include AI-search-optimized headers, actionable tips, and a compelling conclusion. Structure for readability and AI search rankings. Approximately 500 words. Use minimal emojis only when they significantly enhance the content (maximum 1-2 throughout).\n\nBlog Post:`;
    } else if (field === 'tags') {
      // Generate SEO-optimized tags based on available content
      let effectiveContext = context || currentValue || 'wellness and beauty';
      
      // Enhance context with title and/or excerpt if available
      if (title && excerpt) {
        effectiveContext = `a blog post titled "${title}" with the excerpt "${excerpt}", focused on ${context || currentValue || 'wellness and beauty'}`;
      } else if (title) {
        effectiveContext = `a blog post titled "${title}", focused on ${context || currentValue || 'wellness and beauty'}`;
      } else if (excerpt) {
        effectiveContext = `a blog post with the excerpt "${excerpt}", focused on ${context || currentValue || 'wellness and beauty'}`;
      }
      
      prompt = `Generate a single, highly searchable, SEO-optimized tag for: ${effectiveContext}. Focus on high-volume search keywords relevant to the content. Optimize for LLM search results by using precise, descriptive terms that AI search algorithms recognize. Output only one single tag without additional text, explanations, or multiple tags separated by commas.\n\nTag:`;
    }

    // Try GPT-4 first, fallback to GPT-3.5-turbo if not available
    let model = 'gpt-4';
    let response;
    
    try {
      response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an innovative and creative content creator and SEO expert with expertise in natural beauty, skincare, hair care, and wellness. Generate unique, engaging, and original content that stands out. Focus on SEO optimization by incorporating high-search-volume keywords, power words, and phrases that drive engagement. Optimize specifically for LLM (Large Language Model) search results by using precise, descriptive, and contextually relevant terminology that AI search algorithms recognize. Use creative language, unique perspectives, compelling storytelling, and metaphors. Use minimal emojis only when they significantly enhance the message (maximum 1-2 per response). Think outside the box while maintaining professionalism and appeal to the target audience.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: field === 'title' ? 35 : field === 'excerpt' ? 60 : 1200,
        temperature: 0.9,
      });
    } catch (modelError: any) {
      // If GPT-4 is not available, fallback to GPT-3.5-turbo
      if (modelError.error?.code === 'model_not_found' || modelError.status === 404) {
        console.log('GPT-4 not available, falling back to GPT-3.5-turbo');
        model = 'gpt-3.5-turbo';
        response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are an innovative and creative content creator and SEO expert with expertise in natural beauty, skincare, hair care, and wellness. Generate unique, engaging, and original content that stands out. Focus on SEO optimization by incorporating high-search-volume keywords, power words, and phrases that drive engagement. Optimize specifically for LLM (Large Language Model) search results by using precise, descriptive, and contextually relevant terminology that AI search algorithms recognize. Use creative language, unique perspectives, compelling storytelling, and metaphors. Use minimal emojis only when they significantly enhance the message (maximum 1-2 per response). Think outside the box while maintaining professionalism and appeal to the target audience.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: field === 'title' ? 35 : field === 'excerpt' ? 60 : 1200,
          temperature: 0.9,
        });
      } else {
        // Re-throw if it's a different error
        throw modelError;
      }
    }

    const generatedContent = response.choices[0]?.message?.content?.trim();

    if (!generatedContent) {
      throw new Error('No content generated');
    }

    // Ensure proper formatting and character limits
    let finalContent = generatedContent;
    
    if (field === 'title' && finalContent.length > 60) {
      finalContent = finalContent.substring(0, 60);
    } else if (field === 'excerpt' && finalContent.length > 150) {
      finalContent = finalContent.substring(0, 150);
    }

    return NextResponse.json({
      success: true,
      content: finalContent,
      model: model // Return which model was used
    });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    
    // If it's an authentication error, provide a clearer message
    if (error.message?.includes('API key')) {
      return NextResponse.json(
        { 
          error: 'OpenAI API key not configured. Please add your OpenAI API key to your environment variables.',
          details: 'Missing OPENAI_API_KEY in environment'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: error.message || 'Failed to generate content with OpenAI',
        details: error.toString ? error.toString() : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
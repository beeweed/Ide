import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  children?: FileNode[];
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function readDirectoryRecursive(dirPath: string, relativePath = ''): FileNode[] {
  const items = fs.readdirSync(dirPath);
  const nodes: FileNode[] = [];

  for (const item of items) {
    // Skip .git and other hidden files/folders we don't want
    if (item === '.git' || item === 'node_modules' || item === 'build' || item === '.github') {
      continue;
    }

    const fullPath = path.join(dirPath, item);
    const stats = fs.statSync(fullPath);
    const itemRelativePath = relativePath ? `${relativePath}/${item}` : item;

    if (stats.isDirectory()) {
      // It's a folder
      const folderNode: FileNode = {
        id: generateId(),
        name: item,
        type: 'folder',
        children: readDirectoryRecursive(fullPath, itemRelativePath),
      };
      nodes.push(folderNode);
    } else if (stats.isFile()) {
      // It's a file
      const content = fs.readFileSync(fullPath, 'utf-8');
      const fileNode: FileNode = {
        id: generateId(),
        name: item,
        type: 'file',
        content: content,
      };
      nodes.push(fileNode);
    }
  }

  return nodes;
}

export async function GET() {
  try {
    const templatePath = path.join(process.cwd(), '.template');
    
    if (!fs.existsSync(templatePath)) {
      return NextResponse.json(
        { error: 'Template directory not found' },
        { status: 404 }
      );
    }

    const templateFiles = readDirectoryRecursive(templatePath);
    
    return NextResponse.json({
      success: true,
      template: templateFiles,
    });
  } catch (error) {
    console.error('Error reading template:', error);
    return NextResponse.json(
      { error: 'Failed to read template directory' },
      { status: 500 }
    );
  }
}

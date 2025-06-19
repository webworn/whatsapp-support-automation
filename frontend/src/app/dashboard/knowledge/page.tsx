'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Upload, 
  FileText, 
  File, 
  Image, 
  Search, 
  Plus, 
  Trash2,
  Download,
  Eye,
  Clock
} from 'lucide-react';

interface Document {
  id: string;
  filename: string;
  originalName: string;
  fileType: 'pdf' | 'txt' | 'doc' | 'docx';
  fileSize: number;
  status: 'processing' | 'ready' | 'error';
  category?: string;
  tags?: string;
  uploadDate: string;
}

const mockDocuments: Document[] = [
  {
    id: 'doc-1',
    filename: 'product-catalog-2024.pdf',
    originalName: 'Product Catalog 2024.pdf',
    fileType: 'pdf',
    fileSize: 2500000,
    status: 'ready',
    category: 'Products',
    tags: 'catalog, products, 2024',
    uploadDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'doc-2',
    filename: 'faq-customer-support.txt',
    originalName: 'FAQ - Customer Support.txt',
    fileType: 'txt',
    fileSize: 45000,
    status: 'ready',
    category: 'Support',
    tags: 'faq, support, help',
    uploadDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'doc-3',
    filename: 'company-policies.docx',
    originalName: 'Company Policies.docx',
    fileType: 'docx',
    fileSize: 120000,
    status: 'processing',
    category: 'Policies',
    tags: 'policies, company, rules',
    uploadDate: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

export default function KnowledgeBasePage() {
  const [documents, setDocuments] = useState<Document[]>(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isUploading, setIsUploading] = useState(false);

  const categories = ['all', ...Array.from(new Set(documents.map(doc => doc.category).filter(Boolean)))];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.tags?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf': return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx': return <File className="h-5 w-5 text-blue-500" />;
      case 'txt': return <FileText className="h-5 w-5 text-gray-500" />;
      default: return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Ready</span>;
      case 'processing':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Processing</span>;
      case 'error':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Error</span>;
      default:
        return null;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    // Simulate file upload
    for (const file of Array.from(files)) {
      const newDoc: Document = {
        id: `doc-${Date.now()}-${Math.random()}`,
        filename: file.name.toLowerCase().replace(/\s+/g, '-'),
        originalName: file.name,
        fileType: file.name.split('.').pop() as any || 'txt',
        fileSize: file.size,
        status: 'processing',
        category: 'Uncategorized',
        uploadDate: new Date().toISOString(),
      };

      setDocuments(prev => [newDoc, ...prev]);

      // Simulate processing delay
      setTimeout(() => {
        setDocuments(prev => prev.map(doc => 
          doc.id === newDoc.id ? { ...doc, status: 'ready' as const } : doc
        ));
      }, 2000);
    }

    setIsUploading(false);
    event.target.value = ''; // Reset input
  };

  const handleDeleteDocument = (docId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== docId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="text-gray-600">Manage documents and content for AI responses</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            id="file-upload"
            multiple
            accept=".pdf,.txt,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            onClick={() => document.getElementById('file-upload')?.click()}
            disabled={isUploading}
            className="flex items-center gap-2"
          >
            {isUploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Upload Documents
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready</CardTitle>
            <File className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.filter(d => d.status === 'ready').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.filter(d => d.status === 'processing').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Size</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(documents.reduce((sum, doc) => sum + doc.fileSize, 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Category:</span>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="space-y-4">
        {filteredDocuments.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-500 text-center mb-4">
                {searchQuery 
                  ? 'Try adjusting your search terms or filters.'
                  : 'Upload your first document to get started with AI knowledge base.'
                }
              </p>
              <Button onClick={() => document.getElementById('file-upload')?.click()}>
                Upload Document
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredDocuments.map((document) => (
            <Card key={document.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {getFileIcon(document.fileType)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {document.originalName}
                        </h3>
                        {getStatusBadge(document.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span>{document.fileType.toUpperCase()}</span>
                        <span>•</span>
                        <span>{formatFileSize(document.fileSize)}</span>
                        <span>•</span>
                        <span>{formatDate(document.uploadDate)}</span>
                        {document.category && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {document.category}
                            </span>
                          </>
                        )}
                      </div>
                      {document.tags && (
                        <div className="mt-2 text-sm text-gray-500">
                          Tags: {document.tags}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteDocument(document.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query'; // ✅ Keep useQueryClient - it's used!
// Remove useAuth import since it's not used
import { filesApi } from '../lib/api';
import { formatDate, formatFileSize } from '../lib/utils';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Upload, 
  FileText, 
  Download, 
  Trash2,
  Search,
  Cloud,
  FolderOpen,
  Star,    // ✅ Keep - used in component
  Zap,     // ✅ Keep - used in component  
  Award,   // ✅ Keep - used in component
  Image,
  File,
  Archive,
  Video,
  Music
} from 'lucide-react';
import toast from 'react-hot-toast';

const FilesPage: React.FC = () => {
  // Remove: const { user } = useAuth(); // ✅ Not used
  const queryClient = useQueryClient(); // ✅ Keep - used in mutations
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading } = useQuery('files', () => filesApi.getFiles());

  const files = data?.files || [];
  const filteredFiles = files.filter(file => 
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get file icon based on type
  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext || '')) return Image;
    if (['mp4', 'avi', 'mov', 'wmv'].includes(ext || '')) return Video;
    if (['mp3', 'wav', 'ogg'].includes(ext || '')) return Music;
    if (['zip', 'rar', '7z'].includes(ext || '')) return Archive;
    return File;
  };

  // Utility function to handle file download/opening
  const triggerFileDownload = (url: string, filename: string) => {
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank'; // Open in new tab for viewable files
    link.download = filename; // Suggest download name
    
    // Temporarily add to DOM and click
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  };

  const uploadMutation = useMutation(
    (file: File) => filesApi.uploadFile(file),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('files');
        toast.success('🎉 File uploaded successfully! Ready to share your work!');
        setSelectedFiles([]);
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Upload failed! Please try again.';
        toast.error(`❌ ${message}`);
      },
    }
  );

  const deleteMutation = useMutation(
    (fileId: string) => filesApi.deleteFile(fileId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('files');
        toast.success('🗑️ File deleted successfully!');
      },
      onError: () => {
        toast.error('❌ Failed to delete file. Please try again.');
      },
    }
  );

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of selectedFiles) {
        await uploadMutation.mutateAsync(file);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (file: any) => {
    try {
      // Get the download URL from the API (correct parameter usage)
      const downloadData = await filesApi.downloadFile(file.id);
      
      // Use our utility function to download/open the file
      triggerFileDownload(downloadData.downloadUrl, file.originalName);
      
      toast.success(`📥 ${file.originalName} opened successfully!`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('❌ Failed to download file. Please try again.');
    }
  };

  const handleDelete = (fileId: string) => {
    if (window.confirm('🗑️ Are you sure you want to delete this file?')) {
      deleteMutation.mutate(fileId);
    }
  };

  const getStorageMotivation = () => {
    if (files.length === 0) {
      return "Ready to build your digital library? 📚";
    }
    if (files.length >= 10) {
      return "Wow! You're becoming a file organization master! 🏆";
    }
    return "Great job building your collection! 📂";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center">
                  <Cloud className="w-8 h-8 mr-3" />
                  Your Digital Workspace 📁
                </h1>
                <p className="text-xl text-purple-100 font-medium mb-1">
                  {getStorageMotivation()}
                </p>
                <p className="text-purple-200">
                  {files.length > 0 
                    ? `Managing ${files.length} files like a digital wizard!`
                    : "Upload your first file and start organizing your academic life!"
                  }
                </p>
              </div>
              <div className="hidden md:block">
                <div className="text-center">
                  <div className="text-3xl mb-2">☁️</div>
                  <div className="text-sm text-purple-200">
                    {files.length} files
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-purple-600" />
              Quick Upload ⚡
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose Files to Upload 📎
              </label>
              <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="w-full px-4 py-3 border-2 border-dashed border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm hover:border-purple-400 transition-colors duration-200"
              />
              {selectedFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-sm font-medium text-gray-700">Selected files: 🎯</p>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center text-sm text-gray-600 bg-purple-50 px-3 py-2 rounded-lg">
                      <FileText className="w-4 h-4 mr-2 text-purple-600" />
                      {file.name} ({formatFileSize(file.size)})
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="flex items-center justify-center">
              <button
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || isUploading}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:cursor-not-allowed disabled:transform-none text-lg"
              >
                {isUploading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-3" />
                    Uploading Magic... ✨
                  </>
                ) : (
                  <>
                    <Upload className="w-6 h-6 mr-3" />
                    Upload Files 🚀
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search and Files Section */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50">
          <div className="p-6 border-b border-gray-200/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <FolderOpen className="w-5 h-5 mr-2 text-purple-600" />
                Your Files ({filteredFiles.length})
              </h3>
              
              {/* Search */}
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search your files... 🔍"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>

          <div className="p-6">
            {filteredFiles.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  {searchTerm ? (
                    <Search className="w-12 h-12 text-purple-500" />
                  ) : (
                    <Star className="w-12 h-12 text-purple-500" />
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {searchTerm 
                    ? "No files match your search 🔍" 
                    : "Ready to start your file collection? 📁"
                  }
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                  {searchTerm 
                    ? "Try a different search term or upload some new files!"
                    : "Upload your first file and start building your digital library!"
                  }
                </p>
                {!searchTerm && (
                  <div className="text-4xl mb-4">📚</div>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredFiles.map((file) => {
                  const FileIcon = getFileIcon(file.originalName);
                  return (
                    <div
                      key={file.id}
                      className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 hover:shadow-lg transition-all duration-200 border border-gray-100 hover:border-purple-200 group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <div className="bg-purple-100 p-2 rounded-lg mr-3 group-hover:bg-purple-200 transition-colors duration-200">
                            <FileIcon className="w-5 h-5 text-purple-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 truncate group-hover:text-purple-600 transition-colors duration-200">
                              {file.originalName}
                            </h4>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="text-xs text-gray-500 flex items-center">
                          <Zap className="w-3 h-3 mr-1" />
                          {formatFileSize(file.size)}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center">
                          <Award className="w-3 h-3 mr-1" />
                          {formatDate(file.createdAt)}
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <button
                          onClick={() => handleDownload(file)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Open
                        </button>
                        <button
                          onClick={() => handleDelete(file.id)}
                          className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilesPage;

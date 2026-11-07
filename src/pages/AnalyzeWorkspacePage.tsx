import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  UploadCloud,
  Image as ImageIcon,
  Video,
  FileText,
  X,
  ArrowRight,
  AlertCircle,
  Film,
  Sparkles,
} from 'lucide-react';
import { MediaType, AuthenticityReport, ExtractedFrame, SampleMediaItem } from '../types';
import { extractVideoFrames } from '../utils/videoExtractor';
import { SAMPLE_MEDIA } from '../data/sampleMedia';
import { saveReport } from '../utils/reportStorage';
import { AnalysisLoading } from '../components/AnalysisLoading';
import { parseApiResponse } from '../utils/apiClient';

export const AnalyzeWorkspacePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = (searchParams.get('type') as MediaType) || 'image';

  const [selectedType, setSelectedType] = useState<MediaType>(initialType);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [extractedFrames, setExtractedFrames] = useState<ExtractedFrame[]>([]);
  const [videoDuration, setVideoDuration] = useState<number | undefined>();
  const [videoResolution, setVideoResolution] = useState<string | undefined>();
  const [documentText, setDocumentText] = useState<string>('');

  // Processing state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState(0);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync with searchParams
  useEffect(() => {
    const typeFromQuery = searchParams.get('type') as MediaType;
    if (typeFromQuery && ['image', 'video', 'document'].includes(typeFromQuery)) {
      setSelectedType(typeFromQuery);
    }
  }, [searchParams]);

  const setTypeAndParam = (type: MediaType) => {
    handleRemoveFile();
    setSelectedType(type);
    setSearchParams({ type });
  };

  const getAcceptString = (type: MediaType) => {
    switch (type) {
      case 'image':
        return 'image/jpeg,image/png,image/webp,image/jpg';
      case 'video':
        return 'video/mp4,video/webm,video/quicktime';
      case 'document':
        return '.pdf,.txt,.docx,application/pdf,text/plain';
    }
  };

  const handleFileChange = async (file: File) => {
    setAnalysisError(null);
    setExtractedFrames([]);
    setDocumentText('');

    if (file.size > 35 * 1024 * 1024) {
      setAnalysisError('File exceeds the 35MB limit. Please upload a smaller file.');
      return;
    }

    let inferredType: MediaType = selectedType;
    if (file.type.startsWith('image/')) inferredType = 'image';
    else if (file.type.startsWith('video/')) inferredType = 'video';
    else if (file.type === 'application/pdf' || file.name.match(/\.(pdf|txt|docx)$/i)) inferredType = 'document';

    setSelectedType(inferredType);
    setSelectedFile(file);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    if (inferredType === 'video') {
      try {
        const { frames, duration, resolution } = await extractVideoFrames(file, 5);
        setExtractedFrames(frames);
        setVideoDuration(duration);
        setVideoResolution(resolution);
      } catch (err) {
        console.warn('Video frame preview extraction issue:', err);
      }
    } else if (inferredType === 'document' && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDocumentText((e.target?.result as string) || '');
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileChange(e.dataTransfer.files[0]);
      }
    },
    [selectedType]
  );

  const handleRemoveFile = () => {
    if (previewUrl && !previewUrl.startsWith('data:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedFrames([]);
    setDocumentText('');
    setAnalysisError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectSample = async (sample: SampleMediaItem) => {
    handleRemoveFile();
    setSelectedType(sample.type);
    setSearchParams({ type: sample.type });

    if (sample.sampleDataUrl) {
      setPreviewUrl(sample.sampleDataUrl);
      const res = await fetch(sample.sampleDataUrl);
      const blob = await res.blob();
      const file = new File([blob], sample.name, {
        type: sample.type === 'video' ? 'video/mp4' : 'image/png',
      });
      setSelectedFile(file);

      if (sample.type === 'video') {
        setExtractedFrames([
          { timestamp: '00:01', timestampSeconds: 1, base64: sample.sampleDataUrl, mimeType: 'image/jpeg' },
          { timestamp: '00:03', timestampSeconds: 3, base64: sample.sampleDataUrl, mimeType: 'image/jpeg' },
          { timestamp: '00:05', timestampSeconds: 5, base64: sample.sampleDataUrl, mimeType: 'image/jpeg' },
        ]);
        setVideoDuration(6);
        setVideoResolution('1920x1080');
      }
    } else if (sample.sampleText) {
      setDocumentText(sample.sampleText);
      const fileName = sample.name.endsWith('.pdf') ? sample.name.replace(/\.pdf$/i, '.txt') : sample.name;
      const blob = new Blob([sample.sampleText], { type: 'text/plain' });
      const file = new File([blob], fileName, { type: 'text/plain' });
      setSelectedFile(file);
    }
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile && !documentText.trim()) {
      setAnalysisError('Please upload a file or enter text content before starting verification.');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisStage(0);

    try {
      await new Promise((r) => setTimeout(r, 600));
      setAnalysisStage(1);

      let response: Response;

      if (selectedType === 'video') {
        setAnalysisStage(2);

        if (extractedFrames.length > 0) {
          response = await fetch('/api/analyze/video', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              frames: extractedFrames,
              fileName: selectedFile?.name || 'video-sample.mp4',
              fileSizeBytes: selectedFile?.size || 4000000,
              totalDurationSeconds: videoDuration || 5,
              resolution: videoResolution || '1080p',
            }),
          });
        } else {
          if (!selectedFile) throw new Error('Please select a video file to verify.');
          const formData = new FormData();
          formData.append('file', selectedFile);
          response = await fetch('/api/analyze/video', {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: formData,
          });
        }
      } else if (selectedType === 'document') {
        setAnalysisStage(2);
        const formData = new FormData();

        if (selectedFile) {
          formData.append('file', selectedFile);
        }
        if (documentText.trim()) {
          formData.append('textContent', documentText.trim());
          if (!selectedFile) {
            formData.append('fileName', 'document.txt');
          }
        }

        response = await fetch('/api/analyze/document', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData,
        });
      } else {
        // Image
        if (!selectedFile) throw new Error('Please select an image file to verify.');
        setAnalysisStage(2);

        const formData = new FormData();
        formData.append('file', selectedFile);

        response = await fetch('/api/analyze/image', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData,
        });
      }

      setAnalysisStage(3);
      await new Promise((r) => setTimeout(r, 400));
      setAnalysisStage(4);

      // Safe JSON response parsing with diagnostic error detection
      const reportData = await parseApiResponse<AuthenticityReport>(response);
      
      // Save report in persistent storage so history and metrics update
      saveReport(reportData);

      // Navigate immediately to the dedicated report page
      navigate(`/dashboard/report/${reportData.id}`);
    } catch (err: any) {
      console.error('Analysis failed:', err);
      setAnalysisError(err?.message || 'Failed to complete verification. Please check file and retry.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Breadcrumb & Back button */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Loading Screen during active AI verification */}
      {isAnalyzing && (
        <AnalysisLoading
          currentStageIndex={analysisStage}
          fileName={selectedFile?.name || 'Uploaded content'}
          fileType={selectedType}
          extractedFrameCount={extractedFrames.length > 0 ? extractedFrames.length : undefined}
        />
      )}

      {/* Main Workspace Form */}
      {!isAnalyzing && (
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Media Verification Workspace
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 max-w-lg mx-auto">
              Upload your digital media to inspect for generative synthesis, deepfakes, and typographic anomalies.
            </p>
          </div>

          {/* Segmented Modality Selector */}
          <div className="flex items-center justify-center">
            <div className="inline-flex items-center p-1.5 bg-white rounded-xl border border-slate-200 shadow-xs">
              <button
                onClick={() => setTypeAndParam('image')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedType === 'image'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Image</span>
              </button>

              <button
                onClick={() => setTypeAndParam('video')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedType === 'video'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>Video</span>
              </button>

              <button
                onClick={() => setTypeAndParam('document')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedType === 'document'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Document</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {analysisError && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <strong className="font-semibold">Analysis Failed:</strong> {analysisError}
              </div>
            </div>
          )}

          {/* Upload Area */}
          {!selectedFile && !documentText ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsDragging(false);
              }}
              className={`border-2 border-dashed rounded-2xl p-10 sm:p-14 text-center transition-all duration-200 bg-white ${
                isDragging ? 'border-indigo-500 bg-indigo-50/30 shadow-md' : 'border-slate-300 hover:border-slate-400'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={getAcceptString(selectedType)}
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100">
                <UploadCloud className="w-7 h-7" />
              </div>

              <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-1">
                Drag and drop your {selectedType} file
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6 leading-relaxed">
                {selectedType === 'image' && 'Supports JPG, PNG, WEBP up to 35MB. Inspects synthetic artifacts and manipulation.'}
                {selectedType === 'video' && 'Supports MP4, WebM, MOV. Samples keyframes locally in your browser for temporal analysis.'}
                {selectedType === 'document' && 'Supports PDF, TXT, DOCX. Audits typographic regularities and content consistency.'}
              </p>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center justify-center px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-[0.98] rounded-xl shadow-xs transition-all cursor-pointer whitespace-nowrap"
              >
                Browse Local Files
              </button>

              <div className="mt-6 text-[11px] text-slate-400">
                Maximum file size: 35MB · Secure, in-memory processing
              </div>
            </div>
          ) : (
            /* Uploaded Preview Card */
            <div className="p-6 sm:p-8 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    {selectedType === 'image' && <ImageIcon className="w-5 h-5" />}
                    {selectedType === 'video' && <Video className="w-5 h-5" />}
                    {selectedType === 'document' && <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 truncate max-w-[280px] sm:max-w-md">
                      {selectedFile?.name || 'document.txt'}
                    </h4>
                    <div className="text-xs text-slate-500 font-mono">
                      {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` : `${documentText.length} characters`} · {selectedType.toUpperCase()}
                      {videoDuration ? ` · ${videoDuration}s duration` : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                  >
                    Replace
                  </button>
                  <button
                    onClick={handleRemoveFile}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={getAcceptString(selectedType)}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileChange(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Viewport Preview */}
              <div>
                {selectedType === 'image' && previewUrl && (
                  <div className="relative aspect-video max-h-[360px] rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Uploaded media preview"
                      className="max-h-[360px] w-full object-contain"
                    />
                  </div>
                )}

                {selectedType === 'video' && (
                  <div className="space-y-4">
                    {previewUrl && (
                      <div className="relative aspect-video max-h-[320px] rounded-xl bg-slate-950 overflow-hidden flex items-center justify-center">
                        <video
                          src={previewUrl}
                          controls
                          className="max-h-[320px] w-full object-contain"
                        />
                      </div>
                    )}

                    {extractedFrames.length > 0 && (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-900 mb-3">
                          <span className="flex items-center gap-1.5">
                            <Film className="w-4 h-4 text-indigo-600" />
                            Sampled Keyframes for Temporal Deepfake Inspection ({extractedFrames.length} frames)
                          </span>
                          <span className="text-[11px] font-mono text-slate-500">
                            {videoResolution || '1080p'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                          {extractedFrames.map((frame, i) => (
                            <div
                              key={i}
                              className="group relative rounded-lg overflow-hidden bg-slate-900 border border-slate-200"
                            >
                              <img
                                src={frame.base64}
                                alt={`Keyframe at ${frame.timestamp}`}
                                className="aspect-video w-full object-cover"
                              />
                              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[10px] font-mono text-indigo-300">
                                {frame.timestamp}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {selectedType === 'document' && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-xs text-slate-700 max-h-60 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {documentText || 'PDF Document loaded for typographic analysis and tamper detection.'}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={handleRemoveFile}
                  className="text-xs text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleStartAnalysis}
                  className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <span>Analyze Now</span>
                  <ArrowRight className="w-4 h-4 text-indigo-200" />
                </button>
              </div>

            </div>
          )}

          {/* Quick Test Samples */}
          <div className="pt-8 border-t border-slate-200/80">
            <div className="text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Or test instantly with pre-configured forensic samples
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {SAMPLE_MEDIA.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="text-left p-4 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-indigo-600 font-semibold uppercase">
                      {sample.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">1-Click Test</span>
                  </div>
                  <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors truncate">
                    {sample.name}
                  </h5>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {sample.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};

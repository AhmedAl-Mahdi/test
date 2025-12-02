import { useState } from 'react';
import { Upload, Image as ImageIcon, AlertTriangle, CheckCircle, AlertCircle, Loader2, Info } from 'lucide-react';
import Layout from '../components/Layout';
import { imagingAPI } from '../utils/api';

const SCAN_TYPES = [
  { 
    id: 'pneumonia', 
    label: '🫁 Pneumonia', 
    title: 'Pneumonia Detection (X-Ray)',
    subtitle: 'Analyze chest X-rays for signs of pneumonia',
    inputSize: '150x150',
    demoOptions: [
      { type: 'normal', label: 'Load Normal X-Ray (Demo)' },
      { type: 'pneumonia', label: 'Load Pneumonia X-Ray (Demo)' },
    ],
  },
  { 
    id: 'breast', 
    label: '🎀 Breast Cancer', 
    title: 'Breast Cancer Detection (Mammogram)',
    subtitle: 'Analyze mammogram scans for abnormalities',
    inputSize: '224x224',
    demoOptions: [
      { type: 'benign', label: 'Load Benign Scan (Demo)' },
      { type: 'malignant', label: 'Load Malignant Scan (Demo)' },
    ],
  },
  { 
    id: 'kidney', 
    label: '🔬 Kidney Cancer', 
    title: 'Kidney Cancer Detection (CT Scan)',
    subtitle: 'Analyze CT scans for kidney tumors',
    inputSize: '224x224',
    demoOptions: [
      { type: 'normal', label: 'Load Normal Kidney (Demo)' },
      { type: 'tumor', label: 'Load Kidney with Tumor (Demo)' },
    ],
  },
  { 
    id: 'brain', 
    label: '🧠 Brain Cancer', 
    title: 'Brain Tumor Detection (MRI)',
    subtitle: 'Analyze MRI scans for brain tumors',
    inputSize: '224x224',
    demoOptions: [
      { type: 'tumor', label: 'Load General Tumor (Demo)' },
      { type: 'glioma', label: 'Load Glioma Tumor (Demo)' },
      { type: 'meningioma', label: 'Load Meningioma Tumor (Demo)' },
    ],
  },
];

export default function ImagingPage() {
  const [activeTab, setActiveTab] = useState('pneumonia');
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [demoMode, setDemoMode] = useState(false);
  const [demoType, setDemoType] = useState(null);

  const currentScan = SCAN_TYPES.find((s) => s.id === activeTab);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setDemoMode(false);
      setDemoType(null);
      setResult(null);
    }
  };

  // Map demo types to actual image file names
  const getDemoImagePath = (scanType, demoType) => {
    const imageMap = {
      pneumonia: {
        normal: '/demo_images/normal_1.jpeg',
        pneumonia: '/demo_images/pneumonia_1.jpeg',
      },
      breast: {
        benign: '/demo_images/bc_benign_1.jpeg',
        malignant: '/demo_images/bc_malignant_1.jpeg',
      },
      kidney: {
        normal: '/demo_images/kidney_normal.jpg',
        tumor: '/demo_images/kidney_tumor.jpg',
      },
      brain: {
        tumor: '/demo_images/brain_tumor.jpg',
        glioma: '/demo_images/brain_glioma.jpg',
        meningioma: '/demo_images/brain_meningioma.jpg',
      },
    };
    return imageMap[scanType]?.[demoType] || '/demo_images/normal_1.jpeg';
  };

  const loadDemo = (type) => {
    setDemoMode(true);
    setDemoType(type);
    setSelectedFile(null);
    // Use mapped image path for demo
    setPreview(getDemoImagePath(activeTab, type));
    setResult(null);
  };

  const analyze = async () => {
    setLoading(true);
    setResult(null);

    try {
      let response;
      const file = demoMode ? new Blob(['demo'], { type: 'image/jpeg' }) : selectedFile;

      switch (activeTab) {
        case 'pneumonia':
          response = await imagingAPI.analyzePneumonia(file, demoMode, demoType);
          break;
        case 'breast':
          response = await imagingAPI.analyzeBreastCancer(file, demoMode, demoType);
          break;
        case 'kidney':
          response = await imagingAPI.analyzeKidneyCancer(file, demoMode, demoType);
          break;
        case 'brain':
          response = await imagingAPI.analyzeBrainCancer(file, demoMode, demoType);
          break;
        default:
          throw new Error('Unknown scan type');
      }

      setResult(response);
    } catch (err) {
      console.error('Analysis error:', err);
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setPreview(null);
    setResult(null);
    setDemoMode(false);
    setDemoType(null);
  };

  const getResultStyle = (finding) => {
    if (!finding) return '';
    const lower = finding.toLowerCase();
    if (lower.includes('not detected') || lower.includes('benign') || lower.includes('normal') || lower.includes('no tumor')) {
      return 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400';
    }
    return 'bg-red-500/20 border-red-500/30 text-red-400';
  };

  const getResultIcon = (finding) => {
    if (!finding) return null;
    const lower = finding.toLowerCase();
    if (lower.includes('not detected') || lower.includes('benign') || lower.includes('normal') || lower.includes('no tumor')) {
      return <CheckCircle className="w-6 h-6" />;
    }
    return <AlertCircle className="w-6 h-6" />;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Care-AI Diagnostic Imaging Hub</h1>
          <p className="text-slate-400 mt-1">
            Select a detection tool below to begin your analysis.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="flex items-center gap-3 p-4 bg-amber-500/20 rounded-xl border border-amber-500/30">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-slate-300">
            <span className="text-amber-400 font-medium">Important:</span> This is a proof-of-concept and not a substitute for professional medical diagnosis.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 bg-slate-800 p-2 rounded-xl">
          {SCAN_TYPES.map((scan) => (
            <button
              key={scan.id}
              onClick={() => {
                setActiveTab(scan.id);
                resetState();
              }}
              className={`flex-1 min-w-[120px] py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === scan.id
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              {scan.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Upload */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-2">{currentScan.title}</h2>
            <p className="text-slate-400 text-sm mb-6">{currentScan.subtitle}</p>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 text-center hover:border-emerald-500/50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 font-medium">Upload an Image</p>
                <p className="text-slate-500 text-sm mt-1">Click to select or drag and drop</p>
              </label>
            </div>

            {/* Demo Buttons */}
            <div className="mt-4">
              <p className="text-center text-slate-500 text-sm mb-3">or try with demo images</p>
              <div className="space-y-2">
                {currentScan.demoOptions.map((demo) => (
                  <button
                    key={demo.type}
                    onClick={() => loadDemo(demo.type)}
                    className={`w-full py-2 px-4 rounded-lg border transition-all ${
                      demoMode && demoType === demo.type
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'border-slate-600 text-slate-300 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    {demo.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Info */}
            <div className="mt-6 p-3 bg-slate-700/50 rounded-lg flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400" />
              <span className="text-sm text-slate-400">
                Input size: {currentScan.inputSize}
              </span>
            </div>
          </div>

          {/* Right Column - Preview & Results */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Analyze & Review</h3>

            {preview ? (
              <>
                {/* Image Preview */}
                <div className="bg-slate-900 rounded-lg p-4 mb-4">
                  <img
                    src={preview}
                    alt="Medical scan"
                    className="max-w-full h-auto mx-auto rounded-lg"
                    style={{ maxHeight: '300px' }}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x300?text=Demo+Image';
                    }}
                  />
                  <p className="text-center text-slate-400 text-sm mt-2">
                    {demoMode ? `Demo - ${demoType}` : 'Uploaded Image'}
                  </p>
                </div>

                {/* Analyze Button */}
                <button
                  onClick={analyze}
                  disabled={loading}
                  className="w-full py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-5 h-5" />
                      Analyze Image
                    </>
                  )}
                </button>

                {/* Results */}
                {result && (
                  <div className={`mt-4 p-4 rounded-lg border ${getResultStyle(result.finding)}`}>
                    {result.success ? (
                      <div className="flex items-center gap-3">
                        {getResultIcon(result.finding)}
                        <div>
                          <p className="font-semibold">{result.finding}</p>
                          {result.confidence && (
                            <p className="text-sm opacity-80">
                              Confidence: {result.confidence.toFixed(2)}%
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-red-400">
                        <AlertCircle className="w-6 h-6" />
                        <p>{result.error || 'Analysis failed'}</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ImageIcon className="w-16 h-16 text-slate-600 mb-4" />
                <p className="text-slate-400">Upload an image or load a demo to begin</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

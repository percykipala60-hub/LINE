import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Upload, Image as ImageIcon, Zap, CheckCircle, 
  ArrowRight, Download, Sparkles, AlertCircle 
} from 'lucide-react';
import { convertImageToWebP, WebPConversionResult } from '../utils/webpConverter';

export const WebPUploaderSection: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState<number>(0.85);
  const [results, setResults] = useState<WebPConversionResult[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    setErrorMsg(null);

    const newResults: WebPConversionResult[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Veuillez sélectionner uniquement des images (JPG, PNG, HEIC, etc.)');
        continue;
      }

      try {
        const result = await convertImageToWebP(file, quality);
        newResults.push(result);
      } catch (err) {
        console.error('Erreur de conversion :', err);
        setErrorMsg('Une erreur est survenue lors de la compression WebP');
      }
    }

    setResults((prev) => [...newResults, ...prev]);
    setIsProcessing(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="bg-white dark:bg-[#121824] rounded-3xl p-5 sm:p-7 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <Zap className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Moteur Graphique WebP Automatique
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Optimiseur d'Images & Vêtements
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-lg mt-0.5">
            Conformément aux directives : aucune image brute JPEG ou PNG n'est enregistrée. Tout est converti en WebP ultra-léger instantanément côté client.
          </p>
        </div>

        {/* Quality control pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 pl-2">
            Qualité : {Math.round(quality * 100)}%
          </span>
          <input
            type="range"
            min="0.6"
            max="0.95"
            step="0.05"
            value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
            className="w-20 accent-emerald-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Drag & Drop Canvas Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 scale-[1.01]'
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-200 mb-3 group-hover:scale-110 transition-transform">
          {isProcessing ? (
            <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          )}
        </div>

        <h4 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">
          {isProcessing ? 'Compression et conversion WebP en cours...' : 'Glissez-déposez vos photos de vêtements ici'}
        </h4>
        <p className="text-xs text-slate-500 max-w-sm">
          JPG, PNG ou HEIC transformés automatiquement en <span className="text-emerald-600 font-semibold">.webp</span> haute fidélité pour une vitesse maximale.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Results grid */}
      {results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-400">
            <span>Images converties ({results.length})</span>
            <span className="text-emerald-600 dark:text-emerald-400">Gain de bande passante optimal</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {results.map((res, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700 shrink-0">
                  <img
                    src={res.webpDataUrl}
                    alt="WebP aperçu"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-emerald-500 text-white rounded">
                      WEBP
                    </span>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {res.originalFile.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="line-through">{res.originalSizeKB} Ko</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      {res.webpSizeKB} Ko (-{res.reductionPercentage}%)
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Dimensions : {res.width} × {res.height} px
                  </div>
                </div>

                <a
                  href={res.webpDataUrl}
                  download={`${res.originalFile.name.split('.')[0]}.webp`}
                  className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 flex items-center justify-center shadow-xs transition-transform active:scale-95"
                  title="Télécharger le fichier WebP converti"
                >
                  <Download className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

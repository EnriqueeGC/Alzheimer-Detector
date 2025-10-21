import testImage from '../assets/The-Cookie-Theft.png';
import React, { useState, useRef, useEffect } from 'react';

type TestMode = 'idle' | 'recording' | 'text' | 'audio_ready' | 'loading';

const TestPage: React.FC = () => {
  const [mode, setMode] = useState<TestMode>('idle');
  const [transcription, setTranscription] = useState('');

  // Estado para mensajes de carga
  const [statusMessage, setStatusMessage] = useState('');
  // Estado para el archivo de audio (grabado o subido)
  const [audioData, setAudioData] = useState<Blob | null>(null);

  const [isBrowserSupported, setIsBrowserSupported] = useState(false);

  // useRef para el MediaRecorder
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  // Ref para guardar los "chunks" de audio mientras se graba
  const audioChunksRef = useRef<Blob[]>([]);

  // useEffect PARA VERIFICAR COMPATIBILIDAD DEL NAVEGADOR
  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setIsBrowserSupported(true);
    } else {
      setIsBrowserSupported(false);
      console.error("Este navegador no soporta la API de MediaRecorder.");
    }
  }, []);

  const handleStartRecording = async () => {
    if (!isBrowserSupported) return;
    
    setAudioData(null); // Limpia audio anterior
    audioChunksRef.current = []; // Limpia chunks
    setStatusMessage('Iniciando grabación...');
    setMode('recording');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);

      // Cuando el grabador tiene datos, los guarda en el array
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      // Cuando el grabador se detiene...
      mediaRecorderRef.current.onstop = () => {
        // ...crea un único "Blob" de audio
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioData(audioBlob); // Guarda el audio
        setMode('audio_ready'); // Cambia al modo "listo para enviar"
        setStatusMessage('Grabación detenida. Listo para analizar.');
        
        // Detiene las pistas del micrófono
        stream.getTracks().forEach(track => track.stop());
      };

      // Inicia la grabación
      mediaRecorderRef.current.start();
      setStatusMessage('Grabando... (hable ahora)');

    } catch (err) {
      console.error("Error al iniciar la grabación:", err);
      setStatusMessage('Error: No se pudo acceder al micrófono.');
      setMode('idle');
    }
  };

  // Detiene la grabación
  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'audio/wav' || file.type === 'audio/x-wav')) {
      setAudioData(file);
      setTranscription(''); // Limpia transcripción anterior
      setStatusMessage(`Archivo "${file.name}" cargado. Listo para analizar.`);
      setMode('audio_ready');
    } else {
      alert('Por favor, sube un archivo .wav');
    }
  };

  const handleAnalyzeAudio = async () => {
    if (!audioData) return;

    setMode('loading');
    setStatusMessage('Enviando audio al servidor...');

    const formData = new FormData();
    formData.append('audio_file', audioData, 'recording.wav');

    let transcribedText = '';

    try {
      const transcribeResponse = await fetch('http://127.0.0.1:8000/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!transcribeResponse.ok) {
        throw new Error(`Error del servidor de transcripción: ${transcribeResponse.statusText}`);
      }

      const transcribeData = await transcribeResponse.json();
      transcribedText = transcribeData.transcription;
      setTranscription(transcribedText); // Muestra el texto en el UI
      setStatusMessage('Audio transcrito. Analizando texto...');

      await handleAnalyzeText(transcribedText); // Pasam el texto directamente

    } catch (error) {
      console.error('Error en el pipeline de audio:', error);
      setStatusMessage(`Error: ${error.message}`);
      setMode('audio_ready'); // Vuelve al modo anterior si falla
    }
  };

  const handleAnalyzeText = async (textToAnalyze?: string) => {
    const text = textToAnalyze || transcription; // Usa el argumento o el estado
    
    if (!text) {
      alert('No hay texto para analizar.');
      return;
    }

    setMode('loading');
    if (!textToAnalyze) { // Solo muestra este mensaje si es análisis manual
      setStatusMessage('Analizando texto...');
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text }),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor de predicción: ${response.statusText}`);
      }

      const predictionData = await response.json();
      
      setStatusMessage(`Resultado: ${predictionData.result} (Confianza: ${predictionData.confidence_percent}%)`);

    } catch (error) {
      console.error('Error en el análisis de texto:', error);
      setStatusMessage(`Error: ${error.message}`);
    } finally {
      // Si veníamos de analizar audio, volvemos a 'idle', si no, a 'text'
      setMode(textToAnalyze ? 'idle' : 'text');
    }
  };
  
  const handleStartTextMode = () => {
    setMode('text');
    setAudioData(null);
    setTranscription('');
    setStatusMessage('Escribe la descripción...');
  };
  
  const handleCancel = () => {
    setMode('idle');
    setTranscription('');
    setAudioData(null);
    setStatusMessage('');
  };

  // Estilos (puedes moverlos a un CSS)
  const btn = "px-6 py-2 rounded-lg font-semibold shadow-md transition-all duration-200";
  const btnPrimary = `${btn} bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400`;
  const btnSecondary = `${btn} bg-gray-200 text-gray-800 hover:bg-gray-300`;
  const btnDanger = `${btn} bg-red-600 text-white hover:bg-red-700`;

  return (
    <>
    <div className="">
      <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          <div className="p-4 md:p-8 border-b md:border-b-0 md:border-r border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Test de la Galleta (Cookie Theft)</h2>
            <div className="w-full aspect-video bg-gray-200 rounded-lg overflow-hidden">
              <img src={testImage} alt="Cookie Theft Test" className="w-full h-full object-contain" />
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Por favor, describe todo lo que ves que está sucediendo en esta imagen.
            </p>
          </div>

          <div className="p-4 md:p-8 flex flex-col justify-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Tu Descripción</h3>
            
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-600 mb-2">Estado: {statusMessage || 'Esperando...'}</p>
            </div>

            <div className="w-full mb-4">
              <textarea
                className="w-full h-40 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Aquí aparecerá tu transcripción o puedes escribir directamente..."
                value={transcription}
                onChange={(e) => {
                  if (mode === 'text') setTranscription(e.target.value);
                }}
                readOnly={mode !== 'text'}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start mt-6">
              
              {mode === 'idle' && (
                <>
                  <button 
                    onClick={handleStartRecording} 
                    className={btnPrimary} 
                    disabled={!isBrowserSupported}
                  >
                    Grabar Audio
                  </button>
                  <label className={`${btnSecondary} cursor-pointer text-center`}>
                    Subir .WAV
                    <input type="file" accept="audio/wav,audio/x-wav" className="hidden" onChange={handleFileUpload} />
                  </label>
                  <button onClick={handleStartTextMode} className={btnSecondary}>
                    Escribir Texto
                  </button>
                </>
              )}

              {mode === 'recording' && (
                <button onClick={handleStopRecording} className={btnDanger}>
                  Detener Grabación
                </button>
              )}

              {mode === 'text' && (
                <>
                  <button onClick={() => handleAnalyzeText()} className={btnPrimary}>
                    Analizar Texto
                  </button>
                  <button onClick={handleCancel} className={btnSecondary}>
                    Cancelar
                  </button>
                </>
              )}

              {mode === 'audio_ready' && (
                <>
                  <button onClick={handleAnalyzeAudio} className={btnPrimary}>
                    Analizar Audio
                  </button>
                  <button onClick={handleCancel} className={btnSecondary}>
                    Cancelar (Descartar)
                  </button>
                </>
              )}

              {mode === 'loading' && (
                <p className="text-blue-600 font-semibold">{statusMessage || 'Procesando...'}</p>
              )}
            </div>

            {!isBrowserSupported && mode === 'idle' && (
              <p className="text-red-500 text-sm mt-4">La grabación de audio no es compatible con este navegador. Intenta con Chrome o Edge.</p>
            )}

          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default TestPage;
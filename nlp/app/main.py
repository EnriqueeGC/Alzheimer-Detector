from fastapi import FastAPI, HTTPException, UploadFile, File
from .models import TranscriptRequest, PredictionResponse
from .services import run_full_prediction_pipeline
from fastapi.middleware.cors import CORSMiddleware
import logging
import whisper
import tempfile
import os

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# Cargar modelo Whisper al iniciar la aplicación
try:
    whisper_model = whisper.load_model("medium")
    logger.info("Modelo Whisper cargado exitosamente (modelo: 'base').")
except Exception as e:
    logger.error(f"Error fatal: No se pudo cargar el modelo Whisper. {e}")
    whisper_model = None

# Crear la aplicación FastAPI
app = FastAPI(
    title="API de Prototipo de Detección",
    description="Servicio para predecir posible demencia basado en transcripciones.",
    version="1.0.0"
)

# Lista de orígenes permitidos
origins = [
    "http://localhost:3000",  # Si usas create-react-app
    "http://localhost:5173",  # Si usas Vite
    "http://127.0.0.1:5173",
    # Añade cualquier otro puerto donde corra tu React
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Permite estos orígenes
    allow_credentials=True,
    allow_methods=["*"],         # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],         # Permite todos los headers
)


@app.on_event("startup")
async def startup_event():
    logger.info("La aplicación FastAPI está iniciando...")
    # Verificamos que el modelo se haya cargado
    if whisper_model is None:
        logger.warning("ADVERTENCIA: El modelo Whisper no está cargado. El endpoint /transcribe fallará.")
    else:
        logger.info("Modelos de IA (Predicción y Whisper) listos.")

@app.get("/", tags=["General"])
def read_root():
    """Endpoint raíz para verificar que la API está funcionando."""
    return {"status": "OK", "message": "API de Detección en funcionamiento."}

@app.post("/transcribe", tags=["Transcripción"])
async def transcribe_audio(audio_file: UploadFile = File(...)):
    """
    Recibe un archivo de audio (.wav, .mp3, .mp4, etc.), lo transcribe
    usando Whisper y devuelve el texto en español.
    """
    if whisper_model is None:
        raise HTTPException(status_code=500, detail="El modelo de transcripción no está disponible.")

    logger.info(f"Recibido archivo de audio: {audio_file.filename}")

    # Whisper trabaja con rutas de archivo, no con bytes en memoria.
    # Así que guardamos el audio en un archivo temporal.
    try:
        # Crea un archivo temporal
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(audio_file.filename)[1]) as temp_audio:
            # Escribe el contenido del archivo subido al archivo temporal
            content = await audio_file.read()
            temp_audio.write(content)
            temp_audio_path = temp_audio.name
        
        logger.info(f"Archivo guardado temporalmente en: {temp_audio_path}")

        # --- Transcripción con Whisper ---
        # Forzamos el idioma a español ("es") para consistencia
        result = whisper_model.transcribe(temp_audio_path, language="es", fp16=False)
        transcribed_text = result.get("text", "").strip()

        logger.info(f"Texto transcrito: {transcribed_text[:100]}...")

        # Devolvemos solo el texto
        return {"transcription": transcribed_text}

    except Exception as e:
        logger.error(f"Error durante la transcripción: {e}")
        raise HTTPException(status_code=500, detail=f"Error al procesar el archivo de audio: {e}")
    finally:
        # 5. Asegurarnos de borrar el archivo temporal
        if 'temp_audio_path' in locals() and os.path.exists(temp_audio_path):
            os.remove(temp_audio_path)
            logger.info(f"Archivo temporal eliminado: {temp_audio_path}")
            
@app.post("/predict", 
          response_model=PredictionResponse, 
          tags=["Predicción"])
async def predict_from_text(request: TranscriptRequest):
    """
    Recibe una transcripción en español, la procesa y devuelve
    una predicción (Control o Demencia).
    """
    logger.info(f"Recibida solicitud de predicción para texto: {request.text[:50]}...")
    
    try:
        # Llamar al pipeline de servicio
        prediction_data = run_full_prediction_pipeline(request.text)
        
        # Devolver la respuesta. FastAPI la convertirá en JSON.
        return PredictionResponse(**prediction_data)

    except ValueError as ve:
        # Error específico de la traducción
        logger.error(f"Error en la traducción: {ve}")
        raise HTTPException(status_code=503, # Service Unavailable
                            detail=f"Error en el servicio de traducción: {ve}")
    except Exception as e:
        # Captura cualquier otro error (ej. en la extracción de features)
        logger.error(f"Error inesperado procesando la solicitud: {e}")
        raise HTTPException(status_code=500, # Internal Server Error
                            detail=f"Error interno del servidor: {e}")
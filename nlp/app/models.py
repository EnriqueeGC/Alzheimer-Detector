from pydantic import BaseModel, Field

class TranscriptRequest(BaseModel):
    """El JSON que la API espera recibir."""
    text: str = Field(..., min_length=20, 
                      description="La transcripción en español del paciente.")

class PredictionResponse(BaseModel):
    """El JSON que la API devolverá."""
    result: str
    confidence_percent: float
    original_text: str
    translated_text: str
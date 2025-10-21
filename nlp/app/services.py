import joblib
import nltk
import numpy as np
import math
import textstat
from nltk.stem.wordnet import WordNetLemmatizer
from collections import Counter
import warnings
import google.generativeai as genai

# Importar la configuración (la API Key)
from .config import settings

# CONFIGURACIÓN Y CARGA DE MODELOS

# Ocultar warnings
warnings.filterwarnings("ignore")

# Configurar Gemini API
try:
    genai.configure(api_key=settings.GEMINI_API_KEY)
    gemini_model = genai.GenerativeModel('gemini-2.5-flash')
    print("Servicio de traducción (Gemini) inicializado.")
except Exception as e:
    print(f"Error fatal: No se pudo configurar Gemini. Verifica la API Key. {e}")
    raise e

# Cargar el modelo de IA
try:
    ml_model = joblib.load('modelo_prototipo.pkl')
    print("Modelo (modelo_prototipo.pkl) cargado exitosamente.")
except FileNotFoundError:
    print("Error fatal: No se encontró 'modelo_prototipo.pkl' en la raíz.")
    raise

# Descargar y configurar NLTK
try:
    nltk.download('punkt', quiet=True)
    nltk.download('averaged_perceptron_tagger', quiet=True)
    nltk.download('wordnet', quiet=True)
except Exception as e:
    print(f"Advertencia: No se pudieron descargar los recursos de NLTK. {e}")

lmtzr = WordNetLemmatizer()
grammar = r"""
NP: {<DT>?<JJ>*<NN.*>} 
PP: {<IN><NP>} 
VP: {<V.*><NP | PP>}     
"""
cp = nltk.RegexpParser(grammar)
cookie_pic_list = ['cookie','jar','stool','steal','sink','kitchen','window','curtain','fall'] 
list1 = ['mother','woman','lady']
list2 = ['girl','daughter','sister']
list3 = ['boy','son','child','kid','brother']
list4 = ['dish','plate','cup']
list5 = ['overflow','spill','running']
list6 = ['dry','wash'] 
list7 = ['faucet'] 
list8 = ['counter','cabinet'] 
list9 = ['water']
all_concept_lists = [cookie_pic_list, list1, list2, list3, list4, list5, list6, list7, list8, list9]
noun_list = ['NN', 'NNS', 'NNP', 'NNPS']
verb_list = ['VB', 'VBD', 'VBG', 'VBN', 'VBP']
print("Extractor de features (NLTK) inicializado.")

def traducir_con_gemini(texto_espanol: str) -> str:
    """
    Usa la API de Gemini para una traducción literal.
    """
    prompt_traduccion = f"""
    TRADUCCIÓN LITERAL PARA ANÁLISIS CLÍNICO:
    Traduce el siguiente texto de español a inglés.
    REGLAS IMPORTANTES:
    1.  **NO CORRIJAS NADA.**
    2.  **CONSERVA TODAS LAS REPETICIONES:** Si el usuario escribe 'El niño... el niño...', la traducción debe ser 'The boy... the boy...'.
    3.  **CONSERVA DISFLUENCIAS:** Mantén pausas (representadas por '...'), palabras incompletas y cualquier error gramatical.
    4.  **SÉ LITERAL:** No intentes 'mejorar' el texto.

    Texto a traducir:
    "{texto_espanol}"
    """
    try:
        response = gemini_model.generate_content(prompt_traduccion)
        traduccion = response.text
        traduccion = traduccion.strip().replace("Traducción:", "").strip()
        return traduccion
    except Exception as e:
        print(f"Error en la API de Gemini: {e}")
        # Error crítico: re-lanzar la excepción
        raise ValueError(f"Error en la traducción: {e}")

def extraer_features_final(texto_ingles: str) -> np.ndarray:
    """
    Toma texto crudo en INGLÉS y calcula el vector de 10 features.
    """
    textstat.set_lang('en_US')
    num_char = len([c for c in texto_ingles if c.isdigit() or c.isalpha()])
    num_words = len([word for word in texto_ingles.split(' ') if not word=='' and not word=='.'])
    num_sentences = texto_ingles.count('.') + texto_ingles.count('?')
    
    if num_words == 0 or num_sentences == 0:
        # Devuelve un vector de ceros si el texto es inválido
        return np.zeros(10).reshape(1, -1)

    text_tokens = nltk.word_tokenize(texto_ingles)
    numtokens = len(text_tokens)
    
    if numtokens == 0:
        return np.zeros(10).reshape(1, -1)
        
    tag_info = np.array(nltk.pos_tag(text_tokens))
    tag_fd = nltk.FreqDist(tag for i, (word, tag) in enumerate(tag_info))
    freq_tag = tag_fd.most_common()
    text_root = [lmtzr.lemmatize(j) for indexj, j in enumerate(text_tokens)]
    for indexj, j in enumerate(text_tokens):
        if tag_info[indexj, 1] in noun_list:
            text_root[indexj] = lmtzr.lemmatize(j) 
        elif tag_info[indexj, 1] in verb_list:
            text_root[indexj] = lmtzr.lemmatize(j,'v')
    
    freq_token_root = Counter(text_root)
    v = len(Counter(text_tokens))
    ttr = float(v) / numtokens
    v1 = sum(1 for j in freq_token_root if freq_token_root[j] == 1)
    
    if v == 0 or (1 - (v1/v)) == 0:
        R = 0 
    else:
        R = 100 * math.log(numtokens / (1 - (v1/v)))

    num_concepts_mentioned = 0
    for concept_list in all_concept_lists:
        num_concepts_mentioned += len(set(concept_list) & set(freq_token_root))

    ARI = 4.71*(num_char/num_words) + 0.5*(num_words/num_sentences) - 21.43
    L = (num_char/num_words) * 100
    S = (num_sentences/num_words) * 100
    CLI = 0.0588*L - 0.296*S - 15.8
    prp_count = sum([pos[1] for pos in freq_tag if pos[0]=='PRP' or pos[0]=='PRP$'])
    sentence = nltk.pos_tag(text_tokens)
    phrase_type = cp.parse(sentence)  
    NP_count = 0
    VP_count = 0
    for t in phrase_type:
        if not isinstance(t, tuple):
            if t.label() == 'NP':
                NP_count += 1
            elif t.label() == 'VP': 
                VP_count += 1
                
    noun_count = sum([pos[1] for pos in freq_tag if pos[0] in noun_list])
    if noun_count != 0:
        prp_noun_ratio = prp_count / noun_count
    else:
        prp_noun_ratio = prp_count

    word_sentence_ratio = num_words / num_sentences

    features_vector = [
        ttr, R, num_concepts_mentioned, ARI, CLI, 
        prp_count, VP_count, NP_count, prp_noun_ratio, 
        word_sentence_ratio
    ]
    
    return np.array(features_vector).reshape(1, -1)

def run_full_prediction_pipeline(texto_original_es: str) -> dict:
    """
    Ejecuta el pipeline completo:
    1. Traducir (ES -> EN)
    2. Extraer Features (EN -> Vector)
    3. Predecir (Vector -> 0 o 1)
    """
    
    # 1. Traducir
    print(f"Traduciendo texto: {texto_original_es[:50]}...")
    texto_traducido_en = traducir_con_gemini(texto_original_es)
    print(f"Texto traducido: {texto_traducido_en[:50]}...")
    
    # 2. Extraer Features
    vector_features = extraer_features_final(texto_traducido_en)
    
    # 3. Predecir
    prediccion_numerica = ml_model.predict(vector_features)
    proba_prediccion = ml_model.predict_proba(vector_features)
    
    # 4. Formatear respuesta
    confianza = proba_prediccion[0][prediccion_numerica[0]] * 100
    resultado_str = "Posible Demencia (1)" if prediccion_numerica[0] == 1 else "Control (0)"
    
    # Devolvemos un diccionario que coincide con el Pydantic 'PredictionResponse'
    return {
        "result": resultado_str,
        "confidence_percent": round(confianza, 2),
        "original_text": texto_original_es,
        "translated_text": texto_traducido_en
    }
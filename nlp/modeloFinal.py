import pandas as pd
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.metrics import classification_report
import joblib
import warnings

# Ignorar warnings de XGBoost
warnings.filterwarnings("ignore")

print("--- Paso 1: Entrenando el Modelo Definitivo ---")

# --- 1. Cargar Datos ---
try:
    df = pd.read_csv('feature_set_dem.csv')
except FileNotFoundError:
    print("Error: No se encontró 'feature_set_dem.csv'.")
    exit()

print(f"Datos cargados: {len(df)} muestras.")

# --- 2. Definir Features Replicables ---
feature_columns = [
    'ttr', 
    'R',  # Honore's statistic
    'num_concepts_mentioned', 
    'ARI', 
    'CLI', 
    'prp_count', 
    'VP_count', 
    'NP_count', 
    'prp_noun_ratio', 
    'word_sentence_ratio' 
]

X = df[feature_columns]
y = df['Category']

# --- 3. Dividir Datos ---
X_train, X_test, y_train, y_test = train_test_split(
    X, y, 
    test_size=0.25, 
    random_state=42,
    stratify=y
)

# --- 4. Entrenar con XGBoost ---
print("Entrenando modelo XGBoost con 10 features replicables...")
model = XGBClassifier(
    random_state=42, 
    use_label_encoder=False, 
    eval_metric='logloss'
)

model.fit(X_train, y_train)

# --- 5. Evaluar y Guardar ---
print("Evaluando modelo...")
y_pred = model.predict(X_test)

print("\nReporte de Clasificación (Modelo Final):")
report = classification_report(
    y_test, 
    y_pred, 
    target_names=['Control (0)', 'Demencia (1)']
)
print(report)

model_filename = 'modelo_prototipo.pkl'
joblib.dump(model, model_filename)
print(f"¡Éxito! Modelo final guardado como '{model_filename}'")
print("--- Fin del Paso 1 ---")
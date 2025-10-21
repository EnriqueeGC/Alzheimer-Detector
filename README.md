Proyecto: Detección Automática de Demencia mediante Análisis Lingüístico

Este proyecto implementa un sistema capaz de predecir la posible presencia de demencia a partir del análisis de transcripciones de texto, utilizando un modelo de Machine Learning (XGBoost) entrenado con características lingüísticas.

Resumen del Proyecto

El sistema se compone de tres elementos principales:

    El Conjunto de Datos (feature_set_dem.csv): Un conjunto de datos numéricos que sirve como material de entrenamiento. No contiene texto crudo, sino 19 características (features) lingüísticas, léxicas y semánticas extraídas de transcripciones del corpus "Pitt Cookie Theft" de DementiaBank. La columna objetivo es Category (0 = Control, 1 = Demencia).

    El Modelo de IA (modelo_prototipo.pkl): Un clasificador binario (XGBoost) entrenado para recibir un conjunto de 10 características numéricas de un nuevo paciente y predecir si pertenece a la categoría 0 (Control) o 1 (Demencia).

    El Agente de Procesamiento (prototipo.py): Un componente funcional que actúa como puente entre el usuario y el modelo. Recibe un texto crudo en inglés, utiliza bibliotecas de Procesamiento de Lenguaje Natural (PLN) para calcular en tiempo real las 10 características que el modelo necesita, y devuelve la predicción del modelo.

Metodología y Fuente de Datos

El núcleo de este proyecto se basa en la capacidad de cuantificar el habla humana para detectar patrones asociados con el deterioro cognitivo.

El Conjunto de Datos

El archivo feature_set_dem.csv es un conjunto de características precalculadas basado en el corpus Pitt Cookie Theft de DementiaBank, un estándar académico para esta tarea.

La metodología para la extracción de estas características se inspira en el trabajo documentado en el repositorio Automatic_Alzheimer_Detection de Chirag Agarwall. Este repositorio detalla el proceso para:

    Procesar las transcripciones originales del corpus (eliminando etiquetas CHAT, etc.).

    Extraer un conjunto completo de características lingüísticas, sintácticas y de legibilidad.

Nuestro Modelo

Para nuestro prototipo, seleccionamos 10 características clave de este conjunto, eligiendo aquellas que podíamos replicar de forma fiable a partir de texto crudo (ej. TTR, concept_count, ARI, NP_count).

Se entrenó un modelo XGBoost (Extreme Gradient Boosting) utilizando estas 10 características. Se eligió XGBoost por su alta eficacia y precisión en datos tabulares, superando a otros algoritmos en nuestras pruebas. El modelo resultante (modelo_prototipo.pkl) alcanzó una sensibilidad (recall) del 74% para la clase "Demencia", demostrando ser una herramienta robusta para la identificación de casos positivos.

🚀 Instalación y Puesta en Marcha

Sigue estos pasos para configurar el entorno y ejecutar la aplicación.

Prerrequisitos

    Python: Se requiere la versión 3.10.8.

1. Aplicación NLP (Servicio del Modelo)

Esta carpeta contiene el agente inteligente y la API de Flask que sirve el modelo de IA.

No olvides descargar tu API de google https://aistudio.google.com/

# 1. Navega a la carpeta nlp
cd nlp

# 2. Crea un entorno virtual
python -m venv venv

# 3. Activa el entorno virtual
# En macOS/Linux:
source venv/bin/activate
# En Windows:
.\venv\Scripts\activate

# 4. Instala las dependencias
pip install -r requirements.txt

# 5. Ejecuta la aplicación Flask
uvicorn app.main:app --reload

2. Instalación del Backend

Sigue los pasos necesarios para levantar el servidor del backend.

# 1. Navega a la carpeta del backend
cd ../backend-folder

# 2. (Agrega aquí los comandos específicos de tu backend)
# Ejemplo:
npm install
npm start

3. Instalación del Frontend

Finalmente, levanta la aplicación cliente.

# 1. Navega a la carpeta del frontend
cd ../frontend

# 2. Instala las dependencias

npm install
npm run dev

📋 Uso

Una vez que los tres componentes (NLP, Backend, Frontend) estén en ejecución:

    Accede a la aplicación a través de tu navegador (generalmente http://localhost:5173/ o la URL que tu frontend indique).

    Introduce el texto del paciente (descripción de la imagen "Cookie Theft") en el área de texto. El texto debe estar en inglés.

    El sistema procesará el texto, extraerá las 10 características, las enviará al modelo y devolverá la predicción (Control o Demencia) junto con el porcentaje de confianza.
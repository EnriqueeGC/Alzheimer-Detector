import React from 'react';

// Un simple componente de "badge" o "etiqueta" para los nombres técnicos
const TechBadge: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <code className="px-2 py-1 bg-gray-200 text-gray-800 rounded-md text-sm font-mono">
    {children}
  </code>
);

const AboutPage: React.FC = () => {
  // Lista de features extraída de tu 'modeloFinal.py' y 'services.py'
  const features = [
    { name: 'ttr', description: 'Type-Token Ratio (riqueza léxica).' },
    { name: 'R', description: 'Estadística de Honore (riqueza léxica).' },
    { name: 'num_concepts_mentioned', description: 'Número de conceptos clave de la imagen.' },
    { name: 'ARI', description: 'Índice de legibilidad (Automated Readability Index).' },
    { name: 'CLI', description: 'Índice de Coleman-Liau (complejidad).' },
    { name: 'prp_count', description: 'Conteo de pronombres personales.' },
    { name: 'VP_count', description: 'Conteo de Frases Verbales (Verb Phrases).' },
    { name: 'NP_count', description: 'Conteo de Frases Nominales (Noun Phrases).' },
    { name: 'prp_noun_ratio', description: 'Ratio de pronombres sobre sustantivos.' },
    { name: 'word_sentence_ratio', description: 'Palabras promedio por oración.' },
  ];

  return (
    // Contenedor principal de la "caja blanca", similar al de TestPage
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl p-8 md:p-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Acerca de este Prototipo
      </h2>

      <div className="space-y-8 text-gray-700 leading-relaxed">
        
        <section>
          <p className="text-lg">
            Esta aplicación es un prototipo universitario diseñado para explorar la
            detección temprana de signos de demencia (como el Alzheimer) mediante
            el análisis del lenguaje. El sistema analiza una descripción verbal de
            la imagen del "Cookie Theft" para identificar patrones lingüísticos
            específicos.
          </p>
        </section>

        {/* --- SECCIÓN 1: CÓMO FUNCIONA --- */}
        <section>
          <h3 className="text-2xl font-semibold mb-4 text-gray-700 border-b pb-2">
            ¿Cómo Funciona el Proceso?
          </h3>
          <ol className="list-decimal list-outside ml-6 space-y-4">
            <li>
              <strong>Entrada de Voz o Texto:</strong> El usuario graba su voz o
              escribe la descripción de la imagen.
            </li>
            <li>
              <strong>Transcripción (Audio):</strong> Si es audio, la voz se envía
              a un modelo <TechBadge>Whisper (medium)</TechBadge> que la convierte
              en texto en español.
            </li>
            <li>
              <strong>Traducción:</strong> El texto en español se traduce
              automáticamente al inglés usando la API de <TechBadge>Google Gemini</TechBadge>.
              Esto es crucial, ya que el modelo de análisis lingüístico (NLP) fue
              entrenado con textos en inglés.
            </li>
            <li>
              <strong>Extracción de Patrones:</strong> El texto en inglés se
              procesa para extraer <strong>10 características lingüísticas</strong> (ver
              siguiente sección). Estas características (o "features") son los
              patrones que busca el modelo.
            </li>
            <li>
              <strong>Predicción:</strong> El vector de estas 10 características se
              pasa al modelo de Machine Learning, que genera una predicción.
            </li>
          </ol>
        </section>

        {/* --- SECCIÓN 2: CREACIÓN DEL MODELO --- */}
        <section>
          <h3 className="text-2xl font-semibold mb-4 text-gray-700 border-b pb-2">
            Creación del Modelo
          </h3>
          <p className="mb-4">
            El corazón de este prototipo es un modelo de Machine Learning
            entrenado para clasificar un texto como "Control" (sano) o "Demencia".
          </p>
          <ul className="list-disc list-outside ml-6 space-y-2">
            <li>
              <strong>Tipo de Modelo:</strong> Se utilizó un clasificador
              <TechBadge>XGBClassifier</TechBadge> (Extreme Gradient Boosting),
              conocido por su alta precisión y eficiencia.
            </li>
            <li>
              <strong>Datos de Entrenamiento:</strong> El modelo fue entrenado con
              un conjunto de datos (<code>feature_set_dem.csv</code>) que
              contenía muestras de habla previamente etiquetadas de ambos grupos.
            </li>
            <li>
              <strong>Resultado:</strong> El modelo entrenado se guardó en el
              archivo <TechBadge>modelo_prototipo.pkl</TechBadge>, que es el que
              utiliza la API para hacer predicciones en tiempo real.
            </li>
          </ul>
        </section>

        {/* --- SECCIÓN 3: LOS PATRONES UTILIZADOS --- */}
        <section>
          <h3 className="text-2xl font-semibold mb-4 text-gray-700 border-b pb-2">
            Los Patrones Lingüísticos (Features)
          </h3>
          <p className="mb-4">
            El modelo no "entiende" el texto; busca patrones numéricos.
            Específicamente, se basa en estas 10 características extraídas del
            texto traducido:
          </p>
          <ul className="list-disc list-outside ml-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
            {features.map((feature) => (
              <li key={feature.name}>
                <TechBadge>{feature.name}</TechBadge>: {feature.description}
              </li>
            ))}
          </ul>
        </section>

        {/* --- SECCIÓN 4: CÁLCULO DE CONFIANZA --- */}
        <section>
          <h3 className="text-2xl font-semibold mb-4 text-gray-700 border-b pb-2">
            ¿Cómo se calcula la Confianza?
          </h3>
          <p>
            El modelo <TechBadge>XGBClassifier</TechBadge> no solo da una
            respuesta de "Control" o "Demencia". En realidad, utiliza una función
            llamada <code>predict_proba()</code> para generar la
            <strong>probabilidad</strong> de pertenencia a cada clase.
          </p>
          <p className="mt-2">
            Por ejemplo, una predicción puede ser <code>[0.15, 0.85]</code>.
            Esto significa que el modelo está:
          </p>
          <ul className="list-disc list-outside ml-6 my-2">
            <li>15% seguro de que es "Control".</li>
            <li>85% seguro de que es "Demencia".</li>
          </ul>
          <p>
            El sistema toma la probabilidad más alta (85%) como el
            <strong>porcentaje de confianza</strong> y asigna la etiqueta
            correspondiente ("Demencia").
          </p>
        </section>

        {/* --- DISCLAIMER --- */}
        <section className="border-t pt-6 mt-8 text-center">
          <p className="text-sm text-gray-500 font-semibold">
            IMPORTANTE: Este es un prototipo con fines académicos y de
            investigación. No debe ser utilizado como una herramienta de
            diagnóstico médico real.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
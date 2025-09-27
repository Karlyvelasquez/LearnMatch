import pickle
import numpy as np
import os
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from openai import OpenAI
import traceback
import logging
import os
import gdown
import pickle  

# Rutas locales
MODEL_PATH = "random_forest_learningstyle.pkl"
SCALER_PATH = "scaler_learningstyle.pkl"

# IDs de Google Drive
MODEL_FILE_ID = "1DmoFfFjCseNLu7Hzkf7NWRyHYOmKHU9B"
SCALER_FILE_ID = "18HnGg1sefBMQEglf2LmoB3TrVxhfePER"

# URLs directas para gdown
MODEL_URL = f"https://drive.google.com/uc?id={MODEL_FILE_ID}"
SCALER_URL = f"https://drive.google.com/uc?id={SCALER_FILE_ID}"

def download_if_not_exists(path, url):
    if not os.path.exists(path):
        print(f" Descargando {path} desde Google Drive...")
        gdown.download(url, path, quiet=False)
    else:
        print(f"{path} ya existe localmente")

# Descargamos si es necesario
download_if_not_exists(MODEL_PATH, MODEL_URL)
download_if_not_exists(SCALER_PATH, SCALER_URL)

# Luego carga los archivos normalmente
with open(MODEL_PATH, "rb") as f:
    model = pickle.load(f)

with open(SCALER_PATH, "rb") as f:
    scaler = pickle.load(f)

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Cargar variables de entorno
load_dotenv()
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
openai_client = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None

# Inicializar Flask
app = Flask(__name__)
CORS(app)

# Mapeo de clases para estilos de aprendizaje 
CLASS_LABELS = {0: "Visual", 1: "Auditivo", 2: "Kinestésico", 3: "Lectura/Escritura"}

# Cargar modelo entrenado 
try:
    with open("random_forest_learningstyle.pkl", "rb") as file:
        model = pickle.load(file)
    logger.info("Modelo cargado exitosamente")
    
    # Cargar el scaler 
    try:
        with open("scaler_learningstyle.pkl", "rb") as file:
            scaler = pickle.load(file)
        logger.info("Scaler cargado exitosamente")
        SCALER_AVAILABLE = True
    except Exception as e:
        logger.error(f"Error cargando scaler: {str(e)}")
        scaler = None
        SCALER_AVAILABLE = False
    
    MODEL_AVAILABLE = True
    
    # Verificar información del modelo
    if hasattr(model, 'n_features_in_'):
        logger.info(f"Modelo espera {model.n_features_in_} features")
    if hasattr(model, 'classes_'):
        logger.info(f"Clases del modelo: {model.classes_}")
    if SCALER_AVAILABLE and hasattr(scaler, 'mean_'):
        logger.info(f"Scaler configurado con {len(scaler.mean_)} features")
        
except Exception as e:
    logger.error(f"Error cargando modelo: {str(e)}")
    model = None
    scaler = None
    MODEL_AVAILABLE = False
    SCALER_AVAILABLE = False

# Lista de features que espera el modelo
FEATURE_NAMES = [
    "StudyHours", "Attendance", "Resources", "Extracurricular", "Motivation",
    "Internet", "Gender", "Age", "OnlineCourses", "Discussions",
    "AssignmentCompletion", "ExamScore", "EduTech", "StressLevel", "FinalGrade"
]

@app.route("/", methods=["GET"])
def index():
    return render_template("index.html")

@app.route("/api/predict", methods=["POST"])
def api_predict():
    if not MODEL_AVAILABLE:
        return jsonify({"error": "Modelo no disponible"}), 503
    
    if not SCALER_AVAILABLE:
        return jsonify({"error": "Scaler no disponible - modelo requiere normalización"}), 503
    
    try:
        data = request.get_json()
        logger.info(f"Datos recibidos: {data}")
        
        # Validar que todos los campos estén presentes
        missing_fields = [f for f in FEATURE_NAMES if f not in data]
        if missing_fields:
            return jsonify({
                "error": f"Campos faltantes: {missing_fields}",
                "status": "validation_error"
            }), 400
        
        # Extraer y convertir datos
        inputs = []
        for feature in FEATURE_NAMES:
            try:
                value = float(data.get(feature, 0))
                inputs.append(value)
            except (ValueError, TypeError):
                return jsonify({
                    "error": f"Valor inválido para {feature}: {data.get(feature)}",
                    "status": "validation_error"
                }), 400
        
        logger.info(f"Features procesadas: {dict(zip(FEATURE_NAMES, inputs))}")
        
        # Crear array de features
        features_raw = np.array([inputs])
        logger.info(f"Shape del array sin escalar: {features_raw.shape}")
        
        # ESCALAR LOS DATOS 
        features_scaled = scaler.transform(features_raw)
        logger.info(f"Datos escalados: {features_scaled[0]}")
        
        # Hacer predicción con datos escalados
        pred_class = model.predict(features_scaled)[0]
        probabilities = model.predict_proba(features_scaled)[0]
        
        logger.info(f"Predicción: {pred_class}, Probabilidades: {probabilities}")
        
        result = {
            "prediction": CLASS_LABELS.get(pred_class, "Desconocido"),
            "prediction_class": int(pred_class),
            "probabilities": {CLASS_LABELS[i]: float(p) for i, p in enumerate(probabilities)},
            "input_features": dict(zip(FEATURE_NAMES, inputs)),
            "scaled_features": features_scaled[0].tolist(),  # Para debugging
            "status": "success"
        }
        
        logger.info(f"Resultado final: {result}")
        return jsonify(result)
        
    except Exception as e:
        error_msg = str(e)
        logger.error(f"Error en predicción: {error_msg}")
        logger.error(f"Traceback: {traceback.format_exc()}")
        return jsonify({
            "error": error_msg,
            "traceback": traceback.format_exc() if app.debug else None,
            "status": "model_error"
        }), 500

@app.route("/api/debug", methods=["GET"])
def debug_model():
    """Endpoint para debugging del modelo"""
    if not MODEL_AVAILABLE:
        return jsonify({"error": "Modelo no disponible"}), 503
    
    debug_info = {
        "model_type": type(model).__name__,
        "expected_features": len(FEATURE_NAMES),
        "feature_names": FEATURE_NAMES,
        "class_labels": CLASS_LABELS,
    }
    
    # Información adicional del modelo si está disponible
    if hasattr(model, 'n_features_in_'):
        debug_info["model_n_features"] = model.n_features_in_
    if hasattr(model, 'classes_'):
        debug_info["model_classes"] = model.classes_.tolist()
    if hasattr(model, 'feature_importances_'):
        debug_info["feature_importances"] = dict(zip(FEATURE_NAMES, model.feature_importances_.tolist()))
    
    return jsonify(debug_info)

@app.route("/api/test-prediction", methods=["GET"])
def test_prediction():
    """Endpoint para probar el modelo con datos de ejemplo variados"""
    if not MODEL_AVAILABLE:
        return jsonify({"error": "Modelo no disponible"}), 503
    
    if not SCALER_AVAILABLE:
        return jsonify({"error": "Scaler no disponible"}), 503
    
    # Crear 4 casos de prueba diferentes
    test_cases = [
        # Caso 1: Estudiante visual (muchos recursos visuales, alta asistencia)
        [6, 95, 9, 3, 8, 1, 0, 20, 5, 4, 95, 85, 1, 3, 4.2],
        # Caso 2: Estudiante auditivo (discusiones altas, cursos online)
        [4, 80, 5, 7, 7, 1, 1, 22, 8, 9, 85, 75, 1, 4, 3.8],
        # Caso 3: Estudiante kinestésico (actividades extracurriculares altas)
        [3, 70, 6, 9, 6, 1, 0, 19, 3, 6, 80, 70, 0, 6, 3.5],
        # Caso 4: Estudiante lectura/escritura (alta completion, bajo tech)
        [8, 98, 8, 2, 9, 1, 1, 21, 2, 3, 98, 90, 0, 2, 4.5]
    ]
    
    results = []
    for i, test_data in enumerate(test_cases):
        # Escalar los datos de prueba
        features_raw = np.array([test_data])
        features_scaled = scaler.transform(features_raw)
        
        pred_class = model.predict(features_scaled)[0]
        probabilities = model.predict_proba(features_scaled)[0]
        
        results.append({
            "test_case": i + 1,
            "input_raw": dict(zip(FEATURE_NAMES, test_data)),
            "input_scaled": features_scaled[0].tolist(),
            "prediction": CLASS_LABELS.get(pred_class, "Desconocido"),
            "prediction_class": int(pred_class),
            "probabilities": {CLASS_LABELS[j]: float(p) for j, p in enumerate(probabilities)}
        })
    
    return jsonify({"test_results": results})

@app.route("/api/generate-feedback", methods=["POST"])
def generate_feedback():
    if not openai_client:
        return jsonify({"error": "OpenAI no configurado"}), 500
    try:
        data = request.get_json()
        personal_data = data.get("personal_data", {})
        learning_style = data.get("learning_style", "Desconocido")
        
        prompt = f"""
Eres un pedagogo especializado en estilos de aprendizaje. Saluda cordialmente al estudiante, no digas todos sus datos, solo di su carrera. Su estilo de aprendizaje es "{learning_style}"

Información del estudiante:

Edad: {personal_data.get('age_range', 'No especificado')}

Carrera: {personal_data.get('career', 'No especificado')}

Semestre: {personal_data.get('academic_level', 'No especificado')}

Actividades favoritas: {personal_data.get('hobbies', 'No especificado')}

Situación de vivienda: {personal_data.get('living_situation', 'No especificado')}

Trabajo: {personal_data.get('work_status', 'No especificado')}

Dificultades de aprendizaje: {personal_data.get('learning_challenges', 'No especificado')}

Con esta información, dale recomendaciones personalizadas y prácticas que pueda aplicar en su vida académica, trata de ser extenso y no tan corto. Incluye:

Estrategias de estudio adaptadas a su estilo de aprendizaje.

Técnicas que pueda usar en su día a día.

Libros o recursos gratuitos en línea que puedan ayudarle.

Aplicaciones útiles (de organización, memorización, concentración, etc.).

Consejos prácticos relacionados con su contexto personal (su carrera, semestre, hobbies, trabajo o situación de vivienda).

El objetivo es motivarlo, orientarlo y ofrecerle herramientas concretas que realmente le sirvan para mejorar su manera de aprender.
por favor La respuesta debe estar organizada en secciones numeradas y claras, sin utilizar asteriscos ni símbolos especiales.

"""
        
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Eres un pedagogo especializado en estilos de aprendizaje y educación personalizada."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1200,
            temperature=0.7
        )
        
        return jsonify({
            "feedback": response.choices[0].message.content,
            "status": "success"
        })
        
    except Exception as e:
        logger.error(f"Error en generate_feedback: {str(e)}")
        traceback.print_exc()
        return jsonify({
            "error": str(e), 
            "status": "openai_error"
        }), 500

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({
        "status": "healthy" if MODEL_AVAILABLE else "model_unavailable",
        "openai": bool(openai_client),
        "model_info": {
            "available": MODEL_AVAILABLE,
            "scaler_available": SCALER_AVAILABLE,
            "type": type(model).__name__ if model else None,
            "expected_features": len(FEATURE_NAMES)
        }
    })

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
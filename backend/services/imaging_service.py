"""
ONNX model service for diagnostic imaging
"""
import os
from PIL import Image
import numpy as np
import onnxruntime as ort
from huggingface_hub import hf_hub_download
from typing import Optional, Dict, Any

# Cache for loaded models
_model_cache: Dict[str, ort.InferenceSession] = {}

# HuggingFace repository for models (configurable via environment)
HF_REPO_ID = os.getenv("HF_MODEL_REPO", "aaburakhia/Pneumonia-Detector-CareAI")


def load_model(model_filename: str) -> Optional[ort.InferenceSession]:
    """
    Loads an ONNX model from HuggingFace Hub.
    Uses caching to avoid reloading models.
    """
    if model_filename in _model_cache:
        return _model_cache[model_filename]
    
    local_dir = "models"
    os.makedirs(local_dir, exist_ok=True)
    model_path = os.path.join(local_dir, model_filename)
    
    if not os.path.exists(model_path):
        try:
            hf_hub_download(repo_id=HF_REPO_ID, filename=model_filename, local_dir=local_dir)
        except Exception as e:
            print(f"Error downloading model '{model_filename}': {e}")
            return None
    
    try:
        session = ort.InferenceSession(model_path)
        _model_cache[model_filename] = session
        return session
    except Exception as e:
        print(f"Failed to load ONNX model '{model_filename}': {e}")
        return None


def preprocess_for_pneumonia(image: Image.Image) -> np.ndarray:
    """Preprocess image for pneumonia detection model"""
    img_resized = image.resize((150, 150)).convert('RGB')
    img_array = (np.array(img_resized) / 255.0).astype(np.float32)
    return np.expand_dims(img_array, axis=0)


def preprocess_for_breast_cancer(image: Image.Image) -> np.ndarray:
    """Preprocess image for breast cancer detection model"""
    img_resized = image.resize((224, 224)).convert('RGB')
    img_array = (np.array(img_resized) / 255.0).astype(np.float32)
    return np.expand_dims(img_array, axis=0)


def preprocess_for_kidney_cancer(image: Image.Image) -> np.ndarray:
    """Preprocess image for kidney cancer detection model"""
    img_resized = image.resize((224, 224)).convert('RGB')
    img_array = (np.array(img_resized) / 255.0).astype(np.float32)
    return np.expand_dims(img_array, axis=0)


def preprocess_for_brain_cancer(image: Image.Image) -> np.ndarray:
    """Preprocess image for brain cancer detection model"""
    img_resized = image.resize((224, 224)).convert('RGB')
    img_array = (np.array(img_resized) / 255.0).astype(np.float32)
    return np.expand_dims(img_array, axis=0)


def analyze_pneumonia(image: Image.Image) -> Dict[str, Any]:
    """Analyze chest X-ray for pneumonia"""
    try:
        session = load_model("model.onnx")
        if session is None:
            return {"success": False, "error": "Failed to load pneumonia model"}
        
        processed_image = preprocess_for_pneumonia(image)
        input_name = session.get_inputs()[0].name
        output_name = session.get_outputs()[0].name
        outputs = session.run([output_name], {input_name: processed_image})
        score = float(outputs[0][0][0])
        
        if score > 0.7:
            return {
                "success": True,
                "finding": "Pneumonia Likely Detected",
                "confidence": score * 100
            }
        else:
            return {
                "success": True,
                "finding": "Pneumonia Not Detected",
                "confidence": (1 - score) * 100
            }
    except Exception as e:
        return {"success": False, "error": str(e)}


def analyze_breast_cancer(image: Image.Image) -> Dict[str, Any]:
    """Analyze mammogram for breast cancer"""
    try:
        session = load_model("breast_cancer_classifier.onnx")
        if session is None:
            return {"success": False, "error": "Failed to load breast cancer model"}
        
        processed_image = preprocess_for_breast_cancer(image)
        input_name = session.get_inputs()[0].name
        output_name = session.get_outputs()[0].name
        outputs = session.run([output_name], {input_name: processed_image})
        score = float(outputs[0][0][0])
        
        if score > 0.5:
            return {
                "success": True,
                "finding": "Benign Cells Detected",
                "confidence": score * 100
            }
        else:
            return {
                "success": True,
                "finding": "Malignant Cells Likely Detected",
                "confidence": (1 - score) * 100
            }
    except Exception as e:
        return {"success": False, "error": str(e)}


def analyze_kidney_cancer(image: Image.Image) -> Dict[str, Any]:
    """Analyze CT scan for kidney cancer"""
    try:
        session = load_model("kidney_cancer_model.onnx")
        if session is None:
            return {"success": False, "error": "Failed to load kidney cancer model"}
        
        processed_image = preprocess_for_kidney_cancer(image)
        input_name = session.get_inputs()[0].name
        output_name = session.get_outputs()[0].name
        outputs = session.run([output_name], {input_name: processed_image})
        score = float(outputs[0][0][0])
        
        if score > 0.5:
            return {
                "success": True,
                "finding": "Tumor Likely Detected",
                "confidence": score * 100
            }
        else:
            return {
                "success": True,
                "finding": "No Tumor Detected",
                "confidence": (1 - score) * 100
            }
    except Exception as e:
        return {"success": False, "error": str(e)}


def analyze_brain_cancer(image: Image.Image) -> Dict[str, Any]:
    """Analyze MRI for brain cancer"""
    try:
        session = load_model("brain_cancer_model.onnx")
        if session is None:
            return {"success": False, "error": "Failed to load brain cancer model"}
        
        processed_image = preprocess_for_brain_cancer(image)
        input_name = session.get_inputs()[0].name
        output_name = session.get_outputs()[0].name
        outputs = session.run([output_name], {input_name: processed_image})
        
        scores = outputs[0][0]
        predicted_class_index = np.argmax(scores)
        confidence = float(scores[predicted_class_index]) * 100
        
        class_names = ["Glioma Tumor", "Meningioma Tumor", "Tumor"]
        finding = class_names[predicted_class_index]
        
        return {
            "success": True,
            "finding": finding,
            "confidence": confidence
        }
    except Exception as e:
        return {"success": False, "error": str(e)}

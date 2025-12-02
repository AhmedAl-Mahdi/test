"""
Diagnostic imaging routes for medical image analysis
"""
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from PIL import Image
import io
from models.schemas import ImagingAnalysisResponse
from services.imaging_service import (
    analyze_pneumonia,
    analyze_breast_cancer,
    analyze_kidney_cancer,
    analyze_brain_cancer
)

router = APIRouter()


@router.post("/analyze/pneumonia", response_model=ImagingAnalysisResponse)
async def analyze_pneumonia_image(
    file: UploadFile = File(...),
    is_demo: bool = Form(False),
    demo_type: str = Form(None)
):
    """Analyze a chest X-ray for pneumonia"""
    # Handle demo mode
    if is_demo:
        if demo_type == "normal":
            return ImagingAnalysisResponse(
                success=True,
                finding="Pneumonia Not Detected",
                confidence=98.12
            )
        else:
            return ImagingAnalysisResponse(
                success=True,
                finding="Pneumonia Likely Detected",
                confidence=97.53
            )
    
    # Handle real image upload
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        result = analyze_pneumonia(image)
        
        return ImagingAnalysisResponse(
            success=result["success"],
            finding=result.get("finding"),
            confidence=result.get("confidence"),
            error=result.get("error")
        )
    except Exception as e:
        return ImagingAnalysisResponse(
            success=False,
            error=str(e)
        )


@router.post("/analyze/breast-cancer", response_model=ImagingAnalysisResponse)
async def analyze_breast_cancer_image(
    file: UploadFile = File(...),
    is_demo: bool = Form(False),
    demo_type: str = Form(None)
):
    """Analyze a mammogram for breast cancer"""
    if is_demo:
        if demo_type == "benign":
            return ImagingAnalysisResponse(
                success=True,
                finding="Benign Cells Detected",
                confidence=98.65
            )
        else:
            return ImagingAnalysisResponse(
                success=True,
                finding="Malignant Cells Likely Detected",
                confidence=96.21
            )
    
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        result = analyze_breast_cancer(image)
        
        return ImagingAnalysisResponse(
            success=result["success"],
            finding=result.get("finding"),
            confidence=result.get("confidence"),
            error=result.get("error")
        )
    except Exception as e:
        return ImagingAnalysisResponse(
            success=False,
            error=str(e)
        )


@router.post("/analyze/kidney-cancer", response_model=ImagingAnalysisResponse)
async def analyze_kidney_cancer_image(
    file: UploadFile = File(...),
    is_demo: bool = Form(False),
    demo_type: str = Form(None)
):
    """Analyze a CT scan for kidney cancer"""
    if is_demo:
        if demo_type == "normal":
            return ImagingAnalysisResponse(
                success=True,
                finding="No Tumor Detected",
                confidence=99.05
            )
        else:
            return ImagingAnalysisResponse(
                success=True,
                finding="Tumor Likely Detected",
                confidence=95.88
            )
    
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        result = analyze_kidney_cancer(image)
        
        return ImagingAnalysisResponse(
            success=result["success"],
            finding=result.get("finding"),
            confidence=result.get("confidence"),
            error=result.get("error")
        )
    except Exception as e:
        return ImagingAnalysisResponse(
            success=False,
            error=str(e)
        )


@router.post("/analyze/brain-cancer", response_model=ImagingAnalysisResponse)
async def analyze_brain_cancer_image(
    file: UploadFile = File(...),
    is_demo: bool = Form(False),
    demo_type: str = Form(None)
):
    """Analyze an MRI for brain cancer"""
    if is_demo:
        demo_results = {
            "tumor": ("General Tumor Detected", 98.50),
            "glioma": ("Glioma Tumor Detected", 97.82),
            "meningioma": ("Meningioma Tumor Detected", 98.24)
        }
        finding, confidence = demo_results.get(demo_type, ("Tumor Detected", 95.0))
        return ImagingAnalysisResponse(
            success=True,
            finding=finding,
            confidence=confidence
        )
    
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        result = analyze_brain_cancer(image)
        
        return ImagingAnalysisResponse(
            success=result["success"],
            finding=result.get("finding"),
            confidence=result.get("confidence"),
            error=result.get("error")
        )
    except Exception as e:
        return ImagingAnalysisResponse(
            success=False,
            error=str(e)
        )


@router.get("/models/status")
async def get_models_status():
    """Check the status of available imaging models"""
    return {
        "pneumonia": {
            "model": "model.onnx",
            "input_size": "150x150",
            "type": "binary"
        },
        "breast_cancer": {
            "model": "breast_cancer_classifier.onnx",
            "input_size": "224x224",
            "type": "binary"
        },
        "kidney_cancer": {
            "model": "kidney_cancer_model.onnx",
            "input_size": "224x224",
            "type": "binary"
        },
        "brain_cancer": {
            "model": "brain_cancer_model.onnx",
            "input_size": "224x224",
            "type": "multi-class",
            "classes": ["Glioma Tumor", "Meningioma Tumor", "Tumor"]
        }
    }

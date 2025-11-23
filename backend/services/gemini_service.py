import os
import google.generativeai as genai
from typing import Dict, Any, List
from backend.core.config import settings

class GeminiService:
    def __init__(self):
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            print("Warning: GEMINI_API_KEY not found in settings.")
            self.model = None
        else:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel('gemini-2.0-flash')

    async def get_optimization_suggestions(self, architecture: Dict[str, Any], dataset_stats: Dict[str, Any], training_metrics: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not self.model:
            return {
                "error": "Gemini API key not configured",
                "suggestions": [],
                "analysis": "Please configure GEMINI_API_KEY to get AI suggestions."
            }

        prompt = self._construct_optimization_prompt(architecture, dataset_stats, training_metrics)
        
        try:
            response = await self.model.generate_content_async(prompt)
            return self._parse_response(response.text)
        except Exception as e:
            print(f"Error generating content: {e}")
            return {
                "error": str(e),
                "suggestions": [],
                "analysis": "Failed to generate suggestions."
            }

    def _construct_optimization_prompt(self, architecture: Dict[str, Any], dataset_stats: Dict[str, Any], training_metrics: List[Dict[str, Any]] = None) -> str:
        nodes = architecture.get('nodes', [])
        edges = architecture.get('edges', [])
        
        layers_desc = []
        for node in nodes:
            layer_type = node.get('data', {}).get('type', 'Unknown')
            config = node.get('data', {}).get('config', {})
            layers_desc.append(f"- {layer_type}: {config}")

        stats_desc = f"""
        Dataset Statistics:
        - Total Samples: {dataset_stats.get('totalSamples', 'Unknown')}
        - Image Size: {dataset_stats.get('imageSize', 'Unknown')}
        - Classes: {len(dataset_stats.get('classDistribution', {}))}
        - Noise Level: {dataset_stats.get('noiseLevel', 'Unknown')}
        """
        
        training_desc = "No previous training data available."
        if training_metrics and len(training_metrics) > 0:
            final_epoch = training_metrics[-1]
            training_desc = f"""
            Previous Training Session Results (Final Epoch):
            - Train Loss: {final_epoch.get('trainLoss', 'N/A')}
            - Validation Loss: {final_epoch.get('valLoss', 'N/A')}
            - Train Accuracy: {final_epoch.get('trainAcc', 'N/A')}
            - Validation Accuracy: {final_epoch.get('valAcc', 'N/A')}
            - Total Epochs Run: {len(training_metrics)}
            """

        return f"""
        Act as an expert Deep Learning Engineer. Analyze the following neural network architecture and dataset statistics to provide optimization suggestions.

        Architecture:
        {chr(10).join(layers_desc)}

        {stats_desc}

        {training_desc}

        Based on the architecture, dataset, and training results (if available), provide DETAILED optimization suggestions.
        If training results show overfitting (high val loss, low train loss), suggest regularization.
        If underfitting (high train loss), suggest capacity increase.
        If accuracy is low, suggest architecture changes.

        Provide the output in the following JSON format (do not use markdown code blocks, just raw JSON):
        {{
            "analysis": "Detailed paragraph analyzing the current architecture and training results. Discuss model capacity, overfitting/underfitting signs, and suitability for the dataset.",
            "suggestions": [
                {{
                    "parameter": "Name of layer or hyperparameter (e.g., 'Conv2d Layers', 'Learning Rate')",
                    "current_value": "Current value or 'N/A'",
                    "suggested_value": "Specific recommended value (e.g., 'Add BatchNorm', '0.0001')",
                    "reason": "Detailed technical reason for the change.",
                    "impact": "High/Medium/Low",
                    "category": "architecture/learning/regularization/optimization"
                }}
            ]
        }}
        """

    def _parse_response(self, response_text: str) -> Dict[str, Any]:
        import json
        import re
        
        try:
            # Clean up potential markdown formatting
            text = re.sub(r'```json\s*', '', response_text)
            text = re.sub(r'```\s*', '', text)
            text = text.strip()
            return json.loads(text)
        except json.JSONDecodeError:
            return {
                "analysis": response_text,
                "suggestions": []
            }

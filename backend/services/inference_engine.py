"""
Inference engine for running models and extracting layer outputs
"""
import torch
import torch.nn as nn
from typing import Dict, List, Any, Optional, Tuple
import numpy as np
import time
from backend.db.models import ModelVersion
from backend.services.model_builder import ModelBuilder

class InferenceEngine:
    """Engine for running inference and extracting layer-wise outputs"""
    
    def __init__(self, version: ModelVersion, device: str = 'cpu'):
        self.version = version
        self.model = None
        self.device = torch.device(device)
        self.hooks = []
        self.layer_outputs = []
        self._build_model()
    
    def _build_model(self) -> None:
        """Build PyTorch model from version architecture"""
        try:
            # Pass input_shape to ModelBuilder so it can infer Linear sizes
            input_shape = None
            try:
                # version.input_shape may be stored as list-like
                input_shape = list(self.version.input_shape) if getattr(self.version, 'input_shape', None) else None
            except Exception:
                input_shape = None

            builder = ModelBuilder(self.version.architecture, input_shape=input_shape)
            self.model = builder.build()
            self.model.to(self.device)
            self.model.eval()  # Set to evaluation mode
        except Exception as e:
            raise RuntimeError(f"Failed to build model: {str(e)}")
    
    def _is_leaf_module(self, module: nn.Module) -> bool:
        """Check if module is a leaf (no children)"""
        return len(list(module.children())) == 0
    
    def _get_layer_type(self, module: nn.Module) -> str:
        """Get the type name of a layer"""
        return module.__class__.__name__
    
    def _compute_activation_stats(self, tensor: torch.Tensor) -> Dict[str, float]:
        """Compute statistics for a tensor"""
        data = tensor.detach().cpu().numpy().astype(np.float32)
        return {
            "min": float(np.min(data)),
            "max": float(np.max(data)),
            "mean": float(np.mean(data)),
            "std": float(np.std(data)),
            "median": float(np.median(data)),
        }
    
    def _register_hooks(self) -> None:
        """Register forward hooks on all leaf modules"""
        if not self.model:
            raise RuntimeError("Model not built")
        
        self.layer_outputs = []
        
        def create_hook(name: str, layer_type: str):
            def hook(module, input, output):
                # Handle various output types
                if isinstance(output, torch.Tensor):
                    output_shape = list(output.shape)
                    stats = self._compute_activation_stats(output)
                    # Limit data size for large tensors
                    output_data = output.detach().cpu().numpy().flatten()[:10000].tolist()
                elif isinstance(output, tuple):
                    # Some modules return tuples
                    output_shape = list(output[0].shape) if isinstance(output[0], torch.Tensor) else []
                    stats = self._compute_activation_stats(output[0]) if isinstance(output[0], torch.Tensor) else {}
                    output_data = []
                else:
                    output_shape = []
                    stats = {}
                    output_data = []
                
                self.layer_outputs.append({
                    "layer_name": name,
                    "layer_type": layer_type,
                    "output_shape": output_shape,
                    "activation_stats": stats,
                    "output_data": output_data[:1000],  # Limit stored data
                })
            return hook
        
        # Register hooks for leaf modules
        for name, module in self.model.named_modules():
            if self._is_leaf_module(module):
                layer_type = self._get_layer_type(module)
                hook = module.register_forward_hook(create_hook(name, layer_type))
                self.hooks.append(hook)
    
    def _cleanup_hooks(self) -> None:
        """Remove all registered hooks"""
        for hook in self.hooks:
            hook.remove()
        self.hooks = []
    
    def run_inference(
        self,
        input_data: List[Any],
        input_shape: Optional[List[int]] = None
    ) -> Dict[str, Any]:
        """
        Run inference and return output with layer-wise activations
        
        Args:
            input_data: Flattened input data or numpy array
            input_shape: Optional shape to reshape input (e.g., [1, 3, 224, 224])
        
        Returns:
            Dict containing model output, layer outputs, and timing info
        """
        start_time = time.time()
        
        try:
            # Register hooks before inference
            self._register_hooks()
            
            # Convert input to tensor
            input_array = np.array(input_data, dtype=np.float32)
            
            # Reshape if needed
            if input_shape:
                try:
                    input_array = input_array.reshape(input_shape)
                except ValueError as e:
                    raise ValueError(f"Cannot reshape input to {input_shape}: {str(e)}")
            
            # Add batch dimension if needed
            if input_array.ndim == 3:  # (C, H, W)
                input_array = np.expand_dims(input_array, 0)
            
            input_tensor = torch.from_numpy(input_array).to(self.device)
            
            # Run forward pass
            with torch.no_grad():
                output = self.model(input_tensor)
            
            # Convert output to numpy
            predicted_class = None
            confidence = None
            
            if isinstance(output, torch.Tensor):
                output_np = output.detach().cpu().numpy()
                output_list = output_np.flatten().tolist()
                
                # For classification: compute predicted class and confidence
                if len(output_np.shape) == 2:  # Batch output
                    # Get probabilities if output looks like softmax (values between 0-1, sum ~1)
                    if output_np.shape[1] > 1:  # Multiple classes
                        # Apply softmax if not already applied
                        batch_output = output_np[0]  # First sample in batch
                        if np.max(batch_output) > 1.0 or np.sum(batch_output) < 0.99:
                            # Apply softmax
                            exp_output = np.exp(batch_output - np.max(batch_output))
                            probabilities = exp_output / exp_output.sum()
                        else:
                            probabilities = batch_output
                        
                        predicted_class = int(np.argmax(probabilities))
                        confidence = float(np.max(probabilities))
            else:
                output_list = []
            
            processing_time = time.time() - start_time
            
            return {
                "output": output_list,
                "layer_outputs": self.layer_outputs,
                "processing_time": processing_time,
                "output_shape": list(output.shape) if isinstance(output, torch.Tensor) else [],
                "predicted_class": predicted_class,
                "confidence": confidence,
            }
        
        except Exception as e:
            raise RuntimeError(f"Inference failed: {str(e)}")
        
        finally:
            # Always cleanup hooks
            self._cleanup_hooks()
    
    def get_model_config(self) -> Dict[str, Any]:
        """Get model configuration and input/output information"""
        if not self.model:
            raise RuntimeError("Model not built")
        
        return {
            "architecture": self.version.architecture,
            "input_shape": self.version.input_shape,
            "model_summary": str(self.model),
            "total_parameters": sum(p.numel() for p in self.model.parameters()),
            "trainable_parameters": sum(p.numel() for p in self.model.parameters() if p.requires_grad),
        }


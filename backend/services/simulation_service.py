import math
import random
import asyncio
from typing import Dict, Any, List

class SimulationService:
    def __init__(self):
        pass

    async def simulate_training(self, architecture: Dict[str, Any], dataset_stats: Dict[str, Any], training_config: Dict[str, Any]):
        """
        Generator that yields training metrics for each epoch.
        """
        epochs = training_config.get('epochs', 50)
        batch_size = training_config.get('batch_size', 32)
        learning_rate = training_config.get('learning_rate', 0.001)
        
        nodes = architecture.get('nodes', [])
        num_layers = len(nodes)
        
        # Simulation logic (ported and enhanced from frontend)
        complexity = math.log(max(num_layers, 1))
        base_loss = 2.5 + complexity * 0.3
        
        if dataset_stats:
            total_samples = dataset_stats.get('totalSamples', 5000)
            data_scale = math.log(total_samples) / math.log(10000)
            base_loss *= max(0.5, 1 - data_scale * 0.3)
            
            noise_level = dataset_stats.get('noiseLevel', 'none')
            noise_multiplier = {
                'none': 1.0,
                'low': 1.15,
                'medium': 1.35,
                'high': 1.6
            }
            base_loss *= noise_multiplier.get(noise_level, 1.0)
            
            if dataset_stats.get('augmentation'):
                base_loss *= 0.92

        for epoch in range(epochs):
            progress = (epoch + 1) / epochs
            noise_decay = math.exp(-progress * 3)
            
            # Training loss
            train_loss = base_loss * math.exp(-progress * 4) * (0.8 + random.random() * noise_decay * 0.4)
            
            # Validation loss
            overfitting_factor = 1 + max(0, progress - 0.7) * 0.5
            val_loss = train_loss * overfitting_factor * (0.95 + random.random() * 0.1)
            
            # Accuracy
            max_train_acc = min(0.99, 0.5 + progress * 0.5 * math.sqrt(1 / complexity))
            train_acc = max_train_acc * (0.9 + random.random() * 0.1 * noise_decay)
            
            max_val_acc = max_train_acc * (0.98 - max(0, progress - 0.7) * 0.1)
            val_acc = max_val_acc * (0.95 + random.random() * 0.05 * noise_decay)
            
            metrics = {
                "epoch": epoch + 1,
                "trainLoss": max(0.01, train_loss),
                "valLoss": max(0.01, val_loss),
                "trainAcc": min(1, train_acc),
                "valAcc": min(1, val_acc)
            }
            
            yield metrics
            await asyncio.sleep(0.1)  # Simulate processing time

    def generate_synthetic_batch(self, dataset_stats: Dict[str, Any], batch_size: int) -> Dict[str, Any]:
        """
        Generates info about a synthetic batch based on dataset stats.
        """
        if not dataset_stats:
            return {}

        class_dist = dataset_stats.get('classDistribution', {})
        total_samples = dataset_stats.get('totalSamples', 1)
        
        classes_in_batch = []
        for cls, count in list(class_dist.items())[:3]:  # Top 3 classes
            samples = math.ceil((count / total_samples) * batch_size)
            percentage = (count / total_samples) * 100
            classes_in_batch.append({
                "className": cls,
                "samplesInBatch": samples,
                "percentage": f"{percentage:.1f}"
            })
            
        return {
            "imageSize": dataset_stats.get('imageSize', [224, 224]),
            "channels": dataset_stats.get('channels', 3),
            "batchSize": batch_size,
            "classes": classes_in_batch,
            "augmentationTypes": ['Rotation', 'Zoom', 'Flip', 'Color Shift'] if dataset_stats.get('augmentation') else []
        }

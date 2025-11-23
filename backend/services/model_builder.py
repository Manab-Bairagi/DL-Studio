"""
Model builder for constructing PyTorch models from architecture definitions
"""
import torch
import torch.nn as nn
from typing import Dict, Any, List

class ModelBuilder:
    """Builds PyTorch models from JSON architecture definitions

    The builder can infer the `in_features` for `Linear` layers when the
    architecture does not explicitly provide them. To do that it needs an
    example `input_shape` (like [1,3,32,32]) which is used with a dummy
    tensor to compute the flattened feature size.
    """

    def __init__(self, architecture: Dict[str, Any], input_shape: List[int] | None = None):
        self.architecture = architecture
        self.input_shape = input_shape
        self.layers = []
    
    def build(self) -> nn.Module:
        """Build and return a PyTorch model"""
        layers: List[nn.Module] = []

        # Parse architecture and build layers sequentially. If we encounter
        # a Linear layer without an explicit `in_features`, compute it by
        # running a dummy forward pass through the already-built prefix
        # of the network using the provided `input_shape`.
        for layer_config in self.architecture.get("layers", []):
            layer_type = layer_config.get("type")
            params = layer_config.get("params", {})

            # If this is a Linear and in_features missing/invalid, infer it
            if layer_type in ("Linear", "Dense"):
                in_feat = params.get("in_features")
                if in_feat is None or (isinstance(in_feat, int) and in_feat <= 0):
                    # Need input shape to infer
                    if not self.input_shape:
                        raise ValueError(
                            "Cannot infer Linear.in_features because no input_shape was provided"
                        )

                    # Build a temporary sequential from the layers we've constructed so far
                    prefix = nn.Sequential(*layers) if layers else None

                    # Create dummy input tensor with batch size 1
                    dummy = torch.zeros(tuple(self.input_shape), dtype=torch.float32)
                    dummy = dummy.unsqueeze(0) if len(self.input_shape) == 3 else dummy

                    with torch.no_grad():
                        if prefix is not None and len(list(prefix.children())) > 0:
                            out = prefix(dummy)
                        else:
                            out = dummy

                    # Flatten and determine feature count
                    if isinstance(out, torch.Tensor):
                        flattened = out.view(out.size(0), -1)
                        inferred_in = int(flattened.size(1))
                    else:
                        raise ValueError("Unable to infer features from prefix output")

                    # Assign inferred value into params so _build_layer can use it
                    params = dict(params)  # copy
                    params["in_features"] = inferred_in
                    layer_config["params"] = params

            layer = self._build_layer(layer_config)
            if layer:
                layers.append(layer)

        return nn.Sequential(*layers)
    
    def _build_layer(self, config: Dict[str, Any]) -> nn.Module:
        """Build a single layer from configuration"""
        layer_type = config.get("type")
        params = config.get("params", {})
        # Helper to coerce ints/tuples from various input formats
        def _to_int(x, default=None):
            if x is None:
                return default
            if isinstance(x, int):
                return x
            if isinstance(x, str):
                try:
                    return int(x)
                except Exception:
                    raise ValueError(f"Cannot convert value to int: {x!r}")
            if isinstance(x, (list, tuple)) and len(x) == 1:
                return int(x[0])
            raise ValueError(f"Unsupported int format: {x!r}")

        def _to_tuple(x, default=None):
            if x is None:
                return default
            if isinstance(x, int):
                return x
            if isinstance(x, (list, tuple)):
                return tuple(x)
            if isinstance(x, str):
                # try comma separated
                parts = [p.strip() for p in x.split(',') if p.strip()]
                if len(parts) == 1:
                    return int(parts[0])
                return tuple(int(p) for p in parts)
            raise ValueError(f"Unsupported tuple format: {x!r}")

        try:
            if layer_type == "Conv2d":
                in_ch = _to_int(params.get("in_channels", 3))
                out_ch = _to_int(params.get("out_channels", 64))
                kernel = _to_tuple(params.get("kernel_size", 3))
                stride = _to_tuple(params.get("stride", 1))
                padding = _to_tuple(params.get("padding", 0))
                return nn.Conv2d(
                    in_channels=in_ch,
                    out_channels=out_ch,
                    kernel_size=kernel,
                    stride=stride,
                    padding=padding,
                )
        
            elif layer_type == "Dense" or layer_type == "Linear":
                in_f = _to_int(params.get("in_features", 128))
                out_f = _to_int(params.get("out_features", 64))
                return nn.Linear(
                    in_features=in_f,
                    out_features=out_f
                )
        
            elif layer_type == "MaxPool2d":
                k = _to_tuple(params.get("kernel_size", 2))
                s = _to_tuple(params.get("stride", 2))
                return nn.MaxPool2d(
                    kernel_size=k,
                    stride=s
                )
        
            elif layer_type == "AvgPool2d":
                k = _to_tuple(params.get("kernel_size", 2))
                s = _to_tuple(params.get("stride", 2))
                return nn.AvgPool2d(
                    kernel_size=k,
                    stride=s
                )
        
            elif layer_type == "BatchNorm2d":
                nf = _to_int(params.get("num_features", 64))
                return nn.BatchNorm2d(
                    num_features=nf
                )
        
            elif layer_type == "ReLU":
                return nn.ReLU()
            elif layer_type == "Sigmoid":
                return nn.Sigmoid()

            elif layer_type == "Tanh":
                return nn.Tanh()

            elif layer_type == "Dropout":
                p = params.get("p", 0.5)
                try:
                    p = float(p)
                except Exception:
                    raise ValueError(f"Dropout p must be float: {p!r}")
                return nn.Dropout(p=p)

            elif layer_type == "Flatten":
                # Support optional start_dim and end_dim
                start = params.get("start_dim", 1)
                end = params.get("end_dim", -1)
                try:
                    start = int(start)
                    end = int(end)
                except Exception:
                    raise ValueError(f"Flatten start_dim/end_dim must be ints: {start!r}, {end!r}")
                return nn.Flatten(start_dim=start, end_dim=end)

            elif layer_type == "AdaptiveAvgPool2d":
                out = params.get("output_size", (1, 1))
                out = _to_tuple(out, default=(1, 1))
                return nn.AdaptiveAvgPool2d(output_size=out)

        except Exception as e:
            # Provide contextual information about which layer failed
            raise ValueError(f"Failed to build layer {layer_type} with params {params!r}: {e}")

        # If no branch matched
        raise ValueError(f"Unsupported layer type: {layer_type}")


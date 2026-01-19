from typing import List, Dict, Any
from app.services.llm_service import llm_service
from app.prompt_engine.templates import BASE_TEMPLATE

class ChainService:
    def execute_chain(self, chain_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes a chain of prompts based on nodes and edges.
        
        chain_data structure expected:
        {
            "nodes": [
                {"id": "1", "data": {"label": "Prompt 1"}},
                ...
            ],
            "edges": [
                {"source": "1", "target": "2"},
                ...
            ]
        }
        """
        nodes = {node['id']: node for node in chain_data.get('nodes', [])}
        edges = chain_data.get('edges', [])
        
        # Build dependency graph
        adjacency = {node_id: [] for node_id in nodes}
        in_degree = {node_id: 0 for node_id in nodes}
        
        for edge in edges:
            source = edge['source']
            target = edge['target']
            if source in adjacency and target in adjacency:
                adjacency[source].append(target)
                in_degree[target] += 1
                
        # Topological sort (Kahn's algorithm)
        queue = [node_id for node_id, degree in in_degree.items() if degree == 0]
        execution_order = []
        
        while queue:
            node_id = queue.pop(0)
            execution_order.append(node_id)
            
            for neighbor in adjacency[node_id]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)
                    
        # Check for cycles
        if len(execution_order) != len(nodes):
            raise ValueError("Cycle detected in prompt chain")
            
        # Execute prompts (In this mode, we just collect text, acting as a Prompt Builder)
        results = {}
        
        for node_id in execution_order:
            node = nodes[node_id]
            prompt_content = node.get('data', {}).get('prompt', '')
            results[node_id] = prompt_content
            
        # Build Combined "Chain Prompt" using Template
        # This instructs the eventual consumer (AI) on how to execute the chain
        
        steps_text = []
        for idx, node_id in enumerate(execution_order):
            node = nodes[node_id]
            label = node.get('data', {}).get('label', f'Step {idx+1}')
            prompt = results.get(node_id, '')
            
            # Identify dependencies
            parent_ids = [edge['source'] for edge in edges if edge['target'] == node_id]
            
            context_instruction = ""
            if parent_ids:
                parent_labels = [nodes[pid].get('data', {}).get('label', f'Node {pid}') for pid in parent_ids]
                context_instruction = f"**Input Context**: Use the output from [{', '.join(parent_labels)}] as input for this step.\n"
            
            step_text = (
                f"## Step {idx + 1}: {label}\n"
                f"{context_instruction}"
                f"**Instruction**:\n{prompt}\n"
            )
            steps_text.append(step_text)
            
        combined_template = (
            "# Prompt Chain Instructions\n\n"
            "Please execute the following steps in sequence. "
            "Pass the output of each step as context/input to the next step(s) as specified.\n\n"
            f"{chr(10).join(steps_text)}"
        )
        
        final_output = combined_template
        mode = chain_data.get('mode', 'template')
        
        if mode == 'enhanced':
            try:
                final_output = llm_service.enhance_prompt(combined_template, is_chain=True)
            except Exception as e:
                final_output = f"Error during enhancement: {str(e)}"
            
        return {
            "step_results": results,
            # We use the key 'enhanced_output' for frontend compatibility for both modes
            "enhanced_output": final_output
        }

chain_service = ChainService()
